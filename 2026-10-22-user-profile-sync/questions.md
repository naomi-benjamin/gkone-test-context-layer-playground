# User Profile Sync — Questions for devs

> **Updated 2026-10-22 after the architect/dev meeting and the Published events review.** Answered questions have been removed, and their answers are in the feature docs (`squads/remittance/features/user-profile-sync/`). Items marked ✅ were partly answered earlier. Letters/numbers are kept as they were so references still line up.

## NEW: raised by the 35690 change requests

E. **The six uncovered writers.** Is the follow-up work item created? (It's required before enablement.) The remittance-relevant ones are `MergeOrchestrator` (CAM merge) and `FundsService.UploadProofAsync` (KYC status).
F. **PROFILE-10 guarantee vs accepted gap.** 35933 says any uncovered path fails the build; the IAM CR accepts six writers outside `EnforcedServiceTypes`.
H. **How much of the wallet behaviour does remittance have today?** The meeting agreed remittance should behave like wallet. Which parts are implemented: 503 on IAM outage, `RefreshRequired` on broker give-up, cache eviction on every outcome, the clamped watermark?
## P1: compliance correctness / blocking test design

4. **Which calls does "user profile validation" cover?** (37227) The meeting confirmed the forced refresh happens on user profile validation. Is that both WU Outbound calls (create and confirm)? Do P2P KYC and inbound eligibility go through it?
7. **API writes vs event writes.** (37227 / 37231)
   - Does a forced refresh or full-miss write update `syncInfo`, so that an older event arriving later can't overwrite fresh API data?
   - What is `changeSource` set to after an API write?
   - Does the API result replace the snapshot or merge into it?

## P2: data integrity / drift

8. ✅ *Partly answered: the phone partition move is confirmed (the `Profiles` container is partitioned by phone; `EnablePhoneNumberProfileMigration`). Whether `profileId` stays the same is still open.* **Phone change and `profileId`.** (35903) The phone number seems to be part of User Profile's partition key. Does `profileId` stay the same after a phone change? If not, consumers end up with a second record and leave the old one behind.
12. **Two CMS events.** (35914) Does any consumer subscribe to both `CrossCheckValidatedUserWithCms` and `UserProfileChanged`? If so, how is a double apply avoided? Where does wallet's `CmsProfileValidation` change source come from, given the publisher constant is `CmsValidationApplied`?
13. **Wallet KYC status vs tier.** (35908, 35914) A wallet record showed `KycStatus: NOT_COMPLETED` with `KycTier: TIER_1`. Is that combination valid? When does a reset or CMS cross-check leave the tier unchanged? Do consumers gate on status or on tier?
15. **Partial failures in the subscriber.** (37231) What happens if the container write succeeds but clearing the cache fails? What about container write failures and the maximum delivery count?

## P3: coverage gaps / scope

16. ✅ *Partly answered: the IAM CR lists the newly covered paths (including Ondato webhooks, CMS/Entra sync, identity conflicts) and six known uncovered writers (see E).* **Write paths outside the PROFILE-10 check.** (35933) User creation, deletion/account closure, CAM merge/archive/suspend, the OnDato webhook, identity-API email/phone changes (GK ID M6), and repository methods not named `UpdateAsync` / `UpdateUserAsync`. Do any of these write `GkOneUser` without publishing? Which paths are marked `RequiresPublish = false`? Can QA get the catalog?
17. **Deletion / account closure.** Do these propagate to local copies, and are the copies purged?
18. **Changes no PROFILE story covers.** What changes `isSanctioned` / `isPep` (screening)? ID document updates and expiry? Employment fields other than occupational level? Does an address change recalculate `hasValidProofOfAddress`, and does a TRN change recalculate `isTaxIdentificationNumberValidated` / trigger `TRN_DUPLICATED`, in the same event?
21. **No-op rules.** The email, phone, address, occupational level and KYC reset paths have no "skip when nothing changed" rule. Does an update to the same value publish?
22. **CAM approval timing.** (35891, 35908) Do the admin patch and Reset KYC go through maker-checker? Does the event fire on checker approval?
23. **Partial event null semantics.** Can a `UserProfileChanged` clear a field (null), or does null mean "not included"?
24. **"Identification history".** It's in the 37227 snapshot contents but not in the observed snapshot, and the event carries only the most recent document. Where does it come from?

## P4: test enablement

25. **Message tooling.** How can QA peek at messages on `ProfileIAmTopicName`, publish test events (including malformed ones and unsupported subjects), and read dead-letter reasons?
26. **Redis key structure.** Are profile entries namespaced per service? Can QA clear a single key instead of flushing everything?
27. **Not-found error.** (37227) The exact remittance error code or message for a required lookup with no profile anywhere.
28. **Startup.** (37227) Does "profile storage is available after application startup" mean the container is created automatically?
29. **KYC status enum.** The string value for status `0` (after a reset), and where `TRN_DUPLICATED` fits.
