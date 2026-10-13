# Test Cases — QR Code 1.0 / Scan-to-Pay (Release 1)

Generated via Test Case Generator skill. Scope: Person-to-Business QR payment only — scan → review/confirm (with Fee/Tax) → wallet or card payment → receipt/push notification. Person-to-Person payment, the 500,000 wallet-transfer cap, Apple Pay/Google Pay, and the Payment Plugin/Payment Link channels are all explicitly out of scope and excluded below.

---

## Happy Path

TEST CASE 1
Title: Verify that a GK One customer can scan a merchant's Dynamic QR code and complete a payment successfully

Tags: Scan to Pay, GK Pay Biz, Mobile, Smoke *(suggested — confirm these match your tagging convention)*

Pre Conditions:
The following should be true before proceeding:
• The customer is authenticated in the GK One app
• The customer has the GK One app installed
• A valid, active GKPS merchant has a Dynamic QR code available to scan
• Camera permission is already granted to the GK One app

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | From the Home screen, select Scan to Pay and scan the merchant's Dynamic QR code | The payment interface opens, resolved to the scanned merchant |
| 2.   | Observe the amount field                     | The amount field starts at $0.00 and is editable |
| 3.   | Enter a valid payment amount (e.g. $5,000) and an optional note | Values are accepted |
| 4.   | Proceed to the Review and Confirm screen     | The payment amount, a Fee line item, and the Total are displayed; the merchant (payee) cannot be changed |
| 5.   | Select the GK One Prepaid card (wallet) as the payment method | Payment method selected |
| 6.   | Confirm and submit the payment                | Payment is processed |
| 7.   | Observe the result screen                     | "Payment successful — $5,000.00 JMD — You've made a payment of $5,000.00 JMD from [Payer Name]" is displayed |

Post Conditions:
The following should be true after test completion:
• The payment is completed successfully
• A receipt matching the existing receipt design is emailed immediately to the customer's registered email address
• A push notification confirming successful payment is received

---

TEST CASE 2
Title: Verify that a GK One customer can scan a merchant's Static QR code and complete a payment with the pre-filled amount

Tags: Scan to Pay, GK Pay Biz, Mobile *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is authenticated in the GK One app
• A valid, active GKPS merchant has a Static QR code configured with a fixed amount (e.g. $50,000)

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Scan the merchant's Static QR code           | The payment interface opens, resolved to the scanned merchant |
| 2.   | Observe the amount field                     | The amount is pre-filled with the merchant's fixed amount and is NOT editable |
| 3.   | Proceed to the Review and Confirm screen     | The pre-filled amount, Fee, and Total are displayed |
| 4.   | Select a payment method and confirm payment   | Payment is processed |
| 5.   | Observe the result screen                     | Payment success is displayed with the correct fixed amount |

Post Conditions:
The following should be true after test completion:
• The payment completes using exactly the merchant's pre-set amount, unmodified
• A receipt is emailed and a push notification is received

---

## Alternate Valid Paths

TEST CASE 3
Title: Verify that a customer can pay using a registered card other than the default GK One Prepaid card after logging into GK One

Tags: Scan to Pay, GK Pay Biz, Mobile *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is logged into GK One with at least one other registered card (e.g. "My NCB MasterCard") in addition to the default GK One Prepaid card
• A valid Dynamic QR code has been scanned and a valid amount entered

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | On the Review and Confirm screen, view available payment methods | Both the GK One Prepaid card and the registered "My NCB MasterCard" are shown as selectable options |
| 2.   | Select "My NCB MasterCard"                   | Card is selected |
| 3.   | Confirm and submit the payment                | Payment is processed using the selected card |

Post Conditions:
The following should be true after test completion:
• The payment completes successfully using the non-default registered card, not the GK One Prepaid wallet balance

---

TEST CASE 4
Title: Verify that a customer can add an optional note to a QR payment and that it is accepted

Tags: Scan to Pay, GK Pay Biz, Mobile *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• A valid Dynamic QR code has been scanned

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter a valid amount and a short note (e.g. "Lunch")| Note is accepted |
| 2.   | Proceed through review and complete the payment | Payment is processed successfully with the note attached |

Post Conditions:
The following should be true after test completion:
• The note does not block or alter the payment outcome

---

TEST CASE 5
Title: Verify that a customer can complete a QR payment without entering an optional note

