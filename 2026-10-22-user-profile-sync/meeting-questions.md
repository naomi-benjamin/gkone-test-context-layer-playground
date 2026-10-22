# User Profile Sync — Meeting questions (architect + devs)

These are the open questions only. Answered ones have been moved into the feature docs (`squads/remittance/features/user-profile-sync/`). Questions are in priority order within each group. The full list is in `questions.md`.

---

## For the architect

### 1. Which wallet behaviours are planned for remittance?
"The code review shows remittance doesn't have wallet's refresh-required repair or the schemaVersion check, and it ignores events without clearing the cache. Since remittance is meant to behave like wallet, are those planned? And does remittance return a 503 if the Profile API is down during validation?"

**Answer:**

### 2. What's the plan for the six writers that don't publish?
"The IAM change request lists six places that still change the profile without sending an event, including the account merge and proof-of-funds upload. Has the follow-up ticket been created yet? The change request says it has to exist before the outbox gets switched on."

**Answer:**

---

## For the devs

### 3. Which calls does "user profile validation" cover?
"You said the forced refresh happens on user profile validation. Is that both WU Outbound calls, at create and at confirm? And do the P2P KYC check and inbound eligibility go through the same validation?"

**Answer:**

### 4. Can an older event overwrite fresh API data on the remittance snapshot?
"The review says remittance ignores events with an occurrence time at or before the stored one. When the forced refresh writes the snapshot from the API, does it update that stored time? If not, can an older event that arrives afterwards overwrite the fresh data?"

**Answer:**

### 5. Does the profile ID stay the same after a phone change?
"Since the phone number is part of the partition key in User Profile, a phone change moves the document. Does the profile ID stay the same afterwards? Otherwise remittance and wallet would end up with two records for the same person."

*Important. Still unanswered.*

**Answer:**

### 6. How can I test this end to end?
"What tool should I use to peek at and publish to `sbt-profile-iam-{env}` and see dead-letter reasons? Can I clear one user's cache entry instead of flushing all of Redis? Can remittance event sync be switched on in QA for testing, and who else needs to know about the backlog it'll process?"

**Answer:**

### 7. What does remittance do with a null in UserProfileChanged?
"The schema says every property is always written, so a cleared field arrives as null. If remittance gets `address: null` or `identificationDocument: null`, does it clear the stored value or keep it? And can you confirm the address mapping: is `line1` → `street`, `parish` → `state` and `postalCode` → `zipCode`? Is `gender: FEMALE` stored as `F`?"

**Answer:**

---

## If there's time
- "Is `KycStatus: NOT_COMPLETED` with `KycTier: TIER_1` on wallet a valid combination? Which one do consumers actually check?"
- "Account-deletion requests don't publish an event. Does anything else remove a deleted customer's data from the remittance and wallet copies?"
- "Do we want the `UserProfileUpdated` payload trimmed? The review says it can carry password, hash, tokens and the full card number. Who owns that change?"
- "What are the QA values of `EnablePhoneNumberProfileMigration` and `EnableIdentityConflictResolution`?"
