# User Profile Sync — Manual messaging and infrastructure test cases (draft 01)

**Scope:** cases that need the tester to publish or replay Service Bus messages, edit Cosmos documents directly, flush Redis, toggle feature flags, or simulate an outage. The app-journey cases are in `test-cases-app-journeys-draft.md`.

**Status:** first draft, 2026-10-22. Message tooling (how QA peeks at, publishes and dead-letters messages on `ProfileIAmTopicName`) is still an open question, so steps say "publish" without naming a tool.

**Global preconditions for this file:**
- QA environment. The tester can publish to, and peek at, the profile topic and the remittance and wallet subscriptions, including their dead-letter queues.
- The tester has write access to the `RemittanceUserProfiles` and `wallet.userprofiles` containers, and can flush Redis. **Flushing Redis clears every key for every service, so coordinate in shared environments.**
- The tester can toggle `EnableRemittanceUserProfileEventSync`, `WalletUserProfileCacheEnabled`, `PrepaidCardReplacementRequestsEnabled` and `EnableProfileChangeOutboxDispatch` through runtime configuration.
- A valid `UserProfileChanged` message body to start from. *(Pending: `sample-user-profile-changed-event.json`.)*

---

## Remittance: cache and read path

TEST CASE 1
Title: Verify that the remittance resolver serves the container copy on a cache miss and then serves the cached copy

Tags: Remittances, User Profile Sync, Cache, API

Pre Conditions:
The following should be true before proceeding:
• The customer has an existing remittance snapshot

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Flush Redis | |
| 2. | Edit the customer's snapshot directly in `RemittanceUserProfiles`: set `address.city` to a marker value, e.g. `CACHE-TEST-1` | |
| 3. | Trigger a general profile lookup (start a WU Outbound remittance and open the confirmation screen) | The confirmation shows `CACHE-TEST-1` (cache miss, so the container is read and the result cached) |
| 4. | Edit the snapshot directly again: set `address.city` to `CACHE-TEST-2` | |
| 5. | Trigger the same lookup again within 30 minutes | The confirmation still shows `CACHE-TEST-1` (cache hit) |

Post Conditions:
The following should be true after test completion:
• Restore the customer's real address on the snapshot and flush Redis

---

TEST CASE 2
Title: Verify that applying a profile change event clears the customer's cached remittance profile

Tags: Remittances, User Profile Sync, Cache, Service Bus

Pre Conditions:
The following should be true before proceeding:
• The customer's remittance profile is cached (TC 1 steps 1–3 completed, so the cache holds `CACHE-TEST-1`)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish a valid `UserProfileChanged` for the customer with a new `occurredAtUtc`, and `profile.address.city` = `EVENT-TEST` | The message is completed by the remittance subscriber |
| 2. | Query the snapshot | `address.city` = `EVENT-TEST`; `syncInfo.lastAppliedEventId` = the event's `eventId` |
| 3. | Trigger a general profile lookup | `EVENT-TEST` is shown (the cache was cleared; the container was read) |

Post Conditions:
The following should be true after test completion:
• Restore the real address and flush Redis

---

TEST CASE 3
Title: Verify that customer profile validation uses User Profile's data instead of a cached or stored copy

Tags: Remittances, User Profile Sync, Compliance, KYC

