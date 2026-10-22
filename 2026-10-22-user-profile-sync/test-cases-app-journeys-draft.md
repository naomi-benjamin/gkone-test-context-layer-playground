# User Profile Sync — App journey test cases (draft 01)

**Scope:** what happens to the remittance (`RemittanceUserProfiles`) and wallet (`wallet.userprofiles`) profile copies as a customer or admin moves through the app and admin portal. Verification is by observing the app and by **reading** the Cosmos containers. These cases don't publish messages by hand, edit databases, flush the cache or toggle flags; those cases are in `test-cases-manual-messaging-draft.md`.

**Status:** first draft, 2026-10-22. The publish-point documentation isn't in yet, so cases that depend on a specific write path publishing are marked with the assumption they rely on.

**Global preconditions for this file** (not repeated per case unless relevant):
- QA environment, with profile event publishing active (either `EnableProfileChangeOutboxDispatch` on, or the direct post-write publish in place). *(Assumption: which of these applies with the outbox flag off is still an open question.)*
- `EnableRemittanceUserProfileEventSync` is on.
- The tester has read access to the `RemittanceUserProfiles` (Remittances DB, partition key `/userId`) and `wallet.userprofiles` (partition key `/UserId`) containers, and to the User Profile IAM record for the test user.
- Remittance fields are camelCase; wallet fields are PascalCase.

---

## Happy path

TEST CASE 1
Title: Verify that a remittance snapshot is created from the User Profile service the first time an existing customer starts an outbound remittance

