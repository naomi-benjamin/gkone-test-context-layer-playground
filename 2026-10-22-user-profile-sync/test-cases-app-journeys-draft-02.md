# User Profile Sync — App journey test cases (draft 02)

**Scope:** what happens to the remittance (`RemittanceUserProfiles`) and wallet (`UserProfiles`) profile copies as a customer or admin moves through the app and admin portal. Verification is by observing the app and by **reading** the Cosmos containers. Cases that need messages published by hand, direct database edits, cache flushes or outages are in `test-cases-manual-messaging-draft-02.md`.

**What changed from draft 01:** revised against the Profile IAM "Published events" review (code at IAM `58092ef`, remittances `e03fee0`, wallet `a28f5ca`). Change sources, field lists and flag states now come from that document. New cases cover sign-in syncs, the TRN-duplicate flip, the credit card application, and the deliberate non-publishers.

**Environment and flags (from the review):**

| Flag | QA value | Effect on these cases |
|---|---|---|
| `EnableProfileChangeOutboxDispatch` (IAM) | **true** | `UserProfileChanged` is published |
| `WalletUserProfileEventSyncEnabled` (wallet) | **true** | Wallet applies events. Read once at startup |
| `EnableRemittanceUserProfileEventSync` (remittance) | **false** | **Remittance doesn't read its subscription in QA.** Turn it on before the remittance-snapshot checks (it's re-read every minute, so no redeploy). Otherwise run those checks in Dev |
| `EnablePhoneNumberProfileMigration` (IAM) | [confirm] | Needed for a phone change to publish (TC 21, deferred) |
| `EnableIdentityConflictResolution` (IAM) | [confirm]; off in UAT | Needed for merge or conflict resolution to publish (TC 17, deferred) |

**Global preconditions** (not repeated per case):
- QA environment, with the flags above.
- Read access to `RemittanceUserProfiles` (Remittances DB, partition key `/userId`), wallet `UserProfiles` (partition key `/UserId`), and the User Profile IAM record.
- **Propagation:** IAM sweeps the outbox every 10 seconds. "Allow propagation" means waiting up to 1 minute before querying a snapshot.
- Remittance fields are camelCase; wallet fields are PascalCase.

---

## Happy path

TEST CASE 1
Title: Verify that a remittance snapshot is created from the User Profile service when an existing customer taps Send to start an outbound remittance

