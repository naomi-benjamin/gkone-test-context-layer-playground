# Bug Draft — P2P: Generic error shown immediately when recipient is KYC Tier 0

**Discovered during:** Testing of US-31429 (P2P CMS Block Error Handling)
**Date:** 2026-04-29

---

## ADO Fields

**Title:** P2P — Generic error displayed immediately on recipient entry when receiver is KYC Tier 0

**Severity:** Medium
<!-- KYC ineligibility is a real user scenario. The transaction is correctly blocked, but the user gets no actionable guidance — they cannot tell whether something went wrong with the app or whether the recipient is ineligible. The designed ineligibility screen (which directs them to contact the recipient) is never shown. -->

**Area Path:** Remittances / P2P

**Found in:** V2

---

## Repro Steps

1. Log in as a sender with KYC Tier 2 and a valid prepaid card.
2. Navigate to the P2P send flow.
3. In the recipient entry field, enter the phone number (or email address) of a user who is KYC Tier 0.
4. Observe the result.

**Credentials needed:**
- Sender: KYC Tier 2, valid card
- Receiver: KYC Tier 0 (ineligible to receive P2P)

---

## Expected Result

Per the designed flow for receiver KYC ineligibility:

1. Recipient's name resolves and is displayed after entry.
2. Sender selects the name.
3. An ineligibility error screen is shown with:
   - A message indicating the recipient cannot receive a transfer.
   - A single **"Back to Home"** CTA (no "Contact Support" option).
4. The sender cannot proceed to the amount or payment stages.

---

## Actual Result

After entering the phone number or email of a KYC Tier 0 user:

- The recipient name does **not** resolve.
- A generic error screen ("something went wrong") is displayed **immediately** — before any recipient selection step.
- The specific ineligibility error screen with "Back to Home" CTA is never shown.
- The sender receives no actionable guidance.

**Note:** Exact copy of the generic error screen to confirm — user observed approximately "something went wrong." Capture the exact string when reproducing.

---

## Why This Matters

- The designed early-surfacing ineligibility error (which directs the sender to contact the recipient) is completely bypassed for KYC Tier 0 receivers.
- The sender cannot distinguish an app error from a recipient eligibility issue.
- This also means the designed US-31429 error path is untestable for this user state, since the flow breaks before it can be reached.
- Potentially indicates the backend is returning an unexpected error response for KYC Tier 0 users at the recipient lookup stage (rather than returning a resolvable "user exists but ineligible" response).

---

## Notes / Open Questions

- Does this affect KYC Tier 1 receivers as well, or only Tier 0? (Tier 2 is required for both parties — Tier 1 may behave differently.)
- Is this reproducible with both phone number and email as entry methods? (Observed with phone number; email not confirmed.)
- Does V1 exhibit the same behaviour, or is this V2-specific?
- Is the generic error coming from the recipient lookup call itself failing, or from a frontend handling gap?

---

## Context Applied

- `squads/remittance/features/p2p/domain-knowledge.md` — Eligibility table, two distinct error patterns, early-surfacing ineligibility error design
- `squads/remittance/features/p2p/integration-points.md` — KYC / Customer Profile Service integration note
- `playground/US-31429-p2p-cms-block-error/notes.md` — Story context (CMS block error screen design, late-surfacing pattern)
- Note: integration-points.md carries `[UNCERTAIN]` on whether KYC eligibility is checked against GKOne's own KYC service or CMS or both — this bug may be relevant to resolving that marker.
