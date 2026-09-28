# Bug Report — Duplicate Account Email Notifications

## TITLE

Duplicate Account Detection Email Notifications Contain Multiple Defects: Repeated Sends, Design Mismatches, Broken Assets, and Incorrect Copy

## REPRO STEPS

1. Log in as a JM user who has NOT yet completed KYC (Target user)
2. Complete Ondato KYC using a TRN that matches an existing account in the system
3. Wait for `kycStatus = TRN_DUPLICATED` to be set by the backend
4. Check the Existing user's email inbox for the detection notification
5. As the Target user, proceed through the conflict reporting flow (either "Yes, recover this account" or "No, this is not me") and submit the report
6. Check the Target user's email inbox for the post-report confirmation notification

NB: Screenshots of both emails attached (detection email + confirmation email).

## EXPECTED BEHAVIOUR

**Detection email (to Existing user):**
- Sent **once** upon conflict detection
- Subject: "Your account has been temporarily suspended..."
- From: "GK One" (branded sender)
- Logo renders correctly
- Body informs user their account is temporarily suspended, explains TRN match, and provides guidance for both paths (TRN belongs to them / TRN is not theirs)
- Deep links present for `/merge-request` and `/not-my-account` (per domain-knowledge.md spec)

**Confirmation email (to Target user after report submission):**
- Sent once upon successful `reportConflict` submission
- Subject: "We've received your account review request"
- From: "GK One" (branded sender)
- Logo renders correctly
- Body confirms receipt and provides 1–2 business day timeline

## ACTUAL BEHAVIOUR / DESCRIPTION OF DEFECT

**Issue 1 — Detection email sent multiple times:**
- The detection notification is sent repeatedly to the Existing user rather than once
- Likely cause: no idempotency/deduplication guard on the notification trigger — each Ondato webhook invocation or status check re-fires the email

**Issue 2 — Detection email does not match approved designs:**
- Subject is wrong: actual shows "We found another account linked to your details" instead of "Your account has been temporarily suspended..."
- Sender name is "GKCO Team 40" instead of "GK One" (appears to be a test/placeholder value)
- Logo renders as broken image (alt text "[GKOne]" visible)
- Body copy takes a completely different approach — does not inform the user their account has been suspended
- Note: implementation DID add deep link CTAs ("Yes, this is my account" / "No, this isn't me") which the design was missing. These are a positive addition but the overall template still doesn't match.

**Issue 3 — Confirmation email sender and logo mismatch:**
- Subject and body copy match the design ✓
- Sender shows "GKCO Team \<gkonemgmt@gkco.com\>" instead of branded "GK One"
- Logo renders as broken image (same asset issue as detection email)
- Note: sender name is inconsistent between the two emails ("GKCO Team 40" vs "GKCO Team")

**Issue 4 — Contextually incorrect copy in both emails (design-level):**
- Detection email contains: "If you did not do this action, please query by calling 876-733-7722..."
- Confirmation email contains: "If you did not do this transaction, please query by calling 876-733-7722..."
- Both use transaction/action dispute language that is contextually wrong for a duplicate account conflict flow. This is present in the approved designs themselves — a design-level defect that needs PO/design review.

## SYSTEM INFO

- Environment: QA / Test
- Platform: Email (observed via Gmail inbox)
- Test account: naomi.qatesting+orin
- App version: N/A (backend-triggered emails)
- Date observed: 2026-06-15

## SEVERITY: Major

**JUSTIFICATION:** Classified as Major — the repeated email sends cause user confusion and could lead to duplicate actions via deep links; the broken logo and wrong sender name undermine brand trust; the missing suspension context in the detection email means users don't understand why their account is locked. No core flow is fully blocked (the in-app conflict flow still works), but the email communication channel is significantly degraded across multiple dimensions.

---

## Sub-Issues Summary (for potential splitting)

| # | Sub-issue | Could be separate bug? | Severity alone |
|---|-----------|----------------------|----------------|
| 1 | Detection email sent multiple times (no deduplication) | Yes — backend/notification service issue | Major |
| 2 | Detection email template doesn't match designs (subject, body, tone) | Yes — email template config issue | Minor |
| 3 | Broken logo in both emails | Yes — asset/CDN issue | Trivial |
| 4 | Sender name wrong/inconsistent ("GKCO Team 40" / "GKCO Team" vs "GK One") | Could bundle with #2/#3 | Trivial |
| 5 | "If you did not do this transaction/action" copy is wrong context | Separate — design-level defect, not implementation | Trivial (design feedback) |

> Recommendation: Consider splitting #1 (repeated sends) as its own bug since it's a different root cause (backend idempotency) vs the template/asset issues (#2–4).
