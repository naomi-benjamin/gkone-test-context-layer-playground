# Bug Draft — Outbound V3: Payee saved when transaction fails and FE polling timeout is hit

**Discovered during:** Testing of US-31121 (Enhance Outbound Flow: Quote by Send or Receive Amount)
**Date:** 2026-04-29

---

## ADO Fields

**Title:** Outbound V3 — Payee incorrectly saved when outbound transaction fails and FE polling timeout screen is shown

**Severity:** High
<!-- Save payee is being triggered by the polling timeout screen appearing, not by confirmed transaction success. For a failed transaction that hits the 2-minute polling timeout, the payee is saved despite the transaction not completing. This violates AC3 and the notification contract ("Failed transaction → save payee not attempted"). -->

**Area Path:** Remittances / WU Outbound

**Found in:** V3

**Relates to:** US-31121 AC3

---

## Background

The Outbound V3 flow includes a "Securely save for future use" toggle (defaults ON). Per AC3, the payee should be saved **only after a successful outbound transaction**. A failed transaction should not attempt to save the payee.

After payment authorisation, the frontend polls for the transaction result for up to 2 minutes. If processing is not complete within that window, the app shows a "pending" screen informing the user their MTCN will be sent by email — no in-app result is shown.

---

## Repro Steps

1. Enable the save payee toggle. Proceed through the Outbound V3 flow to payment authorisation.
2. Trigger a scenario where the transaction **fails** but the FE polling timeout (2 minutes) is also hit — the pending/timeout screen is shown.
3. After the timeout screen appears, check the saved payees for the sender account.

**Note:** Exact repro method for forcing a failed transaction that also hits the 2-min timeout needs to be confirmed with dev — this may require environment-specific tooling or a specific failure stage.

---

## Expected Result

Per AC3 and the V3 notification contract:

- A failed transaction does not attempt to save the payee — save is not triggered.
- The save payee outcome (success or failure) is determined by the transaction outcome, not by which screen is displayed.
- If the transaction failed: no payee is created. The notification table entry for this case is "Failed transaction → Save payee: N/A (not attempted)."

---

## Actual Result

When the FE polling timeout screen is shown (even for a failed transaction), the payee save is triggered. A payee is created in the sender's saved payees despite the outbound transaction not completing successfully.

The save logic appears to be keyed to the timeout/pending screen appearing rather than to a confirmed successful transaction outcome.

---

## Why This Matters

- Payees from failed transactions are incorrect data — the user did not successfully send money to that person.
- It violates AC3 explicitly: "recipient saved only after the Outbound transaction is successfully completed."
- It breaks the notification contract: the V3 notification table specifies that a failed transaction does not attempt a payee save. A saved payee created silently contradicts this.
- A user who later selects this payee for a new transaction may not realise the details were never validated through a successful send.

---

## Additional Notes

- This does not affect the scenario where processing takes longer than 2 minutes but ultimately **succeeds** — in that case saving the payee is correct. The bug is specific to the intersection of: transaction failed + polling timeout reached.
- The receiver-blocked and sender-blocked CMS failure modes (US-31429) are potential triggers for this bug — those fail at the transaction completion stage, after the polling window may have elapsed.

---

## Context Applied

- `squads/remittance/features/wu-outbound/domain-knowledge.md` — Step 12 outcome delivery table (2-min polling timeout behaviour); V3 Saved Payee integration section (save only on success); V3 notification table (failed transaction → save not attempted)
- `playground/US-31121-outbound-v3-quote-recipient-flow/notes.md` — AC3; three notification scenarios
