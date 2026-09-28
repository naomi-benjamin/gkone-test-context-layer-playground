# Test Session Notes for M1 First Round — *customer-account-management*

Date: 2026-06-15

---

## Observation 1: Existing account suspended at detection, not at report submission — ✅ RESOLVED (intentional)

**Observed:** When the Target user's status was set to `TRN_DUPLICATED`, the Existing account was immediately put under review — before the Target had filed any report.

**Resolution:** Confirmed intentional by management. The Existing account IS meant to be immediately suspended at detection time. Domain-knowledge.md has been updated to reflect this.

**Test case impact:**
- TC 5 post-condition "Neither account is suspended" needs updating — the Existing account WILL be suspended even if the Target abandons the flow
- TC 1 and TC 2 post-conditions are still valid (both suspended after report), but Existing was already suspended before report

---

## Observation 2: Duplicate account email notification sent multiple times

**What was expected (per domain-knowledge.md, "Duplicate account notifications"):**
A single email notification is sent to the Existing account holder informing them that a conflict has been detected. The email reads: "We found another account linked to your details" and includes a deep link for action (`/merge-request` or `/not-my-account`).

**What actually happened:**
The email notification ("We found another account linked to your details — GKOne Hello ORIN, During our recent verification process, we found an existing account that appears to be linked to your TRN or personal details…") was sent **multiple times** to the Existing user (ORIN).

**Impact:**
- User confusion — receiving repeated conflict notifications implies system instability or multiple conflicts
- If each email contains a deep link, multiple emails could lead to the user tapping into the flow multiple times (potential duplicate report submissions or race conditions)
- Relates to Observation 1 — if the notification fires at detection time (not report time), it may be re-triggering on every webhook call or status check rather than deduplicating

**Likely causes:**
- Ondato webhook firing multiple times (retry behaviour) and each invocation triggering a notification without idempotency check
- Notification service not deduplicating — no guard against "already notified for this conflict"
- Status change event being re-emitted (e.g. `TRN_DUPLICATED` set more than once)

**To confirm:**
- [ ] How many times was the email received? (exact count)
- [ ] Is there a deduplication mechanism on the notification service for conflict emails?
- [ ] Check backend logs: was the Ondato webhook received multiple times, or was the notification triggered multiple times from a single webhook?
- [ ] Does the notification fire at detection (`TRN_DUPLICATED` set) or at report submission? (ties into Obs 1)

---

## Observation 3: Duplicate detection email does not match designs

**Design (approved template):**
- **Subject:** "Your account has been temporarily suspended..."
- **From:** GK One (branded avatar)
- **Body:**
  > Hello John,
  >
  > During our recent verification process, we detected that the **TRN provided for this account matches a TRN already used on another profile**.
  >
  > This does not necessarily mean the accounts are linked; however, to protect customers and prevent unauthorised activity, this account has been **temporarily flagged and suspended** while we complete a review.
  >
  > If the TRN belongs to you, we'll guide you through the next steps to verify your details and ensure your account information is accurate.
  >
  > If the TRN is not yours, our team will review your report to help protect your information and prevent misuse.
  >
  > Thanks for helping us keep your account safe
  >
  > If you did not do this action, please query by calling 876-733-7722 or via email at mygkone@gkco.com.
- **Footer:** The GK ONE Team / www.gkmsonline.com / social links / © 2023 GK One

**Design gap:** The design mentions "we'll guide you through the next steps" and "our team will review your report" but contains **no deep links or CTA buttons** for `/merge-request` or `/not-my-account`. Per domain-knowledge.md, these links should be in the email. Either the design is incomplete or the spec has diverged.

**What was actually implemented (full email):**
- **Subject:** "We found another account linked to your details"
- **From:** "GKCO Team 40"
- **Logo:** GKOne (broken image — alt text only)
- **Body:**
  > Hello ORIN,
  >
  > During our recent verification process, we found an existing account that appears to be linked to your TRN or personal details.
  >
  > To make sure your information stays secure and up to date, please confirm whether this is your account:
  >
  > 👍 **Yes, this is my account** *(red link — likely deep link to /merge-request)*
  >
  > 👍 **No, this isn't me** *(red link — likely deep link to /not-my-account)*
  >
  > If it's yours, we'll help you securely merge your information and keep everything under one profile.
  >
  > If it isn't, our team will review your report to ensure your data remains protected.
  >
  > Thanks for helping us keep your account safe.
  >
  > If you did not do this action, please query by calling 876-733-7722 or via email at mygkone@gkco.com.
- **Footer:** The GKOne Support Team / www.gkmsonline.com

**Discrepancies — Design vs Actual:**

| # | Element | Design | Actual | Verdict |
|---|---------|--------|--------|---------|
| 1 | Subject | "Your account has been temporarily suspended..." | "We found another account linked to your details" | ✗ Different |
| 2 | Sender | "GK One" (branded) | "GKCO Team 40" | ✗ Wrong/placeholder |
| 3 | Logo | Renders correctly | Broken image (alt text) | ✗ Asset issue |
| 4 | Greeting | "Hello John," | "Hello ORIN," | ✓ Correct personalisation |
| 5 | Tone | Formal — emphasises suspension, explains TRN match technically | Friendlier — asks user to confirm, explains merge/report outcomes | ✗ Different copy approach |
| 6 | Suspension mention | Explicitly states "temporarily flagged and suspended" | No mention of suspension | ✗ Missing — user doesn't know they're suspended |
| 7 | Deep link CTAs | **Not present** (design gap) | "Yes, this is my account" / "No, this isn't me" links present | ✓ Implementation added what design missed |
| 8 | Footer team name | "The GK ONE Team" | "The GKOne Support Team" | ✗ Minor mismatch |
| 9 | "If you did not do this action" | Present | Present | ⚠️ Both have it — still contextually wrong for conflict flow |