Tags: Scan to Pay, GK Pay Biz, Mobile *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• A valid Dynamic QR code has been scanned

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter a valid amount and leave the note field blank | |
| 2.   | Proceed through review and complete the payment | Payment is processed successfully with no note |

Post Conditions:
The following should be true after test completion:
• The note field being empty does not block payment, confirming it is genuinely optional

---

TEST CASE 6
Title: Verify that the GK One app opens directly when the customer selects "Pay with GK One App" and the app is already installed

Tags: Scan to Pay, GK Pay Biz, Mobile *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The GK One app is already installed on the device

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Scan a merchant QR code and select/trigger "Pay with GK One App" | The GK One app opens directly to the payment interface |

Post Conditions:
The following should be true after test completion:
• No app-store redirect occurs since the app is already installed

---

TEST CASE 7
Title: Verify that the customer is redirected to the app store when GK One is not installed

Tags: Scan to Pay, GK Pay Biz, Mobile *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The GK One app is NOT installed on the device

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Scan a merchant QR code (or trigger the pay action from outside the app) | The customer is redirected to the relevant app store listing for GK One |

Post Conditions:
The following should be true after test completion:
• The payment flow cannot proceed until GK One is installed and opened

---

## Negative / Error Cases

TEST CASE 8
Title: Verify that the system blocks payment when the entered amount is below $1000

Tags: Scan to Pay, GK Pay Biz, Mobile, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• A valid Dynamic QR code has been scanned

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter an amount of $999.99                   |                                              |
| 2.   | Attempt to proceed                           | A validation message is displayed; the customer cannot proceed |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted

---

TEST CASE 9
Title: Verify that the system blocks payment when the entered amount is above $350,000

Tags: Scan to Pay, GK Pay Biz, Mobile, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• A valid Dynamic QR code has been scanned

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter an amount of $350,000.01               |                                              |
| 2.   | Attempt to proceed                           | A validation message is displayed; the customer cannot proceed |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted

---

TEST CASE 10
Title: Verify that the system blocks payment when the amount field is left empty on a Dynamic QR payment

Tags: Scan to Pay, GK Pay Biz, Mobile, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• A valid Dynamic QR code has been scanned

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Leave the amount field empty                 |                                              |
| 2.   | Attempt to proceed                           | A validation message is displayed; the customer cannot proceed |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted

---

TEST CASE 11
Title: Verify that an invalid or unrecognized QR code fails to resolve before any payment interface is shown

Tags: Scan to Pay, GK Pay Biz, Mobile, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer has a QR code/image that does not correspond to a valid, active GKPS merchant

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Scan the invalid/unrecognized QR code        | An error is shown indicating the QR code could not be resolved; no payment interface is opened |

Post Conditions:
The following should be true after test completion:
• No payee or amount screen is reached, and no payment can be initiated from this scan

---

TEST CASE 12
Title: Verify that the customer cannot change the payee on a scanned QR payment

Tags: Scan to Pay, GK Pay Biz, Mobile, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• A valid Dynamic QR code from Merchant A has been scanned and the payment interface is open

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Look for any control to change or edit the payee/merchant on the payment screen | No such control exists; the payee is fixed to Merchant A throughout the flow |

Post Conditions:
The following should be true after test completion:
• The payment, if completed, can only go to the originally scanned merchant (Merchant A)

---

## Edge Cases

TEST CASE 13
Title: Verify that a payment of exactly $1000 is accepted (lower boundary)

Tags: Scan to Pay, GK Pay Biz, Mobile, Boundary *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• A valid Dynamic QR code has been scanned

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter an amount of exactly $1,000.00         |                                              |
| 2.   | Attempt to proceed                           | No validation error is shown; customer can proceed |

Post Conditions:
The following should be true after test completion:
• The amount is accepted as the minimum valid boundary

---

TEST CASE 14
Title: Verify that a payment of exactly $350,000 is accepted (upper boundary)

Tags: Scan to Pay, GK Pay Biz, Mobile, Boundary *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• A valid Dynamic QR code has been scanned

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter an amount of exactly $350,000.00       |                                              |
| 2.   | Attempt to proceed                           | No validation error is shown; customer can proceed |

Post Conditions:
The following should be true after test completion:
• The amount is accepted as the maximum valid boundary

---

TEST CASE 15
Title: Verify that the Scan to Pay camera requests permission when not already granted, and handles denial gracefully