Pre Conditions:
The following should be true before proceeding:
• The customer is **not** Tier 1 in User Profile (e.g. `NOT_COMPLETED`)
• The customer has a remittance snapshot

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Edit the snapshot directly: set `kycStatus` to `TIER_1` | |
| 2. | Trigger a general lookup so the edited value is cached | |
| 3. | As the customer, attempt a WU Outbound remittance through to customer profile validation | The customer is blocked as not eligible (User Profile's value was used) |
| 4. | Query the snapshot | `kycStatus` has been overwritten with User Profile's value |

Post Conditions:
The following should be true after test completion:
• The snapshot matches User Profile; flush Redis

---

TEST CASE 4
Title: Verify that a remittance profile lookup succeeds when Redis is unavailable

Tags: Remittances, User Profile Sync, Cache, Resilience

Pre Conditions:
The following should be true before proceeding:
• The customer has a remittance snapshot
• Redis can be made unreachable for the remittance service in QA

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Make Redis unreachable for the remittance service | |
| 2. | As the customer, send a WU Outbound remittance to completion | The transaction completes, with correct participant details and no error shown |
| 3. | Check the remittance service logs | The cache failure is logged; no internal error appears in the API response |

Post Conditions:
The following should be true after test completion:
• Restore Redis

---

TEST CASE 5
Title: Verify that a remittance profile lookup falls back to the User Profile API when the snapshot can't be read

Tags: Remittances, User Profile Sync, Resilience

Pre Conditions:
The following should be true before proceeding:
• The `RemittanceUserProfiles` container can be made unreadable for the service (or the customer's snapshot deleted), and the cache flushed

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Flush Redis and make the container read fail (or delete the customer's snapshot) | |
| 2. | As the customer, send a WU Outbound remittance | The transaction completes with correct participant details, and no internal error is shown |
| 3. | If you deleted the snapshot, query the container | A new snapshot exists, matching User Profile |

Post Conditions:
The following should be true after test completion:
• The container is readable again

---

TEST CASE 6
Title: Verify that remittance returns a 503 when the User Profile API is down during customer profile validation

Tags: Remittances, User Profile Sync, Resilience, Compliance

Pre Conditions:
The following should be true before proceeding:
• The User Profile API can be made unavailable to the remittance service in QA

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Make the User Profile API unavailable | |
| 2. | As the customer, attempt a WU Outbound remittance through customer profile validation | The request fails with a 503, not a not-found or auth error, and no payment is taken |

Post Conditions:
The following should be true after test completion:
• Restore the User Profile API
• *(Based on "remittance should behave like wallet". Which parts are implemented is still open.)*

---

TEST CASE 7
Title: Verify that a required profile lookup returns the remittance not-found error when no source has the profile

Tags: Remittances, User Profile Sync, API

Pre Conditions:
The following should be true before proceeding:
• A user ID that doesn't exist in User Profile, the container or the cache

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Call a remittance endpoint that requires a profile, using the non-existent user ID | The existing remittance not-found error is returned *(exact code/message to confirm)*; no unhandled exception |
| 2. | Query the container | No snapshot was created |

Post Conditions:
The following should be true after test completion:
• No orphan data was created

---

## Remittance: event processing

TEST CASE 8
Title: Verify that a UserProfileChanged event creates a remittance snapshot when none exists

Tags: Remittances, User Profile Sync, Service Bus

Pre Conditions:
The following should be true before proceeding:
• The customer has no remittance snapshot

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish a valid `UserProfileChanged` for the customer | The message is completed |
| 2. | Query the container | A snapshot exists with the event's field values and `syncInfo` filled in |
| 3. | Record which remittance-stored fields are missing (for example `employmentInfo` beyond occupational level, sources of funds/wealth) | Record the result *(feeds the "remittance-only fields" edge case)* |

Post Conditions:
The following should be true after test completion:
• The snapshot can be used by the next lookup

---

TEST CASE 9
Title: Verify that compliance fields on a UserProfileChanged event are applied to the remittance snapshot

Tags: Remittances, User Profile Sync, Compliance, Service Bus

Pre Conditions:
The following should be true before proceeding:
• The customer's snapshot has `kycStatus: TIER_1`, `isSanctioned: false` and `trn` = value A

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish a `UserProfileChanged` with `kycStatus: NOT_COMPLETED`, `eligibility.isSanctioned: true` and `trn` = value B | The message is completed |
| 2. | Query the snapshot | All three fields show the event's values |

Post Conditions:
The following should be true after test completion:
• *(This confirms the implemented behaviour, which deliberately differs from the 37231 AC "Partial Updates Preserve Existing Compliance Data".)* Restore the original values

---

TEST CASE 10
Title: Verify that a field missing from a UserProfileChanged event keeps its stored value on the remittance snapshot

Tags: Remittances, User Profile Sync, Service Bus

Pre Conditions:
The following should be true before proceeding:
• The customer has a snapshot with `mothersMaidenName` filled in

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish a `UserProfileChanged` that changes `email` and **leaves `motherName` out** of the payload | The message is completed |
| 2. | Query the snapshot | `email` is updated; `mothersMaidenName` is unchanged |
| 3. | Publish another event with `motherName: null` | Record the result *(open question: does null clear the field, or count as missing?)* |

Post Conditions:
The following should be true after test completion:
• Restore the original values

---

TEST CASE 11
Title: Verify that an older event delivered after a newer one doesn't overwrite the remittance snapshot or clear the cache

Tags: Remittances, User Profile Sync, Service Bus, Ordering

Pre Conditions:
The following should be true before proceeding:
• The customer has a snapshot

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish event B (`occurredAtUtc` = T2) setting `address.city` = `NEWER` | The snapshot shows `NEWER` |
| 2. | Trigger a lookup to cache the profile, then edit the container directly so that `address.city` = `DIRECT` | |
| 3. | Publish event A (`occurredAtUtc` = T1, earlier than T2) setting `address.city` = `OLDER` | The message is completed (not retried or dead-lettered) |
| 4. | Query the snapshot | `address.city` = `DIRECT` (event A was not applied) |
| 5. | Trigger a lookup | `NEWER` is still served from the cache (event A didn't clear it) |

Post Conditions:
The following should be true after test completion:
• Restore the snapshot and flush Redis

---

TEST CASE 12
Title: Verify that the same event delivered twice is applied once

Tags: Remittances, Wallet, User Profile Sync, Service Bus

Pre Conditions:
The following should be true before proceeding:
• The customer has remittance and wallet snapshots

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish event X (a new `eventId`) changing `email` | Both snapshots are updated |
| 2. | Edit both snapshots directly to set `email` back to the old value | |
| 3. | Publish event X again with the same `eventId` | The message is completed on both subscriptions |
| 4. | Query both snapshots | `email` still shows the value from step 2 (the duplicate was a no-op) |

Post Conditions:
The following should be true after test completion:
• Remittance didn't clear the cache for the duplicate. Wallet clears the cache on every committed outcome, so its sync metadata may advance

---

TEST CASE 13
Title: Verify that an event with an unsupported subject is dead-lettered with a reason naming the event type

Tags: Remittances, User Profile Sync, Service Bus, Dead Letter

Pre Conditions:
The following should be true before proceeding:
• Access to the remittance subscription's dead-letter queue

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish a message to the topic with an unsupported subject (e.g. `UserProfileDeleted`) | |
| 2. | Check the remittance dead-letter queue | The message is dead-lettered with a reason that names the unsupported type |
| 3. | Query the customer's snapshot | Unchanged |

Post Conditions:
The following should be true after test completion:
• Clear the test message from the dead-letter queue

---

TEST CASE 14
Title: Verify that a malformed profile event is dead-lettered with a parse-failure reason and changes no data

Tags: Remittances, User Profile Sync, Service Bus, Dead Letter

Pre Conditions:
The following should be true before proceeding:
• The customer has a snapshot

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish a `UserProfileChanged` with an invalid JSON body | The message is dead-lettered with a parse-failure reason |
| 2. | Publish a `UserProfileChanged` with valid JSON in the wrong shape (e.g. `profile` missing) | The message is dead-lettered with a parse-failure reason |
| 3. | Query the snapshot | Unchanged |

Post Conditions:
The following should be true after test completion:
• Clear the test messages

---

TEST CASE 15
Title: Verify that events are completed without changing data while remittance event sync is turned off, and processing resumes when it's turned back on

Tags: Remittances, User Profile Sync, Feature Flag, Service Bus

Pre Conditions:
The following should be true before proceeding:
• `EnableRemittanceUserProfileEventSync` is on, and the customer has a snapshot

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Turn `EnableRemittanceUserProfileEventSync` off in runtime configuration (no redeploy) | |
| 2. | Publish a valid `UserProfileChanged` changing `email` | The message is completed; no error is logged; the snapshot is unchanged |
| 3. | Turn the flag back on (no redeploy) | |
| 4. | Query the snapshot | Still the old email (the event from step 2 is gone; there's no catch-up) |
| 5. | Publish another valid `UserProfileChanged` changing `email` | The snapshot is updated |

Post Conditions:
The following should be true after test completion:
• The flag is back on; restore the email

---

## IAM publisher

TEST CASE 16
Title: Verify that a published UserProfileChanged event has the correct envelope and no sensitive fields

Tags: User Profile IAM, User Profile Sync, Service Bus, Security

Pre Conditions:
The following should be true before proceeding:
• You can peek at messages on `ProfileIAmTopicName`

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Change the customer's email in the app | |
| 2. | Peek at the resulting `UserProfileChanged` | `schemaVersion` = 1; `eventType` = `UserProfileChanged`; `eventId`, `occurredAtUtc` and `profileId` are present; `changeSource` = `EmailUpdate`; `changedFields` = `["email"]` exactly |
| 3. | Inspect `profile` | The new email is present; field names are camelCase; `eligibility` and `paymentReferences` blocks are present |
| 4. | Search the whole payload for password, hash, passcode/OTP tokens, login attempts, lockout, raw PAN, wallet balance and outbox state | None are present; the card is only tokenized or masked |

Post Conditions:
The following should be true after test completion:
• Repeat steps 2–4 for each write path as the publish-point documentation confirms it

---

TEST CASE 17
Title: Verify that a direct database edit to the User Profile record publishes no event

Tags: User Profile IAM, User Profile Sync, Service Bus

Pre Conditions:
The following should be true before proceeding:
• Write access to the IAM `Profiles` container

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Edit the customer's IAM document directly (e.g. change `firstName`) | |
| 2. | Watch the topic and both snapshots for [expected propagation time] | No `UserProfileChanged` is published; neither snapshot changes |

Post Conditions:
The following should be true after test completion:
• Restore the IAM document

---

TEST CASE 18
Title: Verify that a profile change still succeeds and is published later when the bus is unavailable

Tags: User Profile IAM, User Profile Sync, Outbox, Resilience

Pre Conditions:
The following should be true before proceeding:
• `EnableProfileChangeOutboxDispatch` is on
• The bus (or topic) can be made unavailable to IAM

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Make the bus unavailable (stop it, or point at an invalid topic) | |
| 2. | Change the customer's address in the app | The API call succeeds |
| 3. | Inspect the customer's IAM document | A pending outbox change exists |
| 4. | Check the `GKOne.UserProfileIam.ProfileSync` metrics | `oldest_pending_age` is growing; `publish.failures` is increasing |
| 5. | Restore the bus | The pending change is published with a stable `eventId`; `profile_sync.outbox.published` increments; the outbox entry is cleared |
| 6. | Query both snapshots | Both show the new address |

Post Conditions:
The following should be true after test completion:
• No pending outbox entries remain for the customer

---

TEST CASE 19
Title: Verify that only one IAM instance holds the outbox dispatch lease and that it's released on shutdown

Tags: User Profile IAM, User Profile Sync, Outbox

Pre Conditions:
The following should be true before proceeding:
• `EnableProfileChangeOutboxDispatch` is on and two IAM instances can be run in QA

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Run two IAM instances | |
| 2. | Inspect the lease document in `ProfilePartitionMigrations` | One instance holds the lease |
| 3. | Make several profile changes | Each is published once |
| 4. | Shut down the lease holder gracefully | The lease is released, and the other instance takes over dispatch |

Post Conditions:
The following should be true after test completion:
• *(This is the only real-Cosmos check of the lease logic, which is mocked in unit tests per PROFILE-52.)*

---

TEST CASE 20
Title: Verify that replace-card handles the Idempotency-Key header correctly

Tags: User Profile IAM, Wallet, Prepaid Card, API

Pre Conditions:
The following should be true before proceeding:
• A customer with an active prepaid card; API access to `replace-card`

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Call `replace-card` with no `Idempotency-Key` header | Success; the response echoes a generated key |
| 2. | Call `replace-card` with a valid UUID key | Success; the response echoes the same key |
| 3. | Call `replace-card` with an empty key | 400 `ApiError` |
| 4. | Call `replace-card` with a non-UUID key (e.g. `abc123`) | 400 `ApiError` |

Post Conditions:
The following should be true after test completion:
• No raw PAN or token appears in any response

---

## Wallet

TEST CASE 21
Title: Verify that wallet flags a profile for refetch when the broker gives up on a message, and refetches it on the next read

Tags: Wallet, User Profile Sync, Dead Letter, Service Bus

Pre Conditions:
The following should be true before proceeding:
• A known customer with a wallet snapshot; a way to force a message to `MaxDeliveryCountExceeded`

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Force a `UserProfileChanged` for the customer to reach `MaxDeliveryCountExceeded` | The message is completed; the snapshot's `SyncSource` = `RefreshRequired` |
| 2. | Check the metric `WalletUserProfileSyncDeadLetterProfilesFlagged` | It has incremented |
| 3. | Trigger a wallet profile read | The profile is refetched from Profile IAM; the snapshot matches IAM and is no longer flagged |
| 4. | Trigger another read while the profile is still flagged (repeat step 1 first) | The flagged profile isn't served from the cache |

Post Conditions:
The following should be true after test completion:
• No alert is expected on quarantine loss (known issue). Check the metrics directly

---

TEST CASE 22
Title: Verify that poison and unknown-user messages are written to the wallet dead-letter audit container

Tags: Wallet, User Profile Sync, Dead Letter

Pre Conditions:
The following should be true before proceeding:
• Read access to the `ProfileSyncDeadLetters` container

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish a malformed `UserProfileChanged` | A record appears in `ProfileSyncDeadLetters` |
| 2. | Publish a valid `UserProfileChanged` for a `profileId` that doesn't exist | A record appears in `ProfileSyncDeadLetters`; no snapshot is created |
| 3. | Check the records' TTL | 14 days |

Post Conditions:
The following should be true after test completion:
• No replay happens (replay has been removed)

---

TEST CASE 23
Title: Verify that wallet returns a 503 and serves stored data to flagged users when Profile IAM is down

Tags: Wallet, User Profile Sync, Resilience

Pre Conditions:
The following should be true before proceeding:
• Profile IAM can be made unavailable to wallet; one customer is flagged `RefreshRequired`; another has no wallet snapshot

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Make Profile IAM unavailable | |
| 2. | Trigger a wallet read for the customer with no snapshot | 503 (not 401 or "no profile") |
| 3. | Trigger a wallet read for the flagged customer | The stored profile is served; it stays flagged and isn't cached |

Post Conditions:
The following should be true after test completion:
• Restore Profile IAM

---

TEST CASE 24
Title: Verify that wallet skips the cache when WalletUserProfileCacheEnabled is off but still clears entries after writes

Tags: Wallet, User Profile Sync, Feature Flag, Cache

Pre Conditions:
The following should be true before proceeding:
• The customer's wallet profile is cached

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Turn `WalletUserProfileCacheEnabled` off | |
| 2. | Edit the wallet snapshot directly and trigger a read | The edited value is served (the cache was skipped) |
| 3. | Publish a `UserProfileChanged` for the customer | The snapshot is updated; the cache entry is cleared |
| 4. | Turn the flag back on and trigger a read | The event's value is served (no stale cached entry) |

Post Conditions:
The following should be true after test completion:
• The flag is back on

---

TEST CASE 25
Title: Verify that new card replacement requests are refused when PrepaidCardReplacementRequestsEnabled is off

Tags: Wallet, Prepaid Card, Feature Flag

Pre Conditions:
The following should be true before proceeding:
• A customer with an active card and a replacement already in progress (for the status-lookup check)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Turn `PrepaidCardReplacementRequestsEnabled` off | |
| 2. | Request a new card replacement in the app | 503 `SERVICE_UNAVAILABLE`; no operation or message is created |
| 3. | Look up the status of the in-progress replacement | The status is returned normally |
| 4. | Retry the in-progress replacement | The retry proceeds |

Post Conditions:
The following should be true after test completion:
• The flag is back on (QA default)

---

TEST CASE 26
Title: Verify that stopping a wallet host mid-processing logs no error and abandons no message

Tags: Wallet, User Profile Sync, Resilience

Pre Conditions:
The following should be true before proceeding:
• A steady flow of profile events to wallet

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Publish a batch of `UserProfileChanged` events | |
| 2. | Stop a wallet host while processing | No error is logged for the cancellation; no message is abandoned |
| 3. | Restart and let processing finish | Every event is applied once |

Post Conditions:
The following should be true after test completion:
• Application Insights shows producer-to-consumer trace correlation for the processed events

---

## Notes

**Count:** 26 cases:
- Remittance cache and read path: 7
- Remittance event processing: 8
- IAM publisher: 5
- Wallet: 6

By category: happy path 5 (TC 1, 2, 8, 16, 18), alternate 6, negative / error 8, edge 7.

**Assumptions to confirm:**
- **Message tooling.** It's an open question how QA publishes, peeks at and dead-letters messages. Steps assume a tool exists.
- **Remittance and wallet parity.** TC 6 assumes remittance returns a 503 when the User Profile API is down, like wallet. Which wallet behaviours remittance actually has is still open.
- **Null vs missing fields.** TC 10 step 3 records the result; the expected behaviour isn't defined yet.
- **Not-found error.** TC 7: the exact remittance error code or message isn't known yet.
- **Event-sync flag default.** The default value of `EnableRemittanceUserProfileEventSync` isn't documented.
- **Left out on purpose:**
  - **Future-dated events tying on the wallet watermark:** an accepted limitation until PROFILE-41.
  - **Clock skew over 30 seconds:** not practical to test in QA.
  - **409 on concurrent IAM updates:** can be added if wanted.

**Context applied:**
- **Primary context:** `user-profile-sync/`:
  - `domain-knowledge.md`: read path, consumer rules, the IAM outbox and the wallet projection.
  - `test-patterns.md`: the cache verification technique (TC 1–3, 11), the enablement drills (TC 16, 18–26), the negative angles.
  - `known-issues.md`: no quarantine alert (TC 21).
  - `edge-cases.md`: events discarded while the flag is off (TC 15); remittance-only fields (TC 8); missing fields keep stored values (TC 10).
  - Story notes 37227, 37231, 35882, 35690.
- **Related context:** none beyond the primary feature. These cases are all infrastructure-level.
- **Marked content these cases lean on:**
  - The `[VERIFY]` on remittance parity with wallet (TC 6).
  - The message-tooling question (all event cases).
  - The open null-semantics question (TC 10).