Tags: Remittances, User Profile Sync, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• The customer is KYC Tier 1 and eligible to send a WU Outbound remittance
• The customer has no document in `RemittanceUserProfiles` (they haven't used remittances since the feature was deployed)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Query `RemittanceUserProfiles` for the customer's `userId` | No document is returned |
| 2. | Log in to the app as the customer | The home screen is displayed |
| 3. | Tap Send to start an outbound remittance | The send flow opens |
| 4. | Query `RemittanceUserProfiles` again | One document exists, with `id` = `userId` |
| 5. | Compare the snapshot with the customer's User Profile record (name, email, phone, DOB, address, KYC status, ID document, eligibility flags, GKO number, birth country, employment info) | Every stored field matches User Profile |

Post Conditions:
The following should be true after test completion:
• The customer has exactly one remittance snapshot
• Leave the send flow without sending; nothing past tapping Send is needed for this case

---

## Alternate valid paths

TEST CASE 2
Title: Verify whether an admin change to mother's maiden name reaches the remittance snapshot

Tags: Remittances, User Profile Sync, Admin Portal, Compliance

Pre Conditions:
The following should be true before proceeding:
• The customer has an existing remittance snapshot with `mothersMaidenName` filled in
• `EnableRemittanceUserProfileEventSync` is on

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record `mothersMaidenName` on the remittance snapshot | |
| 2. | In the admin portal, change only the mother's maiden name and save | The change is saved; User Profile shows the new value |
| 3. | Allow propagation, then query the remittance snapshot | **Expected per the review:** `mothersMaidenName` is **unchanged**. The event lists `motherName` in `changedFields`, but the `profile` payload has no property for it, so remittance can't apply it |
| 4. | Start a WU Outbound remittance and complete customer profile validation | The forced refresh fetches the profile from the API. Record whether `mothersMaidenName` on the snapshot now matches User Profile |

Post Conditions:
The following should be true after test completion:
• If step 3 shows the old value, raise it as a defect candidate: the snapshot holds a stale compliance field until the next forced refresh


---

TEST CASE 3
Title: Verify that an admin TRN change updates the TRN on both profile copies

Tags: Remittances, Wallet, User Profile Sync, Admin Portal, Compliance

Pre Conditions:
The following should be true before proceeding:
• The customer has existing profile documents; a valid TRN not used by any other customer is available
• `EnableRemittanceUserProfileEventSync` is on

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record every field on the remittance snapshot | |
| 2. | In the admin portal, change only the TRN and save | The change is saved |
| 3. | Allow propagation, then query both documents | `trn` / `Trn` show the new value; other profile fields are unchanged |
| 4. | Note `isTaxIdentificationNumberValidated` on the remittance snapshot | Record the result (it's taken from the event's eligibility block) |

Post Conditions:
The following should be true after test completion:
• The new TRN is on User Profile and both copies


---

TEST CASE 4
Title: Verify that an admin save with no actual changes publishes nothing and leaves both profile copies untouched

Tags: Remittances, Wallet, User Profile Sync, Admin Portal

Pre Conditions:
The following should be true before proceeding:
• The customer has existing profile documents

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record the sync metadata on both documents | |
| 2. | In the admin portal, open the customer's details and save without changing anything | The save succeeds |
| 3. | Allow propagation, then query both documents | The sync metadata is unchanged (an empty field set records nothing) |

Post Conditions:
The following should be true after test completion:
• No profile data changed


---

TEST CASE 5
Title: Verify that a primary address change replaces the address on both profile copies

Tags: Remittances, Wallet, User Profile Sync, Mobile

Pre Conditions:
The following should be true before proceeding:
• The customer has existing profile documents
• `EnableRemittanceUserProfileEventSync` is on
• The app's address update calls `POST /user/primaryAddress` *(confirm the screen)*

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record the address on both documents, and `hasValidProofOfAddress` on the remittance snapshot | |
| 2. | Change the primary address so every line is different | The change is saved |
| 3. | Allow propagation, then query the remittance snapshot | Every address field matches the new address, with nothing left over from the old one |
| 4. | Query the wallet profile | `Address.city`, `Address.country` and `Address.parish` match the new address (the wallet stores only these address fields) |
| 5. | Check `hasValidProofOfAddress` on the remittance snapshot | Record the result *(the review says remittance keeps its stored proof-of-address validity on events)* |

Post Conditions:
The following should be true after test completion:
• Both copies match User Profile's primary address


---

TEST CASE 6
Title: Verify that an occupational level change updates the remittance snapshot only when the value actually changes

Tags: Remittances, User Profile Sync, Mobile

Pre Conditions:
The following should be true before proceeding:
• The customer has an existing remittance snapshot
• `EnableRemittanceUserProfileEventSync` is on
• Occupational level can be changed through the app or support (`PUT api/Users/UpdateOccupationalLevel`)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record `employmentInfo` and `syncInfo` on the remittance snapshot | |
| 2. | Change the occupational level to a different valid value | The change is saved |
| 3. | Allow propagation, then query the remittance snapshot | `employmentInfo.occupationalLevel` shows the new value; other employment details are unchanged |
| 4. | Query the wallet profile | Unchanged (wallet ignores occupational level) |
| 5. | Submit the same occupational level again | The save succeeds |
| 6. | Allow propagation, then query the remittance snapshot | `syncInfo` is unchanged (no event when the value didn't change) |

Post Conditions:
The following should be true after test completion:
• The occupational level matches User Profile


---

TEST CASE 7
Title: Verify that completing eKYC brings both profile copies to Tier 1, including prepaid card data for JM

Tags: Remittances, Wallet, User Profile Sync, KYC, Onboarding, Mobile

Pre Conditions:
The following should be true before proceeding:
• A newly registered customer with KYC status `NOT_COMPLETED`
• `EnableRemittanceUserProfileEventSync` is on

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete eKYC in the app (Ondato verification, then the completion screen; for JM, choose a pick-up location for the card) | Onboarding completes |
| 2. | Query the User Profile record | `KycStatus` = `TIER_1`; for JM, prepaid card info is present |
| 3. | Allow propagation, then query the wallet profile | `KycStatus` / `KycTier` reflect Tier 1; for JM, the card data is present with a masked card number (first 6 and last 4 digits only) |
| 4. | Query the remittance snapshot (or start a remittance to create it) | `kycStatus` = `TIER_1`; `address`, `trn` and `externalWalletReferenceNo` match User Profile |
| 5. | Start a WU Outbound remittance | The customer passes customer profile validation |

Post Conditions:
The following should be true after test completion:
• Both copies agree with User Profile. *(KYC completion publishes both `UserProfileChanged` (`KycCompletion`) and `UserProfileUpdated`; remittance receives both.)*


---

TEST CASE 8
Title: Verify that an address change in CMS reaches both profile copies when the customer next signs in

Tags: Remittances, Wallet, User Profile Sync, CMS, Mobile

Pre Conditions:
The following should be true before proceeding:
• The customer's address in CMS has been changed so it differs from User Profile
• Both profile documents exist; `EnableRemittanceUserProfileEventSync` is on

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record the address on both documents | |
| 2. | Sign in to the app as the customer | Sign-in succeeds |
| 3. | Query User Profile | The address matches CMS |
| 4. | Allow propagation, then query both documents | Both show the CMS address |

Post Conditions:
The following should be true after test completion:
• The published event had `changeSource` = `CmsAddressSync`


---

TEST CASE 9
Title: Verify that a credit card application update carries the address and occupation to the remittance snapshot

Tags: Remittances, Wallet, User Profile Sync, Credit Card

Pre Conditions:
The following should be true before proceeding:
• The customer has existing profile documents; `EnableRemittanceUserProfileEventSync` is on
• A credit card application can be submitted for the customer (`POST api/Kyc/UpdateFromCreditCardApplication`) *(confirm the entry point)*

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record the address, occupation and employment details on the remittance snapshot | |
| 2. | Submit a credit card application with a different address, occupation, employment status and mother's maiden name | The application is accepted; User Profile is updated |
| 3. | Allow propagation, then query the remittance snapshot | `address` and occupation show the new values. Employment status and `mothersMaidenName` are expected to stay the same, because those fields aren't in the event payload |
| 4. | Query the wallet profile | The address is updated |

Post Conditions:
The following should be true after test completion:
• Record any fields User Profile changed that neither copy received


---

TEST CASE 10
Title: Verify that a prepaid card replacement updates the masked card details on the wallet profile

Tags: Wallet, Prepaid Card, User Profile Sync, Mobile

Pre Conditions:
The following should be true before proceeding:
• A JM customer with an active prepaid card and a wallet profile
• `PrepaidCardReplacementRequestsEnabled` is on in QA

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record the prepaid card info on the wallet profile | |
| 2. | Request a replacement card in the app | The request succeeds |
| 3. | Allow propagation, then query the wallet profile | The card info shows the new card; the masked number shows only the first 6 and last 4 digits; no full card number |

Post Conditions:
The following should be true after test completion:
• The wallet profile and User Profile agree on the active card


---

TEST CASE 11
Title: Verify that an admin KYC reset updates the KYC status on both profile copies

Tags: Remittances, Wallet, User Profile Sync, KYC, Admin Portal, Compliance

Pre Conditions:
The following should be true before proceeding:
• The customer is below `TIER_1` (KYC reset is blocked once a customer is `TIER_1`)
• The customer has documents in both `RemittanceUserProfiles` and wallet `UserProfiles`
• Admin maker and checker access; `EnableRemittanceUserProfileEventSync` is on

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record `kycStatus` and `syncInfo` on the remittance snapshot, and `KycStatus`, `KycTier` and `LastEventId` on the wallet profile | |
| 2. | Propose a Reset KYC action for the customer, and approve it as checker | The customer's KYC status in User Profile is reset |
| 3. | Allow propagation, then query the remittance snapshot | `kycStatus` matches the reset status in User Profile; `syncInfo` has changed |
| 4. | Query the wallet profile | `KycStatus` matches the reset status in User Profile; `LastEventId` has changed. Record whether `KycTier` was also cleared |

Post Conditions:
The following should be true after test completion:
• Both copies agree with User Profile on KYC status. *(The published event has `changeSource` = `KycStatusReset` and `changedFields` = `kycStatus`.)*


---

## Edge cases

TEST CASE 12
Title: Verify that a remittance started straight after a profile change uses the updated details

Tags: Remittances, User Profile Sync, Mobile

Pre Conditions:
The following should be true before proceeding:
• The customer's profile is cached (they used remittances within the last 30 minutes)
• `EnableRemittanceUserProfileEventSync` is on

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Change the customer's primary address | The change is saved |
| 2. | After about 30 seconds, start a WU Outbound remittance and go to confirmation | The new address is shown (the event cleared the cached entry) |

Post Conditions:
The following should be true after test completion:
• No transaction after the change holds the old address


---

TEST CASE 13
Title: Verify that inbound and outbound participant fields match the pre-feature baseline for the same customer

Tags: Remittances, User Profile Sync, Regression

Pre Conditions:
The following should be true before proceeding:
• A baseline of inbound and outbound participant fields for the customer, captured before profile sync was deployed
• The customer's profile hasn't changed since then

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Send a WU Outbound remittance and compare every sender participant field with the baseline | Every field matches exactly |
| 2. | Process an inbound remittance and compare every receiver participant field | Every field matches exactly |

Post Conditions:
The following should be true after test completion:
• Moving to the shared resolver changed no participant field


---

TEST CASE 14
Title: Verify that a P2P transfer between two Tier 1 customers succeeds and leaves each with one remittance snapshot

Tags: Remittances, P2P, User Profile Sync, Mobile

Pre Conditions:
The following should be true before proceeding:
• Two Tier 1 customers with valid prepaid cards who do not already have snapshots

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete a P2P transfer from the sender to the receiver | The transfer completes |
| 2. | Query `RemittanceUserProfiles` for both customers | At most one snapshot each, matching User Profile *(still open: whether the receiver goes through the resolver)* |

Post Conditions:
The following should be true after test completion:
• No duplicate snapshots


---

TEST CASE 15
Title: Verify that a new sign-up publishes no profile event and creates no profile copies until the customer is first read

Tags: Remittances, Wallet, User Profile Sync, Onboarding

Pre Conditions:
The following should be true before proceeding:
• A new email address and phone number for registration

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Register a new customer in the app (sign-up only, no eKYC) | Registration succeeds |
| 2. | Wait 1 minute, then query both containers for the new user ID | No remittance snapshot; wallet profile [record the result] (sign-up is a deliberate non-publisher) |

Post Conditions:
The following should be true after test completion:
• The customer's copies only appear on their first read or first published change


---

TEST CASE 16
Title: Verify that an account-deletion request publishes no event and leaves both profile copies in place

Tags: Remittances, Wallet, User Profile Sync, Data Retention

Pre Conditions:
The following should be true before proceeding:
• A customer with both profile copies who can request account deletion in the app

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Request account deletion in the app | The request is accepted |
| 2. | Wait 1 minute, then query both containers | Both copies still exist, unchanged (account-deletion requests are a deliberate non-publisher) |

Post Conditions:
The following should be true after test completion:
• Record the result for the open question on PII retention in the copies


---

## Deferred

TC 19–21 were marked `[DEFER]` in draft 01, and TC 17–18 in draft 02 (2026-10-22). Kept here so they can be picked up later.

---

TEST CASE 17
Title: Verify what reaches the profile copies after an admin account merge, depending on the identity-conflict flag [DEFER]

Tags: Remittances, Wallet, User Profile Sync, Customer Account Management, Known Issue

Pre Conditions:
The following should be true before proceeding:
• Two duplicate accounts set up for a merge; both have profile copies
• Note the QA value of `EnableIdentityConflictResolution`

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record both accounts' copies | |
| 2. | Propose and approve the merge | The merge completes |
| 3. | Allow propagation, then query both containers | **Flag on:** the copies reflect the merge (`IdentityConflictResolution`). **Flag off:** no event; the copies are unchanged |

Post Conditions:
The following should be true after test completion:
• *(The IAM CR lists `MergeOrchestrator` as an uncovered writer. Record which path the merge actually took.)*


---

TEST CASE 18
Title: Verify that an existing customer's KYC becomes TRN_DUPLICATED on their profile copies when another customer with the same TRN passes Ondato [DEFER]

Tags: Remittances, Wallet, User Profile Sync, KYC, Onboarding, Compliance

Pre Conditions:
The following should be true before proceeding:
• Customer A is Tier 1 with profile documents in both containers
• Customer B is new and will pass Ondato with the same TRN as customer A
• `EnableRemittanceUserProfileEventSync` is on

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete Ondato verification for customer B | Ondato approves customer B |
| 2. | Query customer A's User Profile record | `KycStatus` = `TRN_DUPLICATED` |
| 3. | Allow propagation, then query customer A's remittance and wallet documents | Both show `TRN_DUPLICATED` |
| 4. | As customer A, attempt a WU Outbound remittance | Blocked at customer profile validation |

Post Conditions:
The following should be true after test completion:
• The published event for customer A had `changeSource` = `OndatoIdentityVerification` and `changedFields` = `kycStatus`


---

TEST CASE 19
Title: Verify that an OTP-verified email change in the app is reflected in the remittance and wallet snapshots [DEFER]

Tags: Remittances, Wallet, User Profile Sync, GK ID, Mobile

Pre Conditions:
The following should be true before proceeding:
• The customer has an existing remittance snapshot and wallet profile
• `EnableRemittanceUserProfileEventSync` is on
• A second email address not registered to another GKOne user

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record `email` and `syncInfo` on the remittance snapshot, and `Email`, `LastEventId` and `LastSyncedAtUtc` on the wallet profile | |
| 2. | In the app, change the email address and verify the OTP sent to the new address | The change succeeds; the customer is signed out with the sign-in-required notice |
| 3. | Allow propagation, then query the remittance snapshot | `email` = the new address; `syncInfo.lastAppliedEventId` has changed |
| 4. | Query the wallet profile | `Email` = the new address; `LastEventId` and `LastSyncedAtUtc` have changed |

Post Conditions:
The following should be true after test completion:
• No second profile document exists for the customer in either container


---

TEST CASE 20
Title: Verify that a remittance sent after an email change sends its confirmation to the new address only [DEFER]

Tags: Remittances, User Profile Sync, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• TC 19 has been completed for this customer

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Sign in with the new email address | Sign-in succeeds |
| 2. | Send a WU Outbound remittance to completion | The transaction completes |
| 3. | Check both mailboxes | The confirmation email arrives at the **new** address only |

Post Conditions:
The following should be true after test completion:
• Nothing is sent to the old email address after the change


---

TEST CASE 21
Title: Verify that an OTP-verified phone number change updates the existing profile copies without creating a second record [DEFER]

Tags: Remittances, Wallet, User Profile Sync, GK ID, Mobile

Pre Conditions:
The following should be true before proceeding:
• The customer has existing remittance and wallet profile documents
• `EnablePhoneNumberProfileMigration` is on in QA *(without it, an OTP phone change doesn't publish)*
• `EnableRemittanceUserProfileEventSync` is on

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record each document's `id` and phone number | |
| 2. | In the app, complete the phone change journey (enter the new number, then the code sent to the customer's email) | The change succeeds |
| 3. | Allow propagation, then query both containers by the customer's user ID | **One** document each; same `id` as step 1; phone = the new number |
| 4. | Query both containers by the old phone number | No match |

Post Conditions:
The following should be true after test completion:
• `profileId` on the User Profile record is unchanged *(still an open question)*


---


## Notes

**Count:** 21 cases: 16 active and 5 deferred. Removed from draft 02: the admin name and date-of-birth change (the admin portal can't edit those fields), the proof-of-funds KYC check (there's no proof-of-funds upload at the moment), and the mid-flow KYC reset and pending Reset KYC cases (a KYC reset is blocked once a customer is able to transact).
- Active: happy path 1 (TC 1), alternate valid paths 10 (TC 2–11), edge 5 (TC 12–16).
- Deferred (TC 17–21): the account merge, the TRN-duplicate flip, the email change, the remittance after an email change, and the phone change.

**Assumptions to confirm:**
- **Entry points.** The app or portal entry points for TC 5, 6 and 9 aren't confirmed, and nobody has said whether the admin detail edit uses maker-checker.
- **Flags in QA.** The QA values of `EnablePhoneNumberProfileMigration` and `EnableIdentityConflictResolution` are unknown.
- **Remittance event sync is off in QA.** Every remittance-snapshot check after a change needs `EnableRemittanceUserProfileEventSync` turned on first. Coordinate this, because the subscription has a backlog that will start processing when it's turned on.
- **Expected gaps, from the review, to raise as defect candidates if confirmed:**
  - TC 2: `mothersMaidenName` doesn't propagate.
  - TC 9: employment status and mother's maiden name don't propagate.
  - TC 5: proof-of-address validity isn't refreshed by events.

**Context applied:**
- **Primary context:**
  - The "Published events" review PDF (shared 2026-10-22): sections 2.2, 2.3, 2.4, 3, 4.1, 4.2, 4.3.
  - `user-profile-sync/domain-knowledge.md`: read path, forced refresh, consumer rules.
  - `known-issues.md`: uncovered writers: merge (TC 17).
  - `edge-cases.md`: phone change and profile ID; no backfill.
  - Story notes 37227, 37231, 35690.
- **Related context:**
  - ekyc: KYC status values, JM completion (TC 7, 18).
  - customer-account-management: Reset KYC maker-checker, `TRN_DUPLICATED`, merge (TC 11, 17, 18).
  - The GK ID M6 playground notes: OTP flows (TC 19–21).
  - wu-outbound: customer profile validation (TC 1, 18).
- **Marked content these cases lean on:**
  - `[UNCERTAIN]` forced refresh coverage (TC 14).
  - `[VERIFY]` profile ID after a phone change (TC 21).
  - Entry-point assumptions (TC 5, 6, 9).