Tags: Scan to Pay, GK Pay Biz, Mobile *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• Camera permission has NOT been granted to the GK One app

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Select Scan to Pay from the Home screen      | A camera permission prompt is shown |
| 2.   | Deny camera permission                       | The app does not crash; a clear message is shown indicating the camera is required to scan a QR code, and/or a fallback is offered |

Post Conditions:
The following should be true after test completion:
• The customer is not left on a blank or broken screen after denying permission

*Note: exact fallback behavior on denial is not documented in the requirements doc or the Scan to Pay feature folder — flagged as an assumption. Confirm actual expected behavior with dev before treating a deviation as a defect.*

---

TEST CASE 16
Title: Verify that Scan to Pay is accessible both from the Home screen and from the GK One Card's "PayMe" button in Wallet

Tags: Scan to Pay, GK Pay Biz, Mobile *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is authenticated in the GK One app

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | From the Home screen, select Scan to Pay     | Camera/scan interface opens |
| 2.   | Navigate to Wallet and select "PayMe" on the GK One Card | Camera/scan interface opens, equivalent to the Home screen entry point |

Post Conditions:
The following should be true after test completion:
• Both entry points lead to the same scan-to-pay flow, with no behavioral difference based on entry point

---

## Post-Condition Verification

TEST CASE 17
Title: Verify that a receipt is emailed to the customer's registered email address after a successful QR payment

Tags: Scan to Pay, GK Pay Biz, Mobile, Notifications *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer has access to the inbox for their GK One-registered email address

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Complete a successful QR payment              | Payment success is confirmed in-app |
| 2.   | Check the customer's registered email inbox   | A receipt email has been received, matching the existing receipt design, immediately after payment |

Post Conditions:
The following should be true after test completion:
• The receipt content (merchant, amount) matches the completed transaction

---

TEST CASE 18
Title: Verify that a push notification is sent to the customer when a QR payment completes successfully

Tags: Scan to Pay, GK Pay Biz, Mobile, Notifications *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• Push notifications are enabled on the test device for the GK One app

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Complete a successful QR payment              | Payment success is confirmed in-app |
| 2.   | Check the device's notification center        | A push notification confirming the successful payment has been received |

Post Conditions:
The following should be true after test completion:
• No email notification is expected for this channel's payment status update — push is the confirmed mechanism here (unlike the Plugin channel's email notification)

---

TEST CASE 19
Title: Verify that a push notification is sent to the customer when a QR payment attempt fails

Tags: Scan to Pay, GK Pay Biz, Mobile, Notifications *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• A payment attempt can be forced to fail (e.g. using a known test card/account that triggers a processor decline)
• Push notifications are enabled on the test device

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Attempt a QR payment that will be declined by the processor | Payment fails; failure is shown in-app |
| 2.   | Check the device's notification center        | A push notification indicating the payment failed has been received |

Post Conditions:
The following should be true after test completion:
• The failure notification does not falsely confirm a successful payment

---

## Context applied

- **Primary context:** `playground/gkpay-biz/paybiz_release_1_requirements.md`, §2 "QR Code 1.0 — Scan-to-Pay (Person-to-Business only)" — all 19 cases trace back to the confirmed requirements there (37731, the confirmed Dynamic/Static variants, 37732 incl. the confirmed-but-not-yet-written $350,000 upper bound, 37737 incl. the confirmed Fee/Tax addition, 37736, 37738, 37746), and to the explicit exclusions (37734 P2P, 37733 the 500,000 cap being removed, Apple/Google Pay, Payment Plugin/Payment Link).
- **Related/secondary context used:** `squads/payments/features/scan-to-pay/overview.md` and `domain-knowledge.md` — supplied the two Home-screen/Wallet entry points (TEST CASE 16), the invalid/unrecognized-QR-must-fail business rule (TEST CASE 11), and the camera-permission precondition (TEST CASE 15, flagged as an assumption since exact denial-handling isn't documented anywhere). `squads/payments/features/scan-to-pay/known-issues.md` checked — empty, nothing to route around. `squads/payments/features/gkpay-biz/integration-points.md` (GK One Wallet framing for payment-method cases). `squads/payments/squad.md` (confirms card/processor-level validation is FinTech/GK Web Pay's concern, not this channel's — negative card-decline cases in TEST CASE 19 are written at the flow level, not processor level). `_global/cross-cutting-concerns.md` (Notification Service — push, not email, for this channel).
- **Explicitly excluded:** `squads/payments/features/gkpay-biz/edge-cases.md` and `test-patterns.md` (separate merchant admin portal, not this consumer flow).
