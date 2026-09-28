# Bug Draft — eKYC: User stuck at KycStatus 4 with no recovery when CMS is unavailable

**Discovered during:** CMS retry investigation (2026-05-12)
**Date:** 2026-05-12

---

## ADO Fields

**Title:** eKYC — User permanently stuck at KycStatus 4 with no recovery path when CMS is down at time of check

**Severity:** High
<!-- KycStatus 4 is a transitional state: Ondato has passed but the CMS check has not yet completed. If CMS is unavailable when the check runs, the check neither passes nor fails — the user is left in KycStatus 4 indefinitely. There is no retry UI, no failure state, no banner, and no in-app recovery. The user's onboarding is silently blocked. -->

**Area Path:** GKOne\Market Expansion

**Found in:** Current (non-JM markets — KY, VG, GY, TT)

---

## Repro Steps

1. Set up a non-JM market test account (KY, VG, GY, or TT) that has not yet completed eKYC.
2. In the test environment, configure CMS to be unavailable (e.g. simulate a service outage or network timeout for the CMS lookup endpoint).
3. Launch the eKYC flow and complete the Ondato identity verification step with a passing test identity.
4. Observe the outcome after Ondato completes.

**Credentials needed:**
- Non-JM market account, pre-KYC
- Test environment with ability to simulate CMS unavailability

---

## Expected Result

When the CMS service is unavailable at the time of the check:

- The system should detect the failure and either:
  - Retry the CMS check automatically (with backoff), or
  - Transition the user to KycStatus 8 and surface the standard CMS failure UI (banner + Documents Required screen + Retry ID Verification option), or
  - Hold the user in a pending state and re-attempt the check when CMS recovers, with the user notified of the delay.
- The user should never be left in a non-terminal state with no path forward.

---

## Actual Result

- After Ondato completes, KycStatus transitions to 4 (Pending to be processed) as expected.
- The CMS check does not complete because CMS is unavailable.
- KycStatus remains at 4 indefinitely — it does not transition to 1 (Verified) or 8 (CMS check failed).
- **No failure banner is shown** on the Home screen (the "We couldn't confirm your identity." banner requires KycStatus 8, which is never set).
- **No retry option is available** — the Documents Required screen and Retry ID Verification flow are only accessible from KycStatus 8.
- The user is silently stuck: onboarding is blocked with no in-app indication, no recovery path, and no support guidance.

---

## Why This Matters

- A CMS outage — even a brief one — can leave any user who completes Ondato during that window permanently stuck with no self-service resolution.
- The existing CMS retry feature (Retry ID Verification) does not help: it only surfaces for KycStatus 8, not KycStatus 4.
- There is no CSR tool or in-app mechanism documented for moving a user out of KycStatus 4 if the CMS check never completes.
- Impact scales with outage duration: any user completing Ondato during the outage window is affected.
- Silent failure makes it invisible: users see a normal home screen (no banner) and do not know their onboarding is blocked.

---

## Notes / Open Questions

- Is there a server-side timeout on the CMS check? If CMS does not respond within N seconds, does the platform treat it as a failure (→ KycStatus 8) or leave the check pending?
- Is there a background retry mechanism for stuck KycStatus 4 records that isn't surfaced in-app?
- Can CSRs manually trigger a CMS re-check or advance a user out of KycStatus 4?
- Does the system emit any alert or monitoring event when a CMS check times out, or is it fully silent?
- Is KycStatus 4 visible in the admin/CSR tooling, or does it appear as "pending" with no further detail?

---

## Context Applied

- `squads/platform/features/ekyc/domain-knowledge.md` — KycStatus reference table; CMS check trigger, failure states, and retry flow
- `squads/platform/features/ekyc/integration-points.md` — CMS as upstream dependency; failure behaviour section
- `playground/2026-05-12-ekyc-cms-retry/test-cases-draft.md` — CMS retry test cases (all assume KycStatus 8 as the failure entry point; none cover the KycStatus 4 stuck state)
