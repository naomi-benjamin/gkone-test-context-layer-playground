# Test Cases — Payment Plugin 1.0 / Web Pay (Release 1)

Generated via Test Case Generator skill. Scope: the embedded checkout plugin only (launch → review → payment method → guest/card entry or GK One login → 3DS (guest card only) → confirmation/receipt → notification). Apple Pay, Google Pay, the standalone Payment Link channel, and QR Code Scan-to-Pay are explicitly out of scope and excluded below.

---

## Happy Path

TEST CASE 1
Title: Verify that a customer can launch the payment plugin from an integrating app and complete a guest checkout card payment successfully

Tags: GK Pay Biz, Payment Plugin, Guest Checkout, Smoke *(suggested — confirm these match your tagging convention)*

Pre Conditions:
The following should be true before proceeding:
• A merchant has integrated the GK Pay Biz payment plugin into their own app or website
• The merchant has an active payment request (amount, product/service description, applicable fees and taxes) ready to pass to the plugin
• The customer does not have a GK One account, or chooses not to use one
• Debit/Credit card being used is 3DS enrolled

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | In the integrating app, initiate payment (e.g. tap "Pay Now" / "Checkout") |                                              |
| 2.   | Observe the screen that opens                | The GK Pay Biz payment plugin opens, displaying the merchant's branding and the payment details passed by the merchant |
| 3.   | Proceed to the Review and Confirm screen     | Merchant Name, Product/Service Description, Payment Amount, Fees, Taxes, Total Amount Due, and Currency are all displayed; Total equals Amount + Fees + Tax |
| 4.   | Select "Manual Card Entry (Guest Checkout)" as the payment method |                                              |
| 5.   | Enter a valid full name (e.g. "Naomi Silvera"), a valid email address and a valid phone number | Values are accepted |
| 6.   | Enter valid card details: cardholder name, a valid card number, a valid future expiry date (MM/YYYY), and a valid CVV for the card brand |                                              |
| 7.   | Tap "Make payment"                           | A loading indicator is shown while the payment is processed |
| 8.   | Complete the 3DS challenge presented          | 3DS challenge is completed successfully |
| 9.   | Observe the result screen                     | Payment success confirmation is shown, with the merchant name and amount displayed |

Post Conditions:
The following should be true after test completion:
• The payment is completed successfully
• A confirmation receipt is available showing merchant name and amount, with no merchant email address displayed anywhere
• An email notification confirming successful payment is sent to the customer's registered email address

---

TEST CASE 2
Title: Verify that a customer can complete payment via "Pay with GK One App" using a saved payment method after logging in

Tags: GK Pay Biz, Payment Plugin, GK One Login *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer has an existing, active GK One account with at least one saved payment method beyond the default GK One Prepaid card (e.g. a registered "My NCB MasterCard")
• The payment plugin has been launched from an integrating app/site with a valid payment request

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | On the Review and Confirm screen, proceed to Select Payment Method |                                              |
| 2.   | Select "Pay with GK One App"                 | A "Log into GK One" prompt is presented, requesting an email/phone number and password |
| 3.   | Enter the valid email/phone and password for the GK One account | Login succeeds |
| 4.   | Observe the payment method options presented | The customer's saved GK One payment methods are shown, including the GK One Prepaid card and the registered "My NCB MasterCard" |
| 5.   | Select the registered "My NCB MasterCard"    | Card is selected as the payment method |
| 6.   | Tap "Make payment"                           | A loading indicator is shown while the payment is processed |
| 7.   | Observe the result screen                     | Payment success confirmation is shown |

Post Conditions:
The following should be true after test completion:
• The payment is completed successfully using the selected saved card, without re-entering card details
• An email notification confirming successful payment is sent to the customer's registered email address

---

## Alternate Valid Paths

TEST CASE 3
Title: Verify that a customer can use "Pay another way" to return from the GK One saved-methods screen and complete payment as a guest instead

