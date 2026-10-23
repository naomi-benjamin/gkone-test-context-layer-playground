> Created in ADO: [BUG 38772](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38772) on 2026-10-23

TITLE
Customers are Unable to Complete P2P or WU Outbound Transfers Due to a "PaymentMethod Validation Failure" (Error 731)

REPRO STEPS
1. Log in to the GKOne app in QA as a Tier 1 customer with a valid GKOne prepaid card (e.g. Alex Reid, naomi.qatesting+alex@gmail.com).
2. Start a P2P transfer.
3. Select a Tier 1 receiver with a valid prepaid card (e.g. Alix Reid-White, naomi.qatesting+alix@gmail.com).
4. Enter an amount and continue to payment. Select a payment method (reproduced with both the GKOne prepaid card and a debit/credit card).
5. Confirm and authenticate the transfer.
6. Observe the error.
7. As the same sender, start a WU Outbound remittance and pay with each payment method.

EXPECTED BEHAVIOUR
- The P2P transfer completes, funds move from the sender's prepaid card to the receiver's prepaid card, and the sender sees the success screen.
- The WU Outbound remittance completes the payment step and continues to post-payment processing.

ACTUAL BEHAVIOUR / DESCRIPTION OF DEFECT
- Both the P2P transfer and the WU Outbound remittance fail with a "payment processing issue" message in the app.
- It fails with both payment methods (GKOne prepaid card and debit/credit card), for both flows, with the same sender.
- Both customers are Tier 1 with valid prepaid cards, so neither should fail eligibility.
- The API response returns:
  - `type`: UNPROCESSABLEENTITY
  - `title`: PAYMENT_TRANSACTION_ERROR
  - `detail` / `metaData`: PaymentMethod Validation Failure
  - `status`: 500
  - `errorCode`: 731
  - `traceId`: 00000000-0000-0000-0000-000000000000
- Note: this could be a separate issue. The response sets `type` to UNPROCESSABLEENTITY (normally a 422) but `status` to 500. A validation failure is reported as a server error.
- Note: this could be a separate issue. `traceId` is all zeros, so the failure can't be traced in logs from the response alone.

SYSTEM INFO
- Environment: QA
- Device / OS: N/A
- App version / build: N/A
- Test run: Init. Blocks TC 13 (test-cases-app-journeys-draft-02.md): step 2, the RemittanceUserProfiles snapshot check, couldn't be run.

SEVERITY: Critical
JUSTIFICATION: Classified as Critical — customers can't complete a core transaction (P2P or WU Outbound) with any payment method, and there's no workaround. If it turns out to affect only this sender account, it could be downgraded to Major.

---

# Raw draft from the Test Tracker (TC 13 failed)

> Raw draft from the Test Tracker. Ask Claude: *"Use the Bug Report Drafter skill on this file."*

## Source
- **Suite:** `playground/2026-10-22-user-profile-sync/test-cases-app-journeys-draft-02.md`
- **Test case:** TC 13: Verify that a P2P transfer between two Tier 1 customers succeeds and leaves each with one remittance snapshot
- **Tags:** Remittances, P2P, User Profile Sync, Mobile
- **Run:** Init
- **Environment:** QA
- **Status in run:** blocked
- **Test users:** Alex Reid (Sender) naomi.qatesting+alex@gmail.com ([Notion](https://app.notion.com/p/Alex-Reid-8cda6c0fef234395881158575fec8e15)); Alix Reid-White (Receiver) naomi.qatesting+alix@gmail.com ([Notion](https://app.notion.com/p/Alix-Reid-White-d95d71b0880d47229cb834b090c00678))

## Pre conditions
- Two Tier 1 customers with valid prepaid cards who do not already have snapshots

## Steps to reproduce
1. Complete a P2P transfer from the sender to the receiver

## Expected result (step 1)
The transfer completes

## Actual result
Unable to process a P2P & outbound for some reason. Getting a "payment processing issue"

Response body: {
  "errors": {},
  "type": "UNPROCESSABLEENTITY",
  "title": "PAYMENT_TRANSACTION_ERROR",
  "detail": "PaymentMethod Validation Failure ",
  "instance": "N/A",
  "status": "500",
  "detailUrl": "N/A",
  "traceId": "00000000-0000-0000-0000-000000000000",
  "metaData": "PaymentMethod Validation Failure",
  "errorCode": "731",
  "errorIconUrl": "",
  "extensions": {}
}

## Evidence
- [TODO: screenshots, logs, request/response, document IDs]