**Summary:**
The implementation went a different direction from the design. It's arguably **better in some ways** (has deep link CTAs, friendlier tone, actionable) but doesn't match approved designs. Key mismatches:
- Subject is completely different (and doesn't mention suspension)
- Body copy doesn't inform the user their account is suspended — the design explicitly does
- Sender name appears to be a test/placeholder value

**To confirm:**
- [ ] Was a revised design approved that the implementation followed? (possible the design screenshot is v1 and a v2 exists)
- [ ] Confirm deep links work: do "Yes, this is my account" and "No, this isn't me" actually link to `/merge-request` and `/not-my-account`?
- [ ] Should the email explicitly mention suspension? Design says yes; implementation omits it
- [ ] Is "GKCO Team 40" a test environment sender or production config?

---

## Observation 4: Post-report confirmation email — partial design match, copy issue remains

**Context:** After the Target user (ORIN) filed a conflict report, a confirmation email was received.

**Design (approved template):**
- **Subject:** "We've received your account review request"
- **From:** GK One (branded avatar)
- **Body:** "Hello John, Thanks for letting us know. Our team will review your case to ensure your data stays secure. You'll receive an update within 1–2 business days once we've verified your information. If you did not do this transaction, please query by calling 876-733-7722 or via email at mygkone@gkco.com."
- **Footer:** The GK ONE Team / www.gkmsonline.com / social links / Terms of Use / Privacy Statement / © 2023 GK One

**Email received:**
- **Subject:** "We've received your account review request" ✓ matches
- **From:** GKCO Team \<gkonemgmt@gkco.com\> ✗ (design shows "GK One" branded)
- **To:** naomi.qatesting+orin
- **Body copy:** Matches design ✓
- **Footer:** The GKOne Team / www.gkmsonline.com ✓ (partial match — social links/legal present?)
- **Logo:** Broken image in test env (renders correctly in design) ✗

**Remaining issues:**

| # | Issue | Type | Notes |
|---|-------|------|-------|
| 1 | **Broken logo image** | Implementation | GKOne header logo renders as broken/alt-text in test; design shows it rendering correctly |
| 2 | **Wrong copy: "If you did not do this transaction"** | Design issue | This copy IS in the approved design — but it's transaction dispute language, not duplicate account language. The design itself needs updating; this doesn't make sense in the context of a conflict report |
| 3 | **Sender name mismatch** | Implementation | Design shows "GK One" (branded); actual shows "GKCO Team \<gkonemgmt@gkco.com\>". Obs 3 showed "GKCO Team 40" — inconsistent across emails |
| 4 | **Copyright year** | Design issue | Footer shows "© 2023" — stale, should be 2025 or 2026 |

**Verdict:** Email body/subject largely matches design. The "If you did not do this transaction" copy is a **design-level defect** — it was approved with wrong contextual language. Flag to PO/design for copy revision. Implementation issues are the broken logo and wrong sender name.

**To confirm:**
- [ ] Raise "If you did not do this transaction" copy issue with PO/design — should reference account conflict, not a transaction
- [ ] Is the broken logo a test environment asset issue?
- [ ] Is sender "GKCO Team" a test env alias or a config that needs updating to match "GK One" branding?

---

## Observation 5: Non-JM market isolation is broken — duplicate detection fires for non-JM accounts

**Failed test cases:**
- **TC 15:** "Verify that duplicate detection does NOT fire for non-JM market accounts with matching identifiers" — **FAILED**
- **TC 16:** "Verify that the Home v2 conflict tile and reporting flow are not surfaced to non-JM users" — **FAILED**

**What was expected (per domain-knowledge.md, "Market scope"):**
This feature is scoped to **Jamaica (JM) only**. The documented risk explicitly states non-JM flows must not be affected:
- Ondato webhook processing should be **market-gated** (only fires `TRN_DUPLICATED` for JM accounts)
- Home v2 conflict tile and reporting flow should **not** be surfaced to non-JM users
- No shared backend state should inadvertently match across markets

**What actually happened:**
Both market isolation tests failed — meaning:
1. Duplicate detection IS firing for non-JM accounts (webhook processing is NOT market-gated)
2. The conflict tile and/or reporting flow IS being surfaced to non-JM users

**Impact:**
- **High severity** — non-JM users could be incorrectly flagged as duplicates, suspended, and locked out of their accounts based on identifier matching that was never designed for their market
- Cross-market false positives: different markets use different identifiers (e.g. GKONumber vs TRN). If detection fires on non-JM accounts, it could match on unrelated identifier overlaps
- Existing non-JM users who happen to share an identifier value with a JM account could be pulled into conflict resolution flows they have no context for
- Potential regulatory issue if users in other jurisdictions are suspended without market-appropriate process

**Severity assessment:** Critical — this is a scope leak that could affect production users in non-JM markets. The feature was explicitly designed as JM-only and the isolation boundary is not enforced.

**To confirm:**
- [ ] Which non-JM market was tested? (GKONumber?)
- [ ] Did the non-JM user actually get `TRN_DUPLICATED` status, or just the UI tile?
- [ ] Was the non-JM user's account suspended?
- [ ] Is this a backend issue (webhook not market-gated) or a frontend issue (UI not checking market), or both?
- [ ] Did the non-JM conflict appear on the admin panel under `/identity-conflicts`?

**Resolution**
- If TRN present then match TRN & Country
- Also ensure that the acc is not archived


# Obsv 3: no feature flags

2+ Gaps & archive shouldnt be apart of the match 