# Bug Draft — P2P: CMS-blocked sender can proceed with P2P transaction (no error shown)

**Discovered during:** Testing of US-31429 (P2P CMS Block Error Handling) — TC-006 FAIL
**Date:** 2026-04-29

---

## ADO Fields

**Title:** P2P V2 — CMS-blocked sender can complete P2P transaction; "Unable to Process Payment" error screen not shown

**Severity:** High
<!-- A CMS block on the sender is a compliance/risk control. If a blocked sender can transact without any error surfacing, the control is ineffective. The receiver-blocked path (TC-001) works correctly — this is a sender-side gap only. -->

**Area Path:** Remittances / P2P

**Found in:** V2

**Relates to:** US-31429 AC2

---

## Repro Steps

1. Set a CMS block on the sender test account. Ensure sender is otherwise KYC Tier 2 with a valid prepaid card.
2. Ensure the receiver account is unblocked, KYC Tier 2, valid card.
3. Log in as the blocked sender.
4. Initiate a P2P transaction to the receiver.
5. Proceed through the flow: enter recipient, enter amount, reach the confirmation/payment stage.
6. Confirm/submit the transaction.
7. Observe the result.

---

## Expected Result

At the transaction completion stage, the error screen is displayed:
- Title: **"Unable to Process Payment"**
- Body: **"Unfortunately, this transaction cannot be sent at this time."**
- Primary CTA: **"Contact Support"** (red button)
- Secondary CTA: **"Back to Home"** (link)

No funds are transferred. The transaction does not complete.

---

## Actual Result

The blocked sender can proceed through the flow without interruption. The "Unable to Process Payment" error screen is not shown. The transaction appears to complete (or at minimum, no error is surfaced to the user).

**Note:** Confirm whether funds are actually debited when reproducing — capture sender balance before and after.

---

## Why This Matters

- CMS blocks are a compliance and risk control mechanism. A blocked sender being able to transact defeats the purpose of the block.
- The receiver-blocked path (TC-001) surfaces the error correctly — this is a sender-specific gap in the CMS block check.
- This is a direct failure of US-31429 AC2.

---

## Additional Context

- TC-001 through TC-005 (receiver blocked in CMS) all passed — the receiver-blocked code path is working.
- The sender-blocked path appears to not be checking CMS block status, or the check result is not being handled correctly.
- Per domain-knowledge.md, the CMS block is designed to be late-surfacing (allows the flow to start but prevents completion) — so the issue is not that the sender can enter the flow, it is that the error never surfaces at completion.

---

## Context Applied

- `squads/remittance/features/p2p/domain-knowledge.md` — CMS block behaviour (late-surfacing; blocks both sender and receiver); same error screen for both parties
- `playground/US-31429-p2p-cms-block-error/notes.md` — US-31429 AC2, error screen design (title, body, CTAs)
- `playground/US-31429-p2p-cms-block-error/test-cases-draft.md` — TC-006 (failed), TC-001 (passed for comparison)
