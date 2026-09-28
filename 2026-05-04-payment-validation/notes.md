# Payment Validation — Prevent Under and Over Payment in Outbound Transactions

Related ADO items: #30426 (source issue), #31164 (amount coverage story)
Sprint: TBC. Date: 2026-05-04.

## Source issue (30426)

Critical security issue found by QA in April 2025. During an outbound transaction, a user could invoke the create outbound order endpoint directly with null or zeroed-out values for `paymentMethodId` and `paymentOrderId` and complete the transaction without any evidence of payment. Partially mitigated by #29977 (Add Convenience Fee charge to RMS Calls — closed) but not fully resolved.

## What the story adds

Two validation gates on the Remittance service's create order request:

### Gate 1 — Payment method validation
- The `paymentMethodId` supplied must be valid (not null, not zeroed-out).
- It must belong to the requesting user (not another user's payment method).

### Gate 2 — Order/amount validation
- The `paymentOrderId` must reference a real order where payment was successfully processed.
- The amount paid must **exactly** match the quoted amount, including all fees (convenience fee, WU fee, tax).
- Both underpayment and overpayment are rejected.

## Acceptance criteria (verbatim)

1. Given an outbound transaction is initiated (including via direct endpoint access), when an order is created and a payment is processed, then the system must verify that the payment amount exactly matches the quoted amount.
2. Given the payment amount does not match the quoted amount (either less or more), when the transaction is attempted, then the system must reject the transaction and return a clear error message indicating the discrepancy between the quoted and paid amounts, and the failed attempt should be logged with relevant details.

## API call sequence and endpoint reference

```
Generate Quote → CreateOutboundOrder → CreateOrder → ConfirmOutboundOrder → GetOutboundTransaction
```

### 1. Generate Quote
`POST /remittances/api/WesternUnionFeeSurvey/Quote`

```json
{
  "receiverCountry": "JM",
  "receiverCurrency": "JMD",
  "receiverState": "Kingston",
  "receiverCity": "Kingston",
  "payoutMethod": "MONEY IN MINUTES",
  "payinMethod": "CA",
  "consumerSendAmount": 5000.0
}
```

Key response fields: `quoteId`, `grossAmount` (5460 = principal + WU fees + tax), `totalAmount` (5610 = grossAmount + convenience fee of 150), `transactionFees`.

**Note on amounts:** `grossAmount` (5460) is what flows into CreateOrder. The convenience fee (150) is separate. Confirm with dev which figure the payment validation compares against.

---

### 2. CreateOutboundOrder (Remittance service)
`POST /remittances/api/WesternUnionRemittance/CreateOutboundOrder`

```json
{
  "quoteId": "[quoteId from step 1]",
  "receiverNameType": "I",
  "receiverFirstName": "Test",
  "receiverMiddleName": "",
  "paymentOrderId": "[orderId from CreateOrder — or all-zeros to test exploit]",
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

**This is where `paymentOrderId` is passed.** The confirmed exploit: sending `"paymentOrderId": "00000000-0000-0000-0000-000000000000"` returned HTTP 201 CREATED — the remittances service did not validate the order reference. Response includes `orderId` used in ConfirmOutboundOrder.

---

### 3. CreateOrder (Orders service — separate microservice)
`POST /orders/api/Order/Order`

```json
{
  "clientId": "",
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
      "paymentMethodId": "[user's payment method UUID]",
      "customerAccountNumber": "[user's account UUID]",
      "cardVerificationNumber": "",
      "expiryMonth": "",
      "expiryYear": "",
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

**This is where `paymentMethodId` is passed.** Note: the response includes `isValid: false, isAuthorized: false, isPaymentAllowed: false` on a freshly created order — these flags are updated by subsequent payment processing, not at creation time. Returns `id` used as `paymentOrderId` in CreateOutboundOrder.

---

### 4. ConfirmOutboundOrder (Remittance service)
`POST /remittances/api/WesternUnionRemittance/ConfirmOutboundOrder`

```json
{
  "orderId": "[orderId from CreateOutboundOrder response]"
}
```

Response: 200 — enqueues the order for processing. Does not return a synchronous result.

---

### Amount breakdown (from confirmed traces, JM → JM MIM example)
| Field | Value | Notes |
|---|---|---|
| Principal (consumerSendAmount) | 5000 JMD | |
| WU gross fees | 400 JMD | |
| Tax (state) | 60 JMD | |
| grossAmount | 5460 JMD | Used in CreateOrder |
| Convenience fee | 150 JMD | Separate line item |
| totalAmount | 5610 JMD | grossAmount + convenience fee |

## Key test considerations

- Validations must hold at the **API level**, not just via the UI — the original exploit was via direct endpoint access.
- "Exactly matches" means full quoted amount including all fees, not just principal.
- Both null and structurally valid-but-wrong values need testing (e.g. all-zeros UUID is structurally valid but should fail validation).
- Error messages must be user-friendly — no internal field names, no raw service errors.
- Failed attempts must be logged (will likely need dev/backend confirmation on how to verify this in test environment).
