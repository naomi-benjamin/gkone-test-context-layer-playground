# US-31121 — Enhance Outbound Flow: Quote by Send or Receive Amount

Sprint: Remittances S33. State: Active (Implementation started).

## Story summary

Enhance the WU Outbound flow (v3) to support dual currency input on the quote screen (send amount or receive amount), add a save recipient toggle to the flow, and drive the recipient details screen dynamically based on corridor and payment option.

## Acceptance criteria (from ADO)

1. Update the Outbound flow based on the new screens.
2. Redesign the Outbound flow — the quote screen must allow users to enter their preferred amount: Send Amount or Receive Amount.
3. Add the option to save a recipient during the Outbound flow, with the recipient saved only after the Outbound transaction is successfully completed.
4. Make the Recipients Detail Screen dynamically appear when necessary: (1) when the customer is doing a transaction.
5. Ensure that the fields being collected appear dynamically depending on the corridor and payment option selected.
6. All existing transaction rules (fees, limits, rounding) remain intact and applied consistently.
7. Utilise notification to let the customer know:
   - (a) The Outbound transaction and save payee are successful.
   - (b) The Outbound transaction is successful, but the save payee was unsuccessful.
   - (c) The Outbound transaction and save payee are unsuccessful.

## Context notes for generation

- Dual currency input: validation fires after "Get Quote" tap, not before. Error is inline adjacent to the amount field. Applies to both send and receive sides. Transactability bounds are corridor-specific, not flat global limits.
- Dynamic recipient details screen: fields driven by WU field template for the corridor + payout method. Fields that may appear: Latin American Name Format toggle (always shown), First Name (always), Middle Name (dynamic), Last Name (always), Address Line 1 (dynamic), Address Line 2 (dynamic), Postal Code (dynamic).
- Save payee toggle defaults to ON. Save only happens after successful transaction. Save is independent of transaction — can fail separately.
- Three notification scenarios: all email-only (remittance does not use push or in-app notifications).
- V2 → V3 delta: the story is about v3 changes. All v2 steps that are unchanged still apply (PEP check, 3rd-party check, Payment Widget, processing stages, etc.).
- Limit: 5 saved payees max per account (DB-configurable).
- If the user selects an intra corridor (eg. GY -> GY) then ability to quote in two different currencies should not be an option.
- Latin American Name Format toggle is locked (read-only) when initiating a transaction from a saved payee. It is fixed to the position stored when the payee was saved. This is intended behaviour — confirmed 2026-04-29. 