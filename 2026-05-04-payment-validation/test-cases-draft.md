# Test Cases — Payment Validation: Prevent Under and Over Payment in Outbound Transactions

Generated: 2026-05-04. Related to ADO #30426, #31164.

---

## API call sequence

For direct endpoint testing, the full sequence is:

```
Generate Quote → CreateOutboundTransaction → CreateOrder → ConfirmOutboundTransaction → GetOutboundTransaction
```

Validation gates for payment method and order/amount sit on **CreateOrder**. For Section 4 cases, set up a valid quote and transaction first, then invoke CreateOrder directly with the manipulated values.

---

## Preconditions (apply to all cases unless stated otherwise)

- Test account: KYC Tier 1, non-expired ID, JM or KY market.
- A known stable corridor in the test environment (confirm with dev before running).
- Access to API tooling (Postman or equivalent) for the GKOne outbound remittance endpoint sequence — required for Sections 2 and 4.
- Ability to inspect backend logs for failed attempt logging (confirm tooling with dev).

---

## Section 1 — Payment method validation

### TC-PV-001: Valid payment method belonging to user — transaction proceeds
[PASS]

**Preconditions:** Standard preconditions. User has a valid registered payment method.

**Steps:**
1. Complete the full Outbound flow through the Payment Widget using the user's own valid payment method.
2. Submit the transaction.

**Expected:** Transaction proceeds normally. Payment method validation passes silently — no error is shown.

---

### TC-PV-002: Null paymentMethodId in CreateOrder — transaction rejected
[PASS]

**Preconditions:** Standard preconditions. API access. Valid quote obtained (step 1 in sequence).

**Steps:**
1. Call CreateOrder (`POST /orders/api/Order/Order`) with `paymentMethodId: null` in the orderDetails:
```json
{
  "subTotal": 5000.0,
  "totalTaxes": 0.0,
  "totalCharges": 460.0,
  "totalDiscount": 0.0,
  "totalAmountDue": 5460.0,
  "totalAmountPaid": 5460.0,
  "currency": "JMD",
  "orderDetails": [
    {
      "inventoryItemId": "2d26f568-c90e-43f1-ba7c-d8c2a31c39dd",
      "inventoryItemType": "OUTBOUND_REMITTANCE",
      "paymentRequestType": "DEBIT",
      "paymentMethodId": null,
      "customerAccountNumber": "[your account UUID]",
      "quantity": 1,
      "subTotal": 5000.0,
      "totalTaxes": 0.0,
      "totalCharges": 460.0,
      "totalDiscount": 0.0,
      "totalAmountDue": 5460.0,
      "totalAmountPaid": 5460.0
    }
  ]
}
```
2. Observe the response.

**Expected:** Request is rejected. No order created. Transaction cannot proceed.

---

### TC-PV-003: Zeroed-out paymentMethodId in CreateOrder — transaction rejected
[PASS]

**Preconditions:** Standard preconditions. API access.

**Steps:**
1. Call CreateOrder with `"paymentMethodId": "00000000-0000-0000-0000-000000000000"` (same body as TC-PV-002 with the all-zeros UUID substituted).
2. Observe the response.

**Expected:** Rejected. All-zeros UUID does not correspond to a real payment method and must fail validation.

---

### TC-PV-004: paymentMethodId belonging to a different user in CreateOrder — transaction rejected
[PASS]

**Preconditions:** Two test accounts (A and B). Obtain a valid `paymentMethodId` from Account B's payment methods.

**Steps:**
1. Authenticate as Account A.
2. Call CreateOrder using Account A's auth token but Account B's `paymentMethodId` in the body.
3. Observe the response.

**Expected:** Rejected. The system validates that the payment method belongs to the requesting user. Transaction is not created even though the UUID is a real, valid payment method.

---

## Section 2 — Order and amount validation

### TC-PV-005: Payment amount exactly matches quoted amount — transaction proceeds
[PASS]

**Preconditions:** Standard preconditions. Valid payment method.

**Steps:**
1. Get a quote and note the total amount (principal + convenience fee + WU fee + tax).
2. Complete payment through the Payment Widget for the exact quoted total.
3. Submit the transaction.

**Expected:** Transaction proceeds. Amount validation passes. MTCN generated.

---

### TC-PV-006: Underpayment — totalAmountPaid less than quoted grossAmount — transaction rejected

**Preconditions:** Standard preconditions. API access.

**Steps:**
1. Call Quote and note `grossAmount` (e.g. 5460 JMD for a 5000 JMD send).
2. Call CreateOrder with `totalAmountPaid` set to 1 JMD less than the quoted `grossAmount` (e.g. 5459):
```json
{
  "subTotal": 5000.0,
  "totalTaxes": 0.0,
  "totalCharges": 460.0,
  "totalDiscount": 0.0,
  "totalAmountDue": 5460.0,
  "totalAmountPaid": 5459.0,
  "currency": "JMD",
  "orderDetails": [
    {
      "inventoryItemId": "2d26f568-c90e-43f1-ba7c-d8c2a31c39dd",
      "inventoryItemType": "OUTBOUND_REMITTANCE",
      "paymentRequestType": "DEBIT",
      "paymentMethodId": "[valid payment method UUID]",
      "customerAccountNumber": "[your account UUID]",
      "quantity": 1,
      "subTotal": 5000.0,
      "totalTaxes": 0.0,
      "totalCharges": 460.0,
      "totalDiscount": 0.0,
      "totalAmountDue": 5460.0,
      "totalAmountPaid": 5459.0
    }
  ]
}
```
3. Use the returned order `id` as `paymentOrderId` in CreateOutboundOrder.
4. Call ConfirmOutboundOrder and observe the result.

**Expected:** Transaction is rejected. Error response indicates the discrepancy between quoted and paid amounts. No MTCN generated.

---

### TC-PV-007: Overpayment — totalAmountPaid more than quoted grossAmount — transaction rejected
[PASS]

**Preconditions:** Standard preconditions. API access.

**Steps:**
1. Call Quote and note `grossAmount` (e.g. 5460 JMD).
2. Call CreateOrder with `totalAmountPaid` set to 1 JMD more than the quoted `grossAmount` (e.g. 5461). Same body structure as TC-PV-006 with `totalAmountPaid: 5461.0`.
3. Use the returned order `id` as `paymentOrderId` in CreateOutboundOrder.
4. Call ConfirmOutboundOrder and observe the result.

**Expected:** Rejected. Overpayment is not accepted. Error response indicates the discrepancy. No MTCN generated.

---

### TC-PV-008: Null paymentOrderId in CreateOutboundOrder — transaction rejected
[PASS]

**Preconditions:** Standard preconditions. API access. Valid quote obtained.

**Steps:**
1. Call CreateOutboundOrder (`POST /remittances/api/WesternUnionRemittance/CreateOutboundOrder`) with `"paymentOrderId": null`:
```json
{
  "quoteId": "[quoteId from Quote response]",
  "receiverNameType": "I",
  "receiverFirstName": "Test",
  "receiverMiddleName": "",
  "paymentOrderId": null,
  "receiverLastName": "Receiver",
  "receiverPhoneNumber": "+8764321131",
  "receiverCity": "Kingston",
  "receiverAddressLine1": "",
  "receiverAddressLine2": "",
  "receiverState": "Kingston",
  "receiverCountry": "Jamaica",
  "receiverPostalCode": "",
  "receiverCurrency": "JMD",
  "purposeOfTheTransaction": "Gift",
  "receiverPurposeOfTheTransaction": "",
  "relationshipWithTheReceiver": "Friend",
  "sourceOfFunds": "Salary",
  "payoutMethodType": 1
}
```
2. Observe the response.

**Expected:** Rejected. Transaction not created.

---

### TC-PV-009: Zeroed-out paymentOrderId in CreateOutboundOrder — transaction rejected
[PASS]

**Preconditions:** Standard preconditions. API access. Valid quote obtained.

**Steps:**
1. Call CreateOutboundOrder with `"paymentOrderId": "00000000-0000-0000-0000-000000000000"` (same body as TC-PV-008 with the all-zeros UUID).
2. Observe the response.

**Expected:** Rejected. This is the **confirmed exploit path** — the original issue (#30426) showed this returned HTTP 201. Post-fix, this must return an error. No outbound order created.

---

### TC-PV-010: Order where payment was not successfully processed — transaction rejected

**Preconditions:** Standard preconditions. A `paymentOrderId` where the underlying payment failed or was declined.

**Steps:**
1. Initiate a payment that fails (e.g. declined card). Note the `paymentOrderId` from that attempt.
2. Invoke the create outbound order endpoint with that `paymentOrderId`.
3. Observe the response.

**Expected:** Rejected. The system validates that the referenced order reflects a successfully processed payment, not just that an order exists. Transaction not created.

---

### TC-PV-011: Fees included in amount match — partial payment covering principal only is rejected
[N/A]

**Preconditions:** Standard preconditions. API access.

**Steps:**
1. Get a quote. Note the send amount (principal) and the full quoted total including all fees.
2. Process a payment for the principal amount only (excluding fees).
3. Invoke the create outbound order endpoint.

**Expected:** Rejected. The validation amount is the full quoted total including all fees — not just the principal. This is a variant of TC-PV-006 but specifically targets the "fees included" requirement.

---

### TC-PV-012: Order ID reuse — same paymentOrderId submitted for a second outbound transaction is rejected
[PASS]

**Preconditions:** Standard preconditions. API access. A `paymentOrderId` from a previously completed and successfully processed outbound transaction.

**Steps:**
1. Complete a full outbound transaction successfully (Quote → CreateOrder → CreateOutboundOrder → ConfirmOutboundOrder). Note the `paymentOrderId` used.
2. Obtain a new `quoteId` for a second outbound transaction.
3. Call CreateOutboundOrder for the second transaction, supplying the `paymentOrderId` from step 1:
```json
{
  "quoteId": "[new quoteId from step 2]",
  "receiverNameType": "I",
  "receiverFirstName": "Test",
  "receiverMiddleName": "",
  "paymentOrderId": "[paymentOrderId from the already-completed transaction in step 1]",
  "receiverLastName": "Receiver",
  "receiverPhoneNumber": "+8764321131",
  "receiverCity": "Kingston",
  "receiverAddressLine1": "",
  "receiverAddressLine2": "",
  "receiverState": "Kingston",
  "receiverCountry": "Jamaica",
  "receiverPostalCode": "",
  "receiverCurrency": "JMD",
  "purposeOfTheTransaction": "Gift",
  "receiverPurposeOfTheTransaction": "",
  "relationshipWithTheReceiver": "Friend",
  "sourceOfFunds": "Salary",
  "payoutMethodType": 1
}
```
4. Observe the response.

**Expected:** Rejected. A payment order that has already been consumed by a completed outbound transaction cannot be reused to fund a second transaction. No second outbound order created, no MTCN generated.

---

## Section 3 — Error response and logging

### TC-PV-013: Amount mismatch error message is user-friendly

**Preconditions:** Trigger TC-PV-006 or TC-PV-007 (any amount mismatch).

**Steps:**
1. Observe the error message returned (in-app and/or API response).

**Expected:** The message is user-friendly and clearly communicates the discrepancy (e.g. "The amount paid does not match the quoted amount"). No internal field names, no raw service error strings, no stack traces, no stage names exposed.

---

### TC-PV-015: Failed validation attempt is logged

**Preconditions:** Backend log access confirmed with dev. Trigger any failing validation case (TC-PV-002 through TC-PV-012).

**Steps:**
1. Trigger a failed validation attempt (e.g. TC-PV-006 underpayment).
2. Check backend logs for a record of the failed attempt.

**Expected:** The failed attempt is logged. Log entry includes relevant details — at minimum: timestamp, user/account identifier, attempt type, reason for rejection. Confirm expected log fields with dev before running.

---

## Section 4 — Direct endpoint access (bypass attempts)

### TC-PV-016: Reproduce original exploit — CreateOutboundOrder with all-zeros paymentOrderId must now be rejected
[PASS]

**Preconditions:** API access. Valid auth token.

**Steps:**
1. Call Quote to obtain a valid `quoteId`.
2. Call CreateOutboundOrder directly with `"paymentOrderId": "00000000-0000-0000-0000-000000000000"` — **do not call CreateOrder first**:
```json
{
  "quoteId": "[quoteId from step 1]",
  "receiverNameType": "I",
  "receiverFirstName": "Test",
  "receiverMiddleName": "",
  "paymentOrderId": "00000000-0000-0000-0000-000000000000",
  "receiverLastName": "Receiver",
  "receiverPhoneNumber": "+8764321131",
  "receiverCity": "Kingston",
  "receiverAddressLine1": "",
  "receiverAddressLine2": "",
  "receiverState": "Kingston",
  "receiverCountry": "Jamaica",
  "receiverPostalCode": "",
  "receiverCurrency": "JMD",
  "purposeOfTheTransaction": "Gift",
  "receiverPurposeOfTheTransaction": "",
  "relationshipWithTheReceiver": "Friend",
  "sourceOfFunds": "Salary",
  "payoutMethodType": 1
}
```
3. Observe the response.

**Expected:** **Rejected — must NOT return HTTP 201.** Pre-fix, this returned 201 CREATED (confirmed exploit). Post-fix, the Remittance service must validate that the `paymentOrderId` references a real, processed order before accepting the request.

---

### TC-PV-017: Full exploit sequence with all-zeros paymentOrderId — transaction must not complete
[PASS]

**Preconditions:** API access. Valid auth token.

**Steps:**
1. Call Quote → note `quoteId`.
2. Call CreateOutboundOrder with `paymentOrderId: "00000000-0000-0000-0000-000000000000"` (as above).
3. If step 2 returns an order ID, call ConfirmOutboundOrder with it.
4. Check whether a transaction was processed (email, transaction history, MTCN).

**Expected:** Blocked at step 2. If somehow step 2 succeeds, ConfirmOutboundOrder must also reject. No MTCN generated, no funds moved, no transaction record showing success.

---

### TC-PV-018: Direct API call with mismatched amount — rejected regardless of UI flow
[N/A]

**Preconditions:** API access. A `paymentOrderId` for a CreateOrder that was submitted with an amount different from the quote's `grossAmount`.

**Steps:**
1. Call Quote and note `grossAmount` (e.g. 5460 JMD).
2. Call CreateOrder with `totalAmountPaid` deliberately different (e.g. 5000 — principal only, no fees).
3. Use the returned order `id` as `paymentOrderId` in CreateOutboundOrder.
4. Call ConfirmOutboundOrder and observe.

**Expected:** Rejected. Amount validation applies at the service layer regardless of whether the flow went through the UI.

---

## Gaps / Reminders

- **Log verification tooling:** Confirm with dev how to access and query backend logs in the test environment before running TC-PV-015.
- **Postman collection:** Confirm whether a collection exists for the GKOne outbound remittance API, or whether direct endpoint calls need to be constructed manually.
- **Rounding tolerance:** Clarify with dev whether "exactly matches" has any tolerance for rounding (e.g. in JMD where fractional amounts may occur) — relevant for TC-PV-005/006/007.
- **Quote expiry interaction:** If a quote expires during the payment flow and a payment is processed against the expired quote amount, does the amount validation compare against the expired quote or reject due to expiry first? Confirm expected behaviour.

---

## Context Applied

- `squads/remittance/features/wu-outbound/domain-knowledge.md` — processing stages, payment widget, outcome delivery, quote structure (principal + fees)
- `squads/remittance/features/wu-outbound/test-patterns.md` — processing stage verification table, tooling notes
- `playground/2026-05-04-payment-validation/notes.md` — source issue (30426), story requirements, AC
- **Note:** Section 4 (direct endpoint cases) leans directly on the source issue description — the exploit was via direct endpoint access with null/zero payment fields.