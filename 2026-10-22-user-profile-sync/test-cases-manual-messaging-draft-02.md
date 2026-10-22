# User Profile Sync — Manual messaging and infrastructure test cases (draft 02)

**Scope:** cases that need the tester to publish or peek at Service Bus messages, edit Cosmos documents directly, flush Redis, toggle flags, or simulate an outage. App-journey cases are in `test-cases-app-journeys-draft-02.md`.

**What changed from draft 01:** revised against the Profile IAM "Published events" review. It now covers each consumer's exact validation and settlement rules, how remittance handles a snapshot it created from an event (schema version 0), the remittance flag in QA, `schemaVersion` handling, sensitive fields on `UserProfileUpdated`, and wallet's recovery path (`IamFetch`).

**Global preconditions:**
- QA environment. The tester can peek at and publish to topic `sbt-profile-iam-{env}`, and can read the subscriptions `sbts-remittances-profile-updates-{env}` and `sbts-wallet-user-profile-{env}` and their dead-letter queues.
- **Consumers match on the message Subject** (`UserProfileChanged` / `UserProfileUpdated`), so set it on every published test message. Bodies are wrapped in the MassTransit envelope (`messageId`, `messageType`, `message`, ...).
- **Message bodies:** start from `UserProfileChanged.sample.json` / `UserProfileUpdated.sample.json` in this folder. Validate edited bodies against the matching `.schema.json`. Don't use the archived `sample-user-profile-changed-event.json`, which is stale. Remember:
  - **Every `UserProfileChanged` property is always written** (nulls aren't left out). A body with a property removed is schema-invalid, so use it only on purpose.
  - **`UserProfileUpdated` is `{ userId, id, user }`,** with enums as integers (e.g. `kycStatus: 2` = `TIER_1`).
- Write access to `RemittanceUserProfiles` and wallet `UserProfiles`. Redis flush rights. **A flush clears every key for every service.**
- **Remittance event sync is off in QA.** Turn `EnableRemittanceUserProfileEventSync` on (it's re-read every minute) for the remittance event cases, and expect a backlog to process first.

---

## Remittance: cache and read path

TEST CASE 1
Title: Verify that the remittance resolver serves the container copy on a cache miss and then serves the cached copy

Tags: Remittances, User Profile Sync, Cache

Pre Conditions:
The following should be true before proceeding:
• The customer has a remittance snapshot (schema version 1 or higher)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Flush Redis, then edit the snapshot directly so that `address.city` = `CACHE-TEST-1` | |
| 2. | Trigger a general lookup (open the WU Outbound confirmation screen) | `CACHE-TEST-1` is shown |
| 3. | Edit the snapshot again so that `address.city` = `CACHE-TEST-2`, then repeat step 2 within 30 minutes | `CACHE-TEST-1` is still shown (cache hit) |

Post Conditions:
The following should be true after test completion:
• Restore the real address and flush Redis

---

TEST CASE 2
Title: Verify that applying a UserProfileChanged invalidates the customer's cached remittance profile

Tags: Remittances, User Profile Sync, Cache, Service Bus

Pre Conditions:
The following should be true before proceeding:
• TC 1 steps 1–2 are done (the cache holds `CACHE-TEST-1`); remittance sync is on

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish a valid `UserProfileChanged` for the customer with a new `eventId`, a later `occurredAtUtc` and `profile.address.city` = `EVENT-TEST` | The message is completed |
| 2. | Query the snapshot | `address.city` = `EVENT-TEST` |
| 3. | Trigger a general lookup | `EVENT-TEST` is shown (the cache's version key was stamped and the profile key expired) |

Post Conditions:
The following should be true after test completion:
• Restore and flush Redis

---

TEST CASE 3
Title: Verify that customer profile validation uses User Profile's data, not a cached or stored copy

Tags: Remittances, User Profile Sync, Compliance, KYC

Pre Conditions:
The following should be true before proceeding:
• The customer is `NOT_COMPLETED` in User Profile and has a remittance snapshot

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Edit the snapshot so that `kycStatus` = `TIER_1`, then trigger a general lookup to cache it | |
| 2. | Attempt a WU Outbound remittance through customer profile validation | Blocked as not eligible |
| 3. | Query the snapshot | `kycStatus` has been overwritten with User Profile's value |

Post Conditions:
The following should be true after test completion:
• The snapshot matches User Profile

---

TEST CASE 4
Title: Verify that a remittance lookup succeeds when Redis is unavailable

Tags: Remittances, User Profile Sync, Resilience

Pre Conditions:
The following should be true before proceeding:
• Redis can be made unreachable for remittance

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Make Redis unreachable, then send a WU Outbound remittance | The transaction completes with correct details and no exposed error |

Post Conditions:
The following should be true after test completion:
• Restore Redis

---

TEST CASE 5
Title: Verify that a remittance lookup falls back to the User Profile API when the snapshot can't be read or doesn't exist

Tags: Remittances, User Profile Sync, Resilience

Pre Conditions:
The following should be true before proceeding:
• You can delete the customer's snapshot (or make container reads fail)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Flush Redis and delete the snapshot (or make container reads fail) | |
| 2. | Send a WU Outbound remittance | The transaction completes, with no exposed error |
| 3. | If you deleted the snapshot, query the container | A new snapshot matching User Profile exists |

Post Conditions:
The following should be true after test completion:
• The container is readable

---

TEST CASE 6
Title: Verify the remittance response when the User Profile API is down during customer profile validation

Tags: Remittances, User Profile Sync, Resilience, Compliance

Pre Conditions:
The following should be true before proceeding:
• The User Profile API can be made unavailable to remittance

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Make the API unavailable and attempt a remittance through profile validation | No payment is taken. Record the status code; the meeting said "behave like wallet" (503), but the review doesn't confirm it for remittance |

Post Conditions:
The following should be true after test completion:
• Restore the API

---

TEST CASE 7
Title: Verify that a required profile lookup returns the remittance not-found error when no source has the profile

Tags: Remittances, User Profile Sync, API

Pre Conditions:
The following should be true before proceeding:
• A user ID that doesn't exist anywhere

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Call a remittance endpoint that requires a profile, using that ID | The remittance not-found error is returned *(exact code to confirm)*; no unhandled exception; no snapshot is created |

Post Conditions:
The following should be true after test completion:
• No orphan data

---

## Remittance: event processing

TEST CASE 8
Title: Verify that a UserProfileChanged for a customer with no snapshot creates a version-0 row that the next lookup replaces with a live fetch

Tags: Remittances, User Profile Sync, Service Bus

Pre Conditions:
The following should be true before proceeding:
• The customer has no remittance snapshot

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish a valid `UserProfileChanged` for the customer | The message is completed |
| 2. | Query the container | A row exists at **schema version 0**, holding the event's fields |
| 3. | Trigger a general lookup | The resolver treats the row as a miss, fetches the profile from the API, and replaces the row with a full snapshot (schema version 1 or higher, including GKO number, birth country and employment info) |

Post Conditions:
The following should be true after test completion:
• The snapshot is complete

---

TEST CASE 9
Title: Verify that eligibility and KYC fields on a UserProfileChanged are applied to the remittance snapshot only when the eligibility block is present

Tags: Remittances, User Profile Sync, Compliance, Service Bus

Pre Conditions:
The following should be true before proceeding:
• The snapshot has `kycStatus: TIER_1` and `isSanctioned: false`

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish a `UserProfileChanged` with `kycStatus: NOT_COMPLETED` and `profile.eligibility.isSanctioned: true` | `kycStatus` = `NOT_COMPLETED`; `isSanctioned` = true |
| 2. | Publish a newer event with the `profile.eligibility` block **removed** (schema-invalid on purpose) | Record whether it's dead-lettered or applied. If applied, `isSanctioned` stays true (eligibility is only trusted when the block is present) |
| 3. | Publish a newer event with `kycStatus` missing but `kycTier: TIER_1` | `kycStatus` falls back to the tier value |

Post Conditions:
The following should be true after test completion:
• Restore the original values. *(This confirms the implementation, which differs from the 37231 AC.)*

---

TEST CASE 10
Title: Verify that fields missing from a UserProfileChanged keep their stored values, and that an empty profile is rejected

Tags: Remittances, User Profile Sync, Service Bus

Pre Conditions:
The following should be true before proceeding:
• The snapshot has `mothersMaidenName`, `gkoNumber`, `birthCountry`, `employmentInfo` and `hasValidProofOfAddress` filled in

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish a full `UserProfileChanged` (from the sample, with the customer's current values) that changes only `email` | `email` is updated; `mothersMaidenName`, `birthCountry`, `employmentInfo` (other than occupation/level) and `hasValidProofOfAddress` are unchanged, because the contract doesn't carry them. `gkoNumber` is unchanged, even though the event carries it (remittance keeps it, per the PE review) |
| 2. | Publish an event with `motherName` in `changedFields` | `mothersMaidenName` is unchanged (the payload has no property for it) |
| 3. | Publish an event whose `profile` has no tenant, email or names | The event is rejected; the snapshot is unchanged. Record whether the message is dead-lettered |
| 4. | Publish newer events with `address: null`, then `identificationDocument: null`, then `gkoNumber: null` | Record whether each null clears the stored value or keeps it (open question). A cleared address or ID document would be a significant finding |

Post Conditions:
The following should be true after test completion:
• Restore

---

TEST CASE 11
Title: Verify that remittance ignores an event whose occurrence time is at or before the stored one

Tags: Remittances, User Profile Sync, Service Bus, Ordering

Pre Conditions:
The following should be true before proceeding:
• The customer has a snapshot

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish event B (`occurredAtUtc` = T2) with `address.city` = `NEWER` | Applied |
| 2. | Cache the profile, then edit the container so that `address.city` = `DIRECT` | |
| 3. | Publish event A (T1, earlier than T2) with `OLDER` | Completed; the snapshot still shows `DIRECT`; the cache still serves `NEWER` |
| 4. | Publish event C with `occurredAtUtc` = T2 exactly and a new `eventId` | Ignored (equal time counts as old) |

Post Conditions:
The following should be true after test completion:
• Restore and flush

---

TEST CASE 12
Title: Verify that the same eventId delivered twice is applied once by both consumers

Tags: Remittances, Wallet, User Profile Sync, Service Bus

Pre Conditions:
The following should be true before proceeding:
• Both consumers' sync is on

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish event X changing `email` | Both copies are updated |
| 2. | Edit both copies directly to set `email` back to the old value | |
| 3. | Publish event X again (same `eventId`) | Both complete it. Remittance: ignored. Wallet: a replay, so only sync metadata is refreshed. `email` stays at the old value in both |

Post Conditions:
The following should be true after test completion:
• Restore

---

TEST CASE 13
Title: Verify that remittance dead-letters unsupported subjects, unmappable bodies and events with no eventId with the right reason

Tags: Remittances, User Profile Sync, Service Bus, Dead Letter

Pre Conditions:
The following should be true before proceeding:
• Access to the remittance dead-letter queue

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish a message with Subject `UserProfileDeleted` | Dead-lettered with `UnsupportedEventType` *(only if the subscription rule lets it through; record the result)* |
| 2. | Publish a `UserProfileChanged` with invalid JSON | Dead-lettered with `ParseFailure` |
| 3. | Publish a `UserProfileChanged` with no `eventId` | Dead-lettered with `ParseFailure` |
| 4. | Query the snapshot | Unchanged |

Post Conditions:
The following should be true after test completion:
• Clear the dead-letter queue

---

TEST CASE 14
Title: Verify that remittance applies a UserProfileChanged with an unsupported schemaVersion (finding: no version check)

Tags: Remittances, User Profile Sync, Service Bus, Contract

Pre Conditions:
The following should be true before proceeding:
• Both consumers' sync is on

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish a valid `UserProfileChanged` with `schemaVersion: 2`, changing `email` | **Remittance:** applied (it ignores `schemaVersion`). **Wallet:** dead-lettered with `InvalidEvent` |

Post Conditions:
The following should be true after test completion:
• Raise the remittance behaviour as a risk, and confirm with the team whether it's acceptable

---

TEST CASE 15
Title: Verify how the remittance subscription behaves while event sync is off and after it's turned back on

Tags: Remittances, User Profile Sync, Feature Flag, Service Bus

Pre Conditions:
The following should be true before proceeding:
• `EnableRemittanceUserProfileEventSync` is on, and the customer has a snapshot

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Turn the flag off and wait more than 1 minute | |
| 2. | Publish a valid `UserProfileChanged` changing `email` | Per the review, the subscription isn't read, so the message stays on the subscription. The snapshot is unchanged |
| 3. | Turn the flag on and wait more than 1 minute | The pending message is processed and the snapshot is updated (if it's still within the subscription TTL) |

Post Conditions:
The following should be true after test completion:
• *(37231's AC says events are drained without changes while the flag is off. The review describes them as not being read at all. Record which happens.)*

---

TEST CASE 16
Title: Verify that remittance handles both events from a KYC completion without rolling back data

Tags: Remittances, User Profile Sync, KYC, Service Bus

Pre Conditions:
The following should be true before proceeding:
• A customer about to complete eKYC; remittance sync is on

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete eKYC (`completeInfo`) | Both `UserProfileUpdated` and `UserProfileChanged` (`KycCompletion`) appear on the topic |
| 2. | Query the remittance snapshot | It's a full replacement from `UserProfileUpdated`. If that was applied first, the `UserProfileChanged` was dropped as older; the data is Tier 1 either way |

Post Conditions:
The following should be true after test completion:
• `kycStatus` = `TIER_1`

---

## IAM publisher

TEST CASE 17
Title: Verify that a published UserProfileChanged has the correct envelope, change source and masked card data

Tags: User Profile IAM, User Profile Sync, Service Bus, Security

Pre Conditions:
The following should be true before proceeding:
• You can peek at the topic; the customer has a prepaid card

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Change the customer's address in the app, then peek at the message | Subject = `UserProfileChanged`; `MessageId` = `eventId`; `schemaVersion` = 1; `changeSource` = `PrimaryAddressUpdate`; `changedFields` = `["address"]`; `occurredAtUtc` = the profile's `UpdatedAtUtc`; `correlationId` is a 32-character trace ID |
| 2. | Inspect the payload | `prepaidCardInfo.maskedCardNumber` shows only the first 6 and last 4 digits; no password, hash, tokens, full card number, CVV or outbox fields |
| 3. | Note the `kycStatus` / `kycTier` / `status` values | Record whether they're enum names or display names |

Post Conditions:
The following should be true after test completion:
• Repeat step 1 for each change source in the review's table as it gets covered

---

TEST CASE 18
Title: Verify which sensitive fields a KYC-completion UserProfileUpdated puts on the topic

Tags: User Profile IAM, User Profile Sync, Security, KYC

Pre Conditions:
The following should be true before proceeding:
• You can peek at the topic; a customer is about to complete eKYC (JM, so card data is involved)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete eKYC and peek at the `UserProfileUpdated` message | It's published |
| 2. | Search the payload for `password`, `hash`, `passcodeVerificationToken`, `emailVerification.token`, `creditCardInfo.cardNumber`, `wallet.cardNumber` and `wallet.cvv` | Record each one that's populated. **Any populated secret or full card data is a security defect** |

Post Conditions:
The following should be true after test completion:
• Findings go to a bug draft (the review flags this as finding 2)

---

TEST CASE 19
Title: Verify that a direct database edit to a User Profile record publishes no event

Tags: User Profile IAM, User Profile Sync

Pre Conditions:
The following should be true before proceeding:
• Write access to the IAM `Profiles` container

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Edit the customer's IAM document directly, then watch the topic for 1 minute | No event; neither copy changes |

Post Conditions:
The following should be true after test completion:
• Restore

---

TEST CASE 20
Title: Verify that profile changes stay pending while IAM dispatch is off and are published once it's turned on

Tags: User Profile IAM, User Profile Sync, Outbox, Feature Flag

Pre Conditions:
The following should be true before proceeding:
• `EnableProfileChangeOutboxDispatch` can be toggled in QA

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Turn dispatch off, then change the customer's address | The API call succeeds |
| 2. | Inspect the IAM document | A pending profile change is recorded; nothing is on the topic |
| 3. | Make a second, different change (occupational level) | Two pending changes, in order |
| 4. | Turn dispatch on | Both are published in recorded order within about 10 seconds; the pending entries are cleared |

Post Conditions:
The following should be true after test completion:
• This mirrors Production's current state (dispatch off, changes accumulating)

---

TEST CASE 21
Title: Verify that a profile change succeeds during a bus outage and is published once the bus is back

Tags: User Profile IAM, User Profile Sync, Outbox, Resilience

Pre Conditions:
The following should be true before proceeding:
• Dispatch is on, and the bus can be made unavailable to IAM

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Make the bus unavailable, then change the customer's address | The API call succeeds; the change stays pending; `oldest_pending_age` grows |
| 2. | Restore the bus | Published with a stable `eventId`; the entry is cleared; both copies converge |

Post Conditions:
The following should be true after test completion:
• No pending entries remain

---

TEST CASE 22
Title: Verify that only one IAM instance dispatches at a time and that the lease is released on shutdown

Tags: User Profile IAM, User Profile Sync, Outbox

Pre Conditions:
The following should be true before proceeding:
• Two IAM instances can run in QA

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Run two instances and make several changes | One instance holds the lease; each change is published once |
| 2. | Shut down the lease holder gracefully | The lease is released and the other instance takes over |

Post Conditions:
The following should be true after test completion:
• Real-Cosmos coverage of the lease logic

---

TEST CASE 23
Title: Verify that replace-card handles the Idempotency-Key header correctly

Tags: User Profile IAM, Wallet, Prepaid Card, API

Pre Conditions:
The following should be true before proceeding:
• A customer with an active card; API access

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Call `replace-card` with no header, with a valid UUID, with an empty value, and with `abc123` | Generated key echoed; supplied key echoed; 400 `ApiError`; 400 `ApiError` |

Post Conditions:
The following should be true after test completion:
• No PAN or token in any response

---

## Wallet

TEST CASE 24
Title: Verify that wallet dead-letters events that fail its validation with InvalidEvent

Tags: Wallet, User Profile Sync, Service Bus, Dead Letter

Pre Conditions:
The following should be true before proceeding:
• Access to the wallet dead-letter queue

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish `UserProfileChanged` events, one for each of these: `profile` null; `eventId` missing; `occurredAtUtc` more than 5 minutes in the future; `changedFields` null; `schemaVersion` 0; `profileId` not a GUID | Each is dead-lettered with `InvalidEvent`; the wallet profile is unchanged |
| 2. | Publish one with an `occurredAtUtc` 4 minutes in the future | Accepted (within the skew limit) |
| 3. | Publish an unparsable body | Dead-lettered with `ParseFailure` |

Post Conditions:
The following should be true after test completion:
• Refused messages are written to quarantine, and the affected profile is flagged `RefreshRequired`

---

TEST CASE 25
Title: Verify that wallet completes a UserProfileUpdated without applying it

Tags: Wallet, User Profile Sync, Service Bus

Pre Conditions:
The following should be true before proceeding:
• The customer has a wallet profile

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish a `UserProfileUpdated` (Subject `UserProfileUpdated`) for the customer with a changed email | Logged and completed; the wallet profile is unchanged |

Post Conditions:
The following should be true after test completion:
• *(The wallet subscription rule isn't provisioned by the repo. Record whether the message even reaches wallet.)*

---

TEST CASE 26
Title: Verify that wallet flags a profile when the broker gives up, and repairs it from Profile IAM on the next read

Tags: Wallet, User Profile Sync, Dead Letter

Pre Conditions:
The following should be true before proceeding:
• A way to force a message to the broker's delivery limit

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Force a `UserProfileChanged` for the customer to the delivery limit | The dead-letter processor completes it; the profile is flagged refresh-required |
| 2. | Trigger a wallet profile read | The profile is fetched from Profile IAM; the change source is `IamFetch`; the flag is cleared; it matches IAM |

Post Conditions:
The following should be true after test completion:
• The `…ProfilesFlagged` metric has incremented; no alert is expected (known issue)

---

TEST CASE 27
Title: Verify that wallet serves the stored profile when Profile IAM is down

Tags: Wallet, User Profile Sync, Resilience

Pre Conditions:
The following should be true before proceeding:
• Profile IAM can be made unavailable to wallet; one customer is flagged, and another has no wallet profile

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Make Profile IAM unavailable, then read the flagged customer | The stored row is served and stays flagged |
| 2. | Read the customer with no wallet profile | 503 (not 401 or "no profile") |

Post Conditions:
The following should be true after test completion:
• Restore Profile IAM

---

TEST CASE 28
Title: Verify that wallet ignores the fields it doesn't map from UserProfileChanged

Tags: Wallet, User Profile Sync, Service Bus

Pre Conditions:
The following should be true before proceeding:
• The customer has a wallet profile

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish an event changing only `occupationalLevel`, `status`, `cmsStatus` and `eligibility` | Completed; no wallet field changes; sync metadata advances |
| 2. | Publish an event changing `gkoNumber` and `customerNameVariations` | Both are updated on the wallet profile |

Post Conditions:
The following should be true after test completion:
• Restore

---

TEST CASE 29
Title: Verify that WalletUserProfileEventSyncEnabled is only picked up when wallet restarts

Tags: Wallet, User Profile Sync, Feature Flag

Pre Conditions:
The following should be true before proceeding:
• You can toggle the flag and restart wallet in QA

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Turn the flag off **without** restarting, then publish an event | Still applied (the flag is read once at startup) |
| 2. | Restart wallet, then publish another event | Not applied |
| 3. | Turn the flag on and restart | Applies again |

Post Conditions:
The following should be true after test completion:
• The flag is back on

---

TEST CASE 30
Title: Verify that the wallet cache flag, the replacement flag and a clean shutdown behave as described in the change request

Tags: Wallet, User Profile Sync, Feature Flag

Pre Conditions:
The following should be true before proceeding:
• The flags can be toggled; a batch of events can be published

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Turn `WalletUserProfileCacheEnabled` off, edit the wallet profile directly, then read it | The edited value is served (cache skipped) |
| 2. | Turn `PrepaidCardReplacementRequestsEnabled` off, then request a new replacement | 503 `SERVICE_UNAVAILABLE`; no operation is created; status lookups still work |
| 3. | Stop a wallet host while it's processing a batch | No error is logged; no message is abandoned |

Post Conditions:
The following should be true after test completion:
• All flags are restored

---

TEST CASE 31
Title: Verify that the remittance and wallet consumers map the event's address, eligibility and gender fields to their stored names

Tags: Remittances, Wallet, User Profile Sync, Service Bus, Contract

Pre Conditions:
The following should be true before proceeding:
• Both consumers' sync is on; the customer has both profile copies

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish a `UserProfileChanged` with distinct marker values: `address.line1` = `L1-TEST`, `line2` = `L2-TEST`, `parish` = `PARISH-TEST`, `postalCode` = `PC-TEST` | Remittance `address`: `street` = `L1-TEST`, `line2` = `L2-TEST`; record which field holds `PARISH-TEST` and `PC-TEST` (expected `state` / `zipCode`). Wallet `Address`: `parish` = `PARISH-TEST` |
| 2. | In the same or a newer event, set `eligibility.meetsMinimumEligibilityAge` to the opposite of the stored remittance `meetsTheMinimumEligibilityAge` | The remittance snapshot's `meetsTheMinimumEligibilityAge` changes |
| 3. | Set `gender` to `MALE` for a customer stored as `F` | Record the stored value in both copies (expected `M`, or `MALE` if no mapping) |

Post Conditions:
The following should be true after test completion:
• Restore the customer's real values; any field that doesn't update is a mapping defect candidate

---

## Notes

**Count:** 31 cases:
- Remittance cache and read path: 7
- Remittance event processing: 9 (plus the field-mapping check, TC 31)
- IAM publisher: 7
- Wallet: 7

**Possible defects these cases are set up to surface (raise as bug drafts if confirmed):**
- TC 18: `UserProfileUpdated` puts secrets and full card data on the topic.
- TC 14: remittance ignores `schemaVersion`.
- TC 10 step 2 (and app-journey TC 3): mother's maiden name never reaches remittance through events.
- TC 15: the remittance flag behaviour doesn't match the 37231 AC.

**Context applied:**
- **Primary context:**
  - The "Published events" review PDF: sections 1, 2.1–2.4, 3.1–3.2, 4.1, 4.2, 4.3 and 5.
  - `user-profile-sync/test-patterns.md`: the cache technique, the enablement drills.
  - `domain-knowledge.md`: the remittance resolver and the wallet projection.
  - `known-issues.md`: the missing quarantine alert.
  - Story notes 37227, 37231, 35690.
- **Related context:** none.
- **Marked content these cases lean on:**
  - The `[VERIFY]` on remittance parity with wallet (TC 6).
  - Null semantics (TC 10).
  - The not-found error code (TC 7).