Tags: GK Pay Biz, Payment Plugin, GK One Login *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The payment plugin is open, on the Review and Confirm screen's "Pay with" step, which presents four distinct options: "Log into GK One," "Pay with GooglePay," "Pay with ApplePay," "Checkout as guest"
• RESOLVED (2026-10-13, source: `GK Pay Biz Payment Plug-in 2.1- Mobile - Check out as GK One.pdf` and `Checkout as Guest - Payment Plug-in.pdf`): "Pay another way" is confirmed to be a back button — it appears on both the GK One saved-methods screen (after login) and the guest card-entry screen, and in both cases returns the customer to the four-option "Pay with" screen above. It does not reveal an inline guest form on the same screen; this corrects the earlier version of this test case.

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Select "Log into GK One" and log in with valid credentials | The saved-payment-methods screen is shown (GK One Prepaid card, My NCB MasterCard) |
| 2.   | Tap "Pay another way"                        | The customer is returned to the four-option "Pay with" screen — not an inline guest form |
| 3.   | Select "Checkout as guest"                   | The guest card-entry screen is shown (Card holder's name, Card number, Expiry date, CVV, Email, Phone Number) |
| 4.   | Complete the guest card-entry fields with valid data and tap "Make payment" | Payment is processed |
| 5.   | Complete the 3DS challenge if presented      | Payment proceeds to completion |

Post Conditions:
The following should be true after test completion:
• The payment completes successfully via manually entered card details, not the GK One saved method
• "Pay another way" correctly returns to the method-selection screen from both the saved-methods screen and the guest card-entry screen, rather than doing nothing or erroring

---

TEST CASE 4
Title: Verify that a merchant-defined custom field (e.g. "Unit Number") is presented and accepted during guest checkout

Tags: GK Pay Biz, Payment Plugin, Guest Checkout *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The integrating merchant has configured a custom field (e.g. "Unit Number") for guest checkout

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Proceed to guest checkout                    | The custom field (e.g. "Unit Number") is displayed alongside name and email |
| 2.   | Enter a valid value in the custom field, along with a valid name and email | Values are accepted |
| 3.   | Proceed to card entry and complete the payment with valid details |                                              |

Post Conditions:
The following should be true after test completion:
• The payment completes successfully with the custom field value captured

---

TEST CASE 5
Title: Verify that the card number input auto-formats into groups of 4 digits as the customer types

Tags: GK Pay Biz, Payment Plugin, Card Entry *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Type the card number `4111111111111111` into the card number field, digit by digit | The field displays the number formatted as `4111 1111 1111 1111` |

Post Conditions:
The following should be true after test completion:
• The underlying stored/submitted card number value is correct (unformatted or correctly parsed), regardless of display formatting

---

TEST CASE 6
Title: Verify that a cardholder name containing a hyphen and an apostrophe is accepted

Tags: GK Pay Biz, Payment Plugin, Card Entry *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter a cardholder name containing a hyphen and apostrophe, e.g. "Mary-Jane O'Brien" | Value is accepted, no validation error shown |
| 2.   | Complete the remaining card fields with valid data and submit payment | Payment proceeds |

Post Conditions:
The following should be true after test completion:
• The payment is not blocked due to the hyphen/apostrophe in the name

---

TEST CASE 7
Title: Verify that the payment plugin launches correctly and displays the correct merchant branding when embedded in different integrating apps

Tags: GK Pay Biz, Payment Plugin, Launch *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• At least two distinct merchants/apps have integrated the GK Pay Biz plugin (e.g. a mobile app integration and a website integration)

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Launch the plugin from Merchant/App A's "Pay Now" action | Plugin opens showing Merchant A's branding and Merchant A's payment details |
| 2.   | Close/exit and launch the plugin from Merchant/App B's "Checkout" action | Plugin opens showing Merchant B's branding and Merchant B's payment details, with no residual data from Merchant A |

Post Conditions:
The following should be true after test completion:
• Each launch of the plugin is correctly scoped to the initiating merchant/app, with no cross-merchant data leakage between sessions

---

## Negative / Error Cases

TEST CASE 8
Title: Verify that the system blocks payment when the entered amount is below $1000

Tags: GK Pay Biz, Payment Plugin, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on a screen where the payment amount can be entered (Validate Amount — Open)

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter an amount of $999.99                   |                                              |
| 2.   | Attempt to continue                          | A validation message is displayed; the customer cannot proceed |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted

---

TEST CASE 9
Title: Verify that the system blocks payment when the entered amount is above $350,000

Tags: GK Pay Biz, Payment Plugin, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on a screen where the payment amount can be entered (Validate Amount — Open)

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter an amount of $350,000.01               |                                              |
| 2.   | Attempt to continue                          | A validation message is displayed; the customer cannot proceed |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted

---

TEST CASE 10
Title: Verify that the system blocks payment when the amount field is left empty

Tags: GK Pay Biz, Payment Plugin, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on a screen where the payment amount can be entered (Validate Amount — Open)

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Leave the amount field empty                 |                                              |
| 2.   | Attempt to continue                          | An error is displayed indicating an amount is required; the customer cannot proceed |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted

---

TEST CASE 11
Title: Verify that the system blocks guest checkout when required fields (name or email) are left blank

Tags: GK Pay Biz, Payment Plugin, Guest Checkout, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the guest checkout screen

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Leave the name field blank, enter a valid email | |
| 2.   | Attempt to continue                          | A validation message is displayed for the missing name field; customer cannot proceed |
| 3.   | Enter a valid name, leave the email field blank | |
| 4.   | Attempt to continue                          | A validation message is displayed for the missing email field; customer cannot proceed |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted while required fields are incomplete

---

TEST CASE 12
Title: Verify that the system blocks guest checkout when the email address is in an invalid format

Tags: GK Pay Biz, Payment Plugin, Guest Checkout, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the guest checkout screen

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter a valid name and an incorrectly formatted email address (e.g. "naomi@@gmail") | |
| 2.   | Attempt to continue                          | A validation message is displayed indicating the email format is invalid; customer cannot proceed |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted

---

TEST CASE 13
Title: Verify that the system blocks payment submission when the cardholder name field is left empty

Tags: GK Pay Biz, Payment Plugin, Card Entry, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen with all other fields valid

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Leave the cardholder name field empty, complete all other card fields with valid data | |
| 2.   | Tap "Make payment"                           | An error is displayed; payment is blocked |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted to the processor

---

TEST CASE 14
Title: Verify that the system blocks payment submission when the cardholder name does not contain a space (single-word entry)

Tags: GK Pay Biz, Payment Plugin, Card Entry, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen with all other fields valid

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter "NaomiSilvera" (no space) as the cardholder name, complete all other card fields with valid data | |
| 2.   | Tap "Make payment"                           | An error is displayed indicating a full name (first and last) is required; payment is blocked |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted to the processor

---

TEST CASE 15
Title: Verify that the system blocks payment submission when an invalid card number is entered

Tags: GK Pay Biz, Payment Plugin, Card Entry, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen with all other fields valid

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter an invalid/non-existent card number, complete all other card fields with valid data | |
| 2.   | Tap "Make payment"                           | An appropriate error is displayed; payment is blocked |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted to the processor

---

TEST CASE 16
Title: Verify that the system blocks payment submission when the card's expiry date has already passed

Tags: GK Pay Biz, Payment Plugin, Card Entry, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen with all other fields valid

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter an expiry date that has already passed (e.g. a prior month/year), complete all other card fields with valid data | |
| 2.   | Tap "Make payment"                           | An error is displayed indicating the card is expired; payment is blocked |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted to the processor

---

TEST CASE 17
Title: Verify that the system rejects an expiry date with a month value greater than 12

Tags: GK Pay Biz, Payment Plugin, Card Entry, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen with all other fields valid

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter "13/2027" in the expiry date field, complete all other card fields with valid data | |
| 2.   | Tap "Make payment"                           | A validation error is displayed; payment is blocked |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted to the processor

---

TEST CASE 18
Title: Verify that the system rejects non-numeric or malformed input in the expiry date field

Tags: GK Pay Biz, Payment Plugin, Card Entry, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen with all other fields valid

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter non-numeric characters (e.g. "AB/CDEF") in the expiry date field | Input is rejected or a validation error is shown |
| 2.   | Enter a malformed value (e.g. "1/27" or "012027") in the expiry date field | Input is rejected or a validation error is shown |
| 3.   | Attempt to submit payment with the malformed value still present | Payment is blocked |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted to the processor with an unparseable expiry date

---

TEST CASE 19 [TENTATIVE]
Title: Verify that the system blocks payment when the CVV length does not match the card brand (Visa/Mastercard)

Tags: GK Pay Biz, Payment Plugin, Card Entry, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen with a Visa or Mastercard number entered and all other fields valid

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter a 2-digit CVV, then a 4-digit CVV      | |
| 2.   | Tap "Make payment" for each case             | An error is displayed for each; payment is blocked (Visa/Mastercard requires exactly 3 digits) |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted to the processor

---

TEST CASE 20
Title: Verify that the system blocks payment when the CVV length does not match the card brand (Amex) [TENTATIVE]

Tags: GK Pay Biz, Payment Plugin, Card Entry, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen with an Amex card number entered and all other fields valid

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter a 3-digit CVV                          | |
| 2.   | Tap "Make payment"                           | An error is displayed; payment is blocked (Amex requires exactly 4 digits) |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted to the processor

---

TEST CASE 21
Title: Verify that the CVV input is masked as it is typed

Tags: GK Pay Biz, Payment Plugin, Card Entry *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter a valid CVV                            | Each digit entered is masked (not shown in plain text) on screen |

Post Conditions:
The following should be true after test completion:
• The CVV value is not visibly exposed on screen during entry

---

## Edge Cases

TEST CASE 22
Title: Verify that a payment of exactly $1000 is accepted (lower boundary)

Tags: GK Pay Biz, Payment Plugin, Validation, Boundary *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on a screen where the payment amount can be entered (Validate Amount — Open)

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter an amount of exactly $1,000.00         |                                              |
| 2.   | Attempt to continue                          | No validation error is shown; customer can proceed |

Post Conditions:
The following should be true after test completion:
• The amount is accepted as the minimum valid boundary

---

TEST CASE 23
Title: Verify that a payment of exactly $350,000 is accepted (upper boundary)

Tags: GK Pay Biz, Payment Plugin, Validation, Boundary *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on a screen where the payment amount can be entered (Validate Amount — Open)

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter an amount of exactly $350,000.00       |                                              |
| 2.   | Attempt to continue                          | No validation error is shown; customer can proceed |

Post Conditions:
The following should be true after test completion:
• The amount is accepted as the maximum valid boundary

---

TEST CASE 24
Title: Verify that a guest checkout payment still completes successfully when the customer enters a mistyped (but validly formatted) email address

Tags: GK Pay Biz, Payment Plugin, Guest Checkout *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the guest checkout screen
• This behaviour is a known, PO-accepted risk — no email verification exists; this test confirms it is expected, not a defect

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter a valid name and a validly formatted but incorrect/mistyped email address (e.g. intended "naomi@gmail.com" entered as "naomii@gmail.com") | Value is accepted — no format error, since the address is well-formed |
| 2.   | Complete card entry with valid details and submit payment | Payment is submitted and processed normally |
| 3.   | Observe the result screen                     | Payment success confirmation is shown, same as any other successful guest payment |

Post Conditions:
The following should be true after test completion:
• The payment completes successfully despite the incorrect email address
• No confirmation email is received at the correct address (expected outcome, not a defect) — do not log a defect for this specific behaviour

---

TEST CASE 25
Title: Verify that a 3DS challenge is presented during guest card checkout and must be completed for payment to succeed

Tags: GK Pay Biz, Payment Plugin, Card Entry, 3DS *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is completing a guest card checkout with valid card details
• NOTE: detailed 3DS UI/behaviour is not yet formally documented in acceptance criteria — confirm actual implementation details with dev before relying on this case as comprehensive 3DS coverage

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter valid card details and tap "Make payment" | A 3DS challenge screen/step is presented before the payment completes |
| 2.   | Complete the 3DS challenge successfully       | The payment proceeds to completion |

Post Conditions:
The following should be true after test completion:
• The payment only completes after the 3DS challenge is successfully passed
• (Flag for follow-up) Additional test cases should be written once formal 3DS acceptance criteria exist, e.g. covering a failed/abandoned 3DS challenge

---

TEST CASE 26
Title: Verify behaviour when a card that is not 3DS-enrolled is used for guest checkout

Tags: GK Pay Biz, Payment Plugin, Card Entry, 3DS *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is completing a guest card checkout with a card number known to not be 3DS-enrolled
• NOTE: expected behaviour is undocumented — there is no AC or scope-doc note covering this scenario (see `paybiz_release_1_requirements.md`, open item 1). This test case's steps are written, but the expected result is deliberately left open pending dev/PO confirmation — do not assume either outcome below is correct without checking first.

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter valid details for a card known to not be 3DS-enrolled, then tap "Make payment" | [UNCONFIRMED — confirm with dev/PO] Candidate outcomes to check for: (a) payment proceeds without a 3DS step, treated like a frictionless/no-challenge transaction, (b) payment is blocked or declined for lacking 3DS support, or (c) some other processor-level error is surfaced |

Post Conditions:
The following should be true after test completion:
• (Flag for follow-up) Resolve the expected outcome with dev/PO before treating this case as pass/fail-able; update this test case once confirmed

---

TEST CASE 27
Title: Verify that the Merchant Verification modal displays the correct "Powered by" copy and merchant information

Tags: GK Pay Biz, Payment Plugin, Merchant Verification *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer has launched the plugin for a merchant with Business Name, Business Email, Contact Number, and Address configured

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Select/tap on the merchant name or info element to open the merchant info modal | A modal opens |
| 2.   | Observe the modal contents                    | The badge/copy reads "Powered by" (not "Verified GK Pay Biz Merchant"); Business Name, Business Email, Contact Number, and Address are all displayed |

Post Conditions:
The following should be true after test completion:
• The same "Powered by" copy and information display is shown consistently for any merchant — there is no "unverified" variant to compare against this release

---

## Post-Condition Verification

TEST CASE 28
Title: Verify that the confirmation receipt displays the merchant name and amount but never displays the merchant's email address

Tags: GK Pay Biz, Payment Plugin, Receipt *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• A payment has just been completed successfully via the plugin (guest or GK One login path)

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Observe the confirmation/receipt screen       | Merchant name and payment amount are displayed |
| 2.   | Review the full receipt content for any merchant email reference | No merchant email address is displayed anywhere on the receipt |

Post Conditions:
The following should be true after test completion:
• The merchant's email address remains hidden from the customer on the receipt in all cases

---

TEST CASE 29
Title: Verify that an email notification is sent to the customer when a payment completes successfully

Tags: GK Pay Biz, Payment Plugin, Notifications *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer has access to the inbox for the email address used at checkout (guest email or GK One account email)

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Complete a successful payment via the plugin  | Payment success is confirmed in-app |
| 2.   | Check the customer's email inbox              | An email notification confirming the successful payment has been received |

Post Conditions:
The following should be true after test completion:
• The email notification content is accurate and matches the completed transaction (merchant, amount)

---

TEST CASE 30
Title: Verify that an email notification is sent to the customer when a payment attempt fails

Tags: GK Pay Biz, Payment Plugin, Notifications *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer has access to the inbox for the email address used at checkout
• A payment attempt can be forced to fail (e.g. using a known test card that triggers a processor decline)

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Attempt a payment using a card/scenario that will be declined by the processor | Payment fails; failure is shown in-app |
| 2.   | Check the customer's email inbox              | An email notification indicating the payment failed has been received |

Post Conditions:
The following should be true after test completion:
• The failure notification does not falsely confirm a successful payment

---

## Context applied

- **Primary context:** `playground/gkpay-biz/paybiz_release_1_requirements.md`, §3 "Payment Plugin 1.0 / Web Pay" — 29 of the 30 cases trace back to the confirmed requirements there (37752, 37754, 37755 incl. the "Log into GK One" addition, 37742, 37743, 37744 incl. the PO-accepted email-typo risk, 37745, 37748 all 10 sub-points incl. the cardholder-name space rule and expiry nonsense-combo gap, 37749, 37750). TEST CASE 26 (non-3DS-enrolled card) traces to the same requirements doc's open item 1 sub-question (2026-10-13) rather than confirmed AC — its expected result is deliberately left unconfirmed, not generated from requirements. Per review (2026-10-13), the Apple/Google Pay exclusion case (37747) was removed as not needed for this draft — 37747 and the Payment Link exclusions (37740/37741) remain out of scope for this draft's own reasons but no longer have a dedicated test case here.
- **Related/secondary context used:** `squads/payments/features/gkpay-biz/domain-knowledge.md` (payment channel terminology, GKPS/Bill Express framing used in preconditions), `squads/payments/features/gkpay-biz/integration-points.md` (GK One Wallet integration informed TEST CASE 2/3's saved-payment-method framing), `squads/payments/squad.md` (confirmed the plugin's own test scope stops at UI/flow behavior, not underlying card-processor validation — reflected in how negative card-validation cases are worded), `_global/cross-cutting-concerns.md` (Notification Service framing for TEST CASE 29/30).
- **Explicitly excluded per instruction:** `squads/payments/features/gkpay-biz/edge-cases.md` and `test-patterns.md` — not used, as they describe the separate merchant-facing admin portal, not this consumer checkout plugin.
- **Known-issues.md** — checked, currently empty; no known issues to test around.