Tags: Remittances, User Profile Sync, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• The customer is KYC Tier 1 and eligible to send a WU Outbound remittance
• The customer has no document in the `RemittanceUserProfiles` container (they haven't sent a remittance since the feature was deployed)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Query `RemittanceUserProfiles` for the customer's `userId` | No document is returned |
| 2. | Log in to the GKOne mobile app as the customer | |
| 3. | Start a WU Outbound remittance to a valid corridor and request a quote | The quote is displayed |
| 4. | Complete the recipient details and proceed to confirmation | The confirmation screen shows the customer's correct name and details |
| 5. | Confirm and complete payment | The transaction completes and an MTCN is shown or emailed |
| 6. | Query `RemittanceUserProfiles` for the customer's `userId` again | One document exists, with `id` = `userId` |
| 7. | Compare the snapshot's stored fields (name, email, phone, DOB, address, KYC status, ID document, compliance flags) with the customer's User Profile record | Every field matches User Profile |

Post Conditions:
The following should be true after test completion:
• The customer has exactly one remittance snapshot
• The transaction record holds the same participant details as before this feature existed

---

TEST CASE 2
Title: Verify that a customer's email change in the app is reflected in their remittance and wallet snapshots [DEFER]

Tags: Remittances, Wallet, User Profile Sync, GK ID, Mobile

Pre Conditions:
The following should be true before proceeding:
• The customer has an existing remittance snapshot and wallet snapshot (both have been read at least once)
• The customer has access to a second email address that isn't registered to another GKOne user

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record the current `email` and `syncInfo` values on the remittance snapshot, and `Email`, `LastEventId` and `LastSyncedAtUtc` on the wallet snapshot | |
| 2. | Log in to the app and go to the change-email option in profile settings | |
| 3. | Enter the new email address and submit | A verification code is sent to the new address |
| 4. | Enter the verification code | The change succeeds, the sign-in-required notice is shown and the customer is signed out |
| 5. | Wait up to [expected propagation time], then query the remittance snapshot | `email` shows the new address; `syncInfo.lastAppliedEventId` and `lastSyncedAtUtc` have changed; `changeSource` reflects the email update |
| 6. | Query the wallet snapshot | `Email` shows the new address; `LastEventId` and `LastSyncedAtUtc` have changed |

Post Conditions:
The following should be true after test completion:
• Both snapshots hold the new email address
• No second snapshot exists for the customer in either container

---

TEST CASE 3
Title: Verify that a remittance sent after an email change uses the new email address [DEFER]

Tags: Remittances, User Profile Sync, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• TC 2 has been completed for this customer, and the snapshots show the new email
• The customer is eligible to send a WU Outbound remittance

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Sign in to the app with the new email address | Sign-in succeeds |
| 2. | Send a WU Outbound remittance to completion | The transaction completes |
| 3. | Check both the old and the new mailbox | The transaction confirmation email arrives at the **new** address only |
| 4. | Check the sender email held on the transaction record | It shows the new address |

Post Conditions:
The following should be true after test completion:
• Nothing is sent to the old email address after the change

---

## Alternate valid paths

TEST CASE 4
Title: Verify that a phone number change updates the existing remittance and wallet snapshots without creating a second record [DEFER]

Tags: Remittances, Wallet, User Profile Sync, GK ID, Mobile

Pre Conditions:
The following should be true before proceeding:
• The customer has existing remittance and wallet snapshots
• The customer has access to a second phone number not registered to another GKOne user
• `EnablePhoneNumberProfileMigration` is on *(assumption: phone changes move the User Profile document between partitions only when this flag is on)*

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record the snapshot `id` and phone number in both containers | |
| 2. | In the app, start the phone number change journey and enter the new number | A code is sent to the customer's email |
| 3. | Enter the code to complete the change | The change succeeds and a confirmation notification is sent |
| 4. | Query `RemittanceUserProfiles` by the customer's `userId` | **One** document; same `id` as step 1; `phoneNumber` shows the new number |
| 5. | Query `wallet.userprofiles` by the customer's `UserId` | **One** document; same `id` as step 1; `PhoneNumber` shows the new number |
| 6. | Query both containers by the **old** phone number | No document has the old number |

Post Conditions:
The following should be true after test completion:
• The customer still has exactly one snapshot in each container
• `profileId` on the User Profile record is unchanged *(open question: whether it survives the partition move)*

---

TEST CASE 5
Title: Verify that an admin change to a customer's core identity fields reaches the remittance snapshot with correctly mapped field names

Tags: Remittances, User Profile Sync, Admin Portal, Customer Account Management

Pre Conditions:
The following should be true before proceeding:
• The customer has an existing remittance snapshot
• The tester has admin (maker, and checker if required) access to the admin portal
• *(Assumption: the admin detail edit (PROFILE-02) is reachable from the admin portal. Confirm whether it goes through maker-checker.)*

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record `firstName`, `lastName`, `dateOfBirth`, `nationality`, `trn` and `mothersMaidenName` on the remittance snapshot | |
| 2. | In the admin portal, open the customer and change the mother's maiden name and date of birth only | |
| 3. | Save the change (and approve it as checker, if required) | The change is saved |
| 4. | Query the remittance snapshot | `mothersMaidenName` and `dateOfBirth` show the new values; all other fields are unchanged |
| 5. | Query the wallet snapshot | `Birthdate` shows the new value |

Post Conditions:
The following should be true after test completion:
• The event's `motherName` and `birthdate` fields were mapped to the remittance and wallet field names

---

TEST CASE 6
Title: Verify that an admin change to a customer's TRN only updates the TRN on the remittance snapshot

Tags: Remittances, User Profile Sync, Admin Portal, Compliance

Pre Conditions:
The following should be true before proceeding:
• The customer has an existing remittance snapshot
• The tester has admin access to the admin portal
• A valid TRN not used by any other customer is available

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record all fields on the remittance snapshot | |
| 2. | In the admin portal, change only the customer's TRN and save (approving it if required) | The change is saved |
| 3. | Query the remittance snapshot | `trn` shows the new value; every other field matches step 1 except the sync metadata |
| 4. | Note whether `isTaxIdentificationNumberValidated` changed | Record the result *(open question: whether a TRN change recalculates this flag in the same event)* |

Post Conditions:
The following should be true after test completion:
• The new TRN is on both the User Profile record and the remittance snapshot

---

TEST CASE 7
Title: Verify that an admin save with no actual changes doesn't update the remittance or wallet snapshot

Tags: Remittances, Wallet, User Profile Sync, Admin Portal

Pre Conditions:
The following should be true before proceeding:
• The customer has existing remittance and wallet snapshots

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record the sync metadata on both snapshots (`syncInfo.*` / `LastEventId`, `LastSyncedAtUtc`) | |
| 2. | In the admin portal, open the customer's details and save without changing anything | The save succeeds |
| 3. | Wait up to [expected propagation time], then query both snapshots | The sync metadata matches step 1 (no event was published) |

Post Conditions:
The following should be true after test completion:
• No profile data changed on either snapshot

---

TEST CASE 8
Title: Verify that a primary address change replaces the whole address on the remittance snapshot and the stored fields on the wallet snapshot

Tags: Remittances, Wallet, User Profile Sync, Mobile

Pre Conditions:
The following should be true before proceeding:
• The customer has existing remittance and wallet snapshots
• *(Assumption: the customer can update their primary address in the app or through support. Confirm the entry point.)*

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record the address on both snapshots | |
| 2. | Change the customer's primary address: street, line 2, city and parish/state all different | The change is saved |
| 3. | Query the remittance snapshot | `address.street`, `line2`, `city`, `state`, `zipCode` and `country` all match the new address, with nothing left over from the old one |
| 4. | Query the wallet snapshot | `Address.city`, `country` and `parish` match the new address |

Post Conditions:
The following should be true after test completion:
• Both snapshots match User Profile's primary address

---

TEST CASE 9
Title: Verify that an occupational level change updates the nested employment info on the remittance snapshot

Tags: Remittances, User Profile Sync, Mobile

Pre Conditions:
The following should be true before proceeding:
• The customer has an existing remittance snapshot
• *(Assumption: occupational level can be changed through the app or support. Confirm the entry point.)*

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record `employmentInfo` on the remittance snapshot | |
| 2. | Change the customer's occupational level to a different valid value | The change is saved |
| 3. | Query the remittance snapshot | `employmentInfo.occupationalLevel` shows the new value; the other `employmentInfo` fields are unchanged |

Post Conditions:
The following should be true after test completion:
• The occupational level matches User Profile

---

TEST CASE 10
Title: Verify that a new customer's remittance and wallet snapshots show Tier 1 after they complete eKYC

Tags: Remittances, Wallet, User Profile Sync, KYC, Onboarding, Mobile

Pre Conditions:
The following should be true before proceeding:
• A newly registered customer who hasn't completed eKYC (KYC status `NOT_COMPLETED`)
• JM market: prepaid card creation is working in QA

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete eKYC in the app (Ondato verification, completion screen and, for JM, card assignment) | Onboarding completes |
| 2. | Query the User Profile record | `KycStatus` is `TIER_1` (2); for JM, `CreditCardInfo` is present |
| 3. | Query the wallet snapshot | `KycStatus` / `KycTier` reflect Tier 1; prepaid card data is present |
| 4. | Start a WU Outbound remittance | The customer can proceed past customer profile validation |
| 5. | Query the remittance snapshot | `kycStatus` is `TIER_1` |

Post Conditions:
The following should be true after test completion:
• Both snapshots agree with User Profile on KYC state

---

## Negative / error cases

TEST CASE 11
Title: Verify that a customer whose KYC was reset by an admin can't complete a remittance, even if their snapshot still shows Tier 1

Tags: Remittances, User Profile Sync, KYC, Admin Portal, Compliance

Pre Conditions:
The following should be true before proceeding:
• The customer is KYC Tier 1, with remittance and wallet snapshots showing Tier 1
• The tester has admin maker and checker access in the admin portal

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | In the admin portal, propose a Reset KYC action for the customer with a reason | The action appears under Pending Operations |
| 2. | As checker, approve the Reset KYC action | The action is approved and the customer's KYC status in User Profile is reset |
| 3. | Immediately log in to the app as the customer and start a WU Outbound remittance | The customer is blocked at customer profile validation with the not-eligible message (the eligibility check forces a fresh lookup) |
| 4. | Query the remittance snapshot | `kycStatus` shows the reset value |
| 5. | Query the wallet snapshot | `KycStatus` shows the reset value. Note whether `KycTier` was also cleared |

Post Conditions:
The following should be true after test completion:
• Both snapshots reflect the reset KYC status
• No remittance was created

---

TEST CASE 12
Title: Verify that a Reset KYC that is proposed but not approved doesn't change the customer's snapshots[DEFER]

Tags: Remittances, Wallet, User Profile Sync, KYC, Admin Portal

Pre Conditions:
The following should be true before proceeding:
• The customer is KYC Tier 1 with existing snapshots
• The tester has admin maker access

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record the KYC fields and sync metadata on both snapshots | |
| 2. | Propose a Reset KYC action for the customer and leave it pending | The action is shown as PENDING |
| 3. | Query both snapshots | KYC fields and sync metadata match step 1 |
| 4. | As the customer, start a WU Outbound remittance | The customer passes customer profile validation |
| 5. | As checker, reject the pending action | The action is shown as REJECTED |
| 6. | Query both snapshots again | Still unchanged |

Post Conditions:
The following should be true after test completion:
• The customer remains Tier 1 everywhere

---

TEST CASE 13
Title: Verify that the eligibility check uses the current User Profile KYC status when the remittance snapshot is stale

Tags: Remittances, User Profile Sync, KYC, Compliance

Pre Conditions:
The following should be true before proceeding:
• The customer is Tier 1 and has just started a remittance session, so their profile is cached
• The tester has admin maker and checker access

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | As the customer, open the WU Outbound flow and get a quote (this warms the cache) | The quote is shown |
| 2. | In the admin portal, reset the customer's KYC and approve it | The reset is approved |
| 3. | Without leaving the flow, continue to confirmation and submit | The transaction is blocked at customer profile validation; no payment is taken |

Post Conditions:
The following should be true after test completion:
• No payment or remittance exists for this attempt
• *(Open question: whether both the create and confirm validations force a refresh. If only one does, record which step blocked.)*

---

## Edge cases

TEST CASE 14
Title: Verify that a remittance started straight after a profile change uses the updated details

Tags: Remittances, User Profile Sync, Mobile

Pre Conditions:
The following should be true before proceeding:
• The customer has an existing remittance snapshot that is currently cached (they sent a remittance or opened the flow within the last 30 minutes)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Change the customer's primary address (or another field shown on the confirmation screen) | The change is saved |
| 2. | Within 1 minute, start a WU Outbound remittance and go to the confirmation screen | The confirmation screen shows the **new** details (the event cleared the cache) |
| 3. | Complete the transaction and check the transaction record | The participant details match the new values |

Post Conditions:
The following should be true after test completion:
• No transaction holds the pre-change details after the change was saved

---

TEST CASE 15
Title: Verify that inbound and outbound participant fields are unchanged from the pre-feature baseline for the same customer

Tags: Remittances, User Profile Sync, Regression

Pre Conditions:
The following should be true before proceeding:
• A baseline exists: participant fields from an inbound and an outbound transaction for the same customer, captured before profile sync was deployed (or from an environment without it)
• The customer's profile data hasn't changed since the baseline

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Send a WU Outbound remittance for the customer | The transaction completes |
| 2. | Compare every sender participant field on the new transaction with the baseline | Every field matches exactly (value, format, casing, empty vs null) |
| 3. | Process an inbound remittance for the same customer | The transaction completes |
| 4. | Compare every receiver participant field with the baseline | Every field matches exactly |

Post Conditions:
The following should be true after test completion:
• Moving to the shared resolver hasn't changed any participant field

---

TEST CASE 16
Title: Verify that a P2P transfer between two Tier 1 customers succeeds and creates or uses both customers' snapshots

Tags: Remittances, P2P, User Profile Sync, Mobile

Pre Conditions:
The following should be true before proceeding:
• Two Tier 1 customers with valid prepaid cards; at least one has no remittance snapshot yet

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | As the sender, start a P2P transfer to the receiver and complete it | The transfer completes |
| 2. | Query `RemittanceUserProfiles` for both customers | Each customer has exactly one snapshot, matching User Profile *(open question: whether the receiver's profile goes through the resolver)* |

Post Conditions:
The following should be true after test completion:
• Both customers' snapshots are consistent with User Profile

---

TEST CASE 17
Title: Verify that a prepaid card replacement updates the card details on the wallet snapshot

Tags: Wallet, Prepaid Card, User Profile Sync, Mobile

Pre Conditions:
The following should be true before proceeding:
• A JM customer with an active prepaid card and an existing wallet snapshot
• `PrepaidCardReplacementRequestsEnabled` is on in QA (default)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record the card reference on the wallet snapshot | |
| 2. | In the app, request a replacement card and confirm | The replacement request succeeds |
| 3. | Query the wallet snapshot | The card data shows the new card reference; no raw PAN is stored |
| 4. | Query the User Profile record | The card details match the wallet snapshot |

Post Conditions:
The following should be true after test completion:
• The wallet snapshot and User Profile agree on the active card

---

## Known-issue checks (verify still present)

TEST CASE 18
Title: Verify that the wallet snapshot's KYC status is not updated after a proof-of-funds upload (known issue: FundsService doesn't publish)

Tags: Wallet, User Profile Sync, KYC, Known Issue

Pre Conditions:
The following should be true before proceeding:
• A customer for whom uploading proof of funds changes their KYC status
• An existing wallet snapshot

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record `KycStatus` on the wallet snapshot | |
| 2. | Upload proof of funds in the app until User Profile's KYC status changes | User Profile shows the new KYC status |
| 3. | Query the wallet snapshot | Known issue: `KycStatus` still shows the old value. If it has updated, the follow-up fix has landed, so update `known-issues.md` |

Post Conditions:
The following should be true after test completion:
• The result is recorded against the known issue (accepted 2026-10-13)

---

TEST CASE 19
Title: Verify that customer snapshots are not updated after an admin account merge (known issue: MergeOrchestrator doesn't publish)

Tags: Remittances, Wallet, User Profile Sync, Customer Account Management, Known Issue

Pre Conditions:
The following should be true before proceeding:
• Two duplicate accounts are set up for a merge in the admin portal, and both have remittance and wallet snapshots

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Record both accounts' snapshots in both containers | |
| 2. | Propose and approve the merge in the admin portal | The merge completes |
| 3. | Query both containers for both accounts | Known issue: the snapshots don't reflect the merge. Record exactly what each one shows |

Post Conditions:
The following should be true after test completion:
• The result is recorded against the known issue; any change means the follow-up has landed

---

## Notes

**Count:** 19 cases. Happy path 3 (TC 1–3), alternate valid paths 7 (TC 4–10), negative 3 (TC 11–13), edge 4 (TC 14–17), known-issue checks 2 (TC 18–19).

**Assumptions to confirm:**
- **Entry points.** The address (TC 8) and occupational level (TC 9) changes, and the admin detail edit (TC 5–7), are assumed to be reachable from the app or admin portal. Whether the admin edit goes through maker-checker isn't confirmed.
- **Propagation time.** "[expected propagation time]" is a placeholder until the devs give a figure.
- **Publish points.** The publish-point documentation will confirm which flows publish, and with what `changeSource` and `changedFields`. TC 2, 4–11, 17 and 18 depend on it.
- **Forced refresh coverage.** TC 11 and 13 assume customer profile validation forces a refresh. Whether that covers create **and** confirm, and P2P, is still open.

**Context applied:**
- **Primary context:** `user-profile-sync/`:
  - `domain-knowledge.md`: read path; forced refresh on user profile validation; consumer side (compliance fields applied, missing fields kept); field-name mapping table; write-path table.
  - `test-patterns.md`: common verification points; direct DB edits don't publish.
  - `edge-cases.md`: field names mapped; phone change and profile ID; no backfill; stale compliance data.
  - `known-issues.md`: the six uncovered writers (TC 18, 19).
  - `integration-points.md`: flags; partition keys.
  - Story notes 37227, 37231, 35891, 35898, 35903, 35908, 35920, 35924, 35690.
- **Related context:**
  - `ekyc` KYC status values and JM onboarding completion (TC 10).
  - `customer-account-management` Reset KYC maker-checker flow and Pending Operations (TC 11, 12, 13, 19).
  - The playground notes for GK ID M6 (TC 2–4: verification code, sign-out after an email change, phone code sent to email).
  - `wu-outbound` customer profile validation stages (TC 1, 3, 11, 13).
- **Marked content these cases lean on:**
  - `[UNCERTAIN]` forced refresh coverage (TC 11, 13, 16).
  - `[VERIFY]` profile ID after a phone change (TC 4).
  - `[ASSUMPTION]` entry points (TC 5–9).
