# Test Cases — Payment Link (Release 1)

Generated via Test Case Generator skill. Scope: the browser-based payment-link checkout (Dynamic and Static amount entry → merchant verification → guest checkout or "Pay with GK One App" app-launch → card entry → 3DS (guest card only) → confirmation/receipt → email notification). Apple Pay, Google Pay, the BNPL/installment option, the embedded Payment Plugin channel, and QR Code Scan-to-Pay are explicitly out of scope and excluded below.

---

## Happy Path

TEST CASE 1
Title: Verify that a customer can click a Dynamic payment link and complete a guest checkout card payment successfully

Tags: GK Pay Biz, Payment Link, Guest Checkout, Smoke *(suggested — confirm these match your tagging convention)*

Pre Conditions:
The following should be true before proceeding:
• A merchant has generated a Dynamic payment link (amount not pre-set)
• The customer does not have a GK One account, or chooses not to use one
• The card used is issued by a bank/issuer that requires 3D Secure authentication

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Click the merchant's payment link            | A browser-based payment interface opens |
| 2.   | Observe the amount field                      | The amount field is blank and editable |
| 3.   | Enter a valid payment amount and an optional note | Values are accepted; the Payee cannot be changed |
| 4.   | Select/tap the merchant name to open the merchant info modal | Modal opens showing "Powered by" and Business Name, Business Email, Contact Number, Business Address |
| 5.   | Close the modal and select "Checkout as guest" (or equivalent guest option) |                                              |
| 6.   | Enter a valid full name (e.g. "Naomi Silvera") and a valid email address | Values are accepted |
| 7.   | Enter valid card details: cardholder name, a valid card number, a valid future expiry date (MM/YYYY), and a valid CVV for the card brand |                                              |
| 8.   | Tap "Make payment"                           | The customer is redirected to the card issuer's authentication page |
| 9.   | Complete the 3DS challenge successfully       | The issuer returns approval and payment processing continues |
| 10.  | Observe the result screen                     | Payment success confirmation is shown, with the merchant name and amount displayed |

Post Conditions:
The following should be true after test completion:
• The payment is completed successfully
• A confirmation receipt is available showing merchant name and amount, with no merchant email address displayed anywhere
• An email notification confirming successful payment is sent to the customer's registered email address

---

TEST CASE 2
Title: Verify that a customer can click a Static payment link and complete a payment with the merchant's pre-set amount

Tags: GK Pay Biz, Payment Link, Guest Checkout *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• A merchant has generated a Static payment link with a pre-set amount (e.g. $50,000)

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Click the merchant's Static payment link     | A browser-based payment interface opens |
| 2.   | Observe the amount field                      | The amount is pre-filled with the merchant's set amount and is NOT editable |
| 3.   | Proceed to guest checkout and card entry with valid data | Values are accepted |
| 4.   | Tap "Make payment" and complete the 3DS challenge if presented | Payment is processed |
| 5.   | Observe the result screen                     | Payment success is displayed with the correct, unmodified fixed amount |

Post Conditions:
The following should be true after test completion:
• The payment completes using exactly the merchant's pre-set amount
• An email notification confirming successful payment is sent to the customer's registered email address

---

TEST CASE 3
Title: Verify that the GK One app opens directly when a customer selects "Pay with GK One App" from a payment link and the app is already installed

Tags: GK Pay Biz, Payment Link, GK One Launch *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The GK One app is already installed on the device
• A valid payment link has been opened and the payment-method screen is showing

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Select "Pay with GK One App"                 | The GK One app opens directly |

Post Conditions:
The following should be true after test completion:
• No app-store redirect occurs since the app is already installed

---

## Alternate Valid Paths

TEST CASE 4
Title: Verify that the customer is redirected to the app store when selecting "Pay with GK One App" and GK One is not installed

Tags: GK Pay Biz, Payment Link, GK One Launch *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The GK One app is NOT installed on the device
• A valid payment link has been opened and the payment-method screen is showing

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Select "Pay with GK One App"                 | The customer is redirected to the relevant app store listing for GK One |

Post Conditions:
The following should be true after test completion:
• The payment flow cannot proceed via this method until GK One is installed and opened

---

TEST CASE 5
Title: Verify that a merchant-defined custom field (e.g. "Unit Number") is presented and accepted during guest checkout via a payment link

Tags: GK Pay Biz, Payment Link, Guest Checkout *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The integrating merchant has configured a custom field (e.g. "Unit Number") for guest checkout

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Proceed to guest checkout from a payment link | The custom field (e.g. "Unit Number") is displayed alongside name and email |
| 2.   | Enter a valid value in the custom field, along with a valid name and email | Values are accepted |
| 3.   | Proceed to card entry and complete the payment with valid details |                                              |

Post Conditions:
The following should be true after test completion:
• The payment completes successfully with the custom field value captured

---

TEST CASE 6
Title: Verify that a cardholder name containing a hyphen and an apostrophe is accepted during card entry via a payment link

Tags: GK Pay Biz, Payment Link, Card Entry *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen, reached via a payment link

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
Title: Verify that the card number input auto-formats into groups of 4 digits as the customer types, via a payment link

Tags: GK Pay Biz, Payment Link, Card Entry *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen, reached via a payment link

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Type the card number `4111111111111111` into the card number field, digit by digit | The field displays the number formatted as `4111 1111 1111 1111` |

Post Conditions:
The following should be true after test completion:
• The underlying stored/submitted card number value is correct regardless of display formatting

---

TEST CASE 8
Title: Verify that a customer can add an optional note when entering a Dynamic payment amount via a payment link

Tags: GK Pay Biz, Payment Link *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• A Dynamic payment link has been opened

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter a valid amount and a short note (e.g. "Invoice #4521") | Note is accepted |
| 2.   | Proceed through checkout and complete the payment | Payment is processed successfully with the note attached |

Post Conditions:
The following should be true after test completion:
• The note does not block or alter the payment outcome

---

## Negative / Error Cases

TEST CASE 9
Title: Verify that the system blocks payment when a Dynamic payment amount entered via a link is below $1000

Tags: GK Pay Biz, Payment Link, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• A Dynamic payment link has been opened

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter an amount of $999.99                   |                                              |
| 2.   | Attempt to continue                          | A validation message is displayed; the customer cannot proceed |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted

---

TEST CASE 10
Title: Verify that the system blocks payment when a Dynamic payment amount entered via a link is above $350,000

Tags: GK Pay Biz, Payment Link, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• A Dynamic payment link has been opened

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter an amount of $350,000.01               |                                              |
| 2.   | Attempt to continue                          | A validation message is displayed; the customer cannot proceed |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted

---

TEST CASE 11
Title: Verify that the system blocks payment when the Dynamic amount field is left empty

Tags: GK Pay Biz, Payment Link, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• A Dynamic payment link has been opened

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Leave the amount field empty                 |                                              |
| 2.   | Attempt to continue                          | An error is displayed indicating an amount is required; the customer cannot proceed |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted

---

TEST CASE 12
Title: Verify that the system blocks guest checkout via a payment link when required fields (name or email) are left blank

Tags: GK Pay Biz, Payment Link, Guest Checkout, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the guest checkout screen, reached via a payment link

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

TEST CASE 13
Title: Verify that the system blocks guest checkout via a payment link when the email address is in an invalid format

Tags: GK Pay Biz, Payment Link, Guest Checkout, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the guest checkout screen, reached via a payment link

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter a valid name and an incorrectly formatted email address (e.g. "naomi@@gmail") | |
| 2.   | Attempt to continue                          | A validation message is displayed indicating the email format is invalid; customer cannot proceed |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted

---

TEST CASE 14
Title: Verify that the system blocks payment submission when the cardholder name field is left empty, via a payment link

Tags: GK Pay Biz, Payment Link, Card Entry, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen, reached via a payment link, with all other fields valid

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Leave the cardholder name field empty, complete all other card fields with valid data | |
| 2.   | Tap "Make payment"                           | An error is displayed; payment is blocked |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted to the processor

---

TEST CASE 15
Title: Verify that the system blocks payment submission when the cardholder name does not contain a space (single-word entry), via a payment link

Tags: GK Pay Biz, Payment Link, Card Entry, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen, reached via a payment link, with all other fields valid

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter "NaomiSilvera" (no space) as the cardholder name, complete all other card fields with valid data | |
| 2.   | Tap "Make payment"                           | An error is displayed indicating a full name (first and last) is required; payment is blocked |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted to the processor

---

TEST CASE 16
Title: Verify that the system blocks payment submission when an invalid card number is entered, via a payment link

Tags: GK Pay Biz, Payment Link, Card Entry, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen, reached via a payment link, with all other fields valid

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter an invalid/non-existent card number, complete all other card fields with valid data | |
| 2.   | Tap "Make payment"                           | An appropriate error is displayed; payment is blocked |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted to the processor

---

TEST CASE 17
Title: Verify that the system blocks payment submission when the card's expiry date has already passed, via a payment link

Tags: GK Pay Biz, Payment Link, Card Entry, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen, reached via a payment link, with all other fields valid

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter an expiry date that has already passed, complete all other card fields with valid data | |
| 2.   | Tap "Make payment"                           | An error is displayed indicating the card is expired; payment is blocked |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted to the processor

---

TEST CASE 18
Title: Verify that the system rejects an expiry date with a month value greater than 12, via a payment link

Tags: GK Pay Biz, Payment Link, Card Entry, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen, reached via a payment link, with all other fields valid

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter "13/2027" in the expiry date field, complete all other card fields with valid data | |
| 2.   | Tap "Make payment"                           | A validation error is displayed; payment is blocked |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted to the processor

---

TEST CASE 19
Title: Verify that the system rejects non-numeric or malformed input in the expiry date field, via a payment link

Tags: GK Pay Biz, Payment Link, Card Entry, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen, reached via a payment link, with all other fields valid

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

TEST CASE 20
Title: Verify that the system blocks payment when the CVV length does not match the card brand (Visa/Mastercard), via a payment link

Tags: GK Pay Biz, Payment Link, Card Entry, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen, reached via a payment link, with a Visa or Mastercard number entered and all other fields valid

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter a 2-digit CVV, then a 4-digit CVV      | |
| 2.   | Tap "Make payment" for each case             | An error is displayed for each; payment is blocked (Visa/Mastercard requires exactly 3 digits) |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted to the processor

---

TEST CASE 21
Title: Verify that the system blocks payment when the CVV length does not match the card brand (Amex), via a payment link

Tags: GK Pay Biz, Payment Link, Card Entry, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen, reached via a payment link, with an Amex card number entered and all other fields valid

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter a 3-digit CVV                          | |
| 2.   | Tap "Make payment"                           | An error is displayed; payment is blocked (Amex requires exactly 4 digits) |

Post Conditions:
The following should be true after test completion:
• No payment request is submitted to the processor

---

TEST CASE 22
Title: Verify that payment is declined when 3D Secure authentication fails, via a payment link

Tags: GK Pay Biz, Payment Link, Card Entry, 3DS *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is completing guest card checkout via a payment link with valid card details
• The card's issuer requires 3D Secure authentication, and the test setup can force a failed authentication outcome (e.g. a known test card/credential for failed 3DS)

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter valid card details and tap "Make payment" | The customer is redirected to the issuer's authentication page |
| 2.   | Complete the authentication challenge with details that cause it to fail | The issuer returns a failed outcome |
| 3.   | Observe the result screen                     | Payment is declined; no payment success confirmation is shown |

Post Conditions:
The following should be true after test completion:
• The payment is not processed when 3DS authentication fails
• The customer sees a clear decline message, not a generic or silent failure

---

TEST CASE 23
Title: Verify that payment is not processed when a customer exits the 3D Secure authentication flow before completing it, via a payment link

Tags: GK Pay Biz, Payment Link, Card Entry, 3DS *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is completing guest card checkout via a payment link with valid card details
• The card's issuer requires 3D Secure authentication for this transaction

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter valid card details and tap "Make payment" | The customer is redirected to the issuer's authentication page |
| 2.   | Exit/abandon the authentication flow before completing it (e.g. close the challenge, navigate back) | The customer is returned to the payment link checkout without a completed authentication outcome |
| 3.   | Observe the result screen                     | No payment success confirmation is shown; payment has not been processed |

Post Conditions:
The following should be true after test completion:
• The payment is not processed when authentication is left incomplete
• The customer is not charged and is left in a recoverable state (able to retry payment)

---

## Edge Cases

TEST CASE 24
Title: Verify that a Dynamic payment amount of exactly $1000 is accepted (lower boundary)

Tags: GK Pay Biz, Payment Link, Validation, Boundary *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• A Dynamic payment link has been opened

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter an amount of exactly $1,000.00         |                                              |
| 2.   | Attempt to continue                          | No validation error is shown; customer can proceed |

Post Conditions:
The following should be true after test completion:
• The amount is accepted as the minimum valid boundary

---

TEST CASE 25
Title: Verify that a Dynamic payment amount of exactly $350,000 is accepted (upper boundary)

Tags: GK Pay Biz, Payment Link, Validation, Boundary *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• A Dynamic payment link has been opened

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter an amount of exactly $350,000.00       |                                              |
| 2.   | Attempt to continue                          | No validation error is shown; customer can proceed |

Post Conditions:
The following should be true after test completion:
• The amount is accepted as the maximum valid boundary

---

TEST CASE 26
Title: Verify that a Static payment link's amount cannot be edited by the customer

Tags: GK Pay Biz, Payment Link, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• A Static payment link with a pre-set amount has been opened

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Attempt to tap/select the amount field and change its value | The amount field does not accept edits — no input control is available, or any attempted change is rejected |

Post Conditions:
The following should be true after test completion:
• The amount that proceeds to checkout is unchanged from the merchant's original pre-set value

---

TEST CASE 27
Title: Verify that a guest checkout payment via a payment link still completes successfully when the customer enters a mistyped (but validly formatted) email address

Tags: GK Pay Biz, Payment Link, Guest Checkout *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the guest checkout screen, reached via a payment link
• This behaviour is a known, accepted risk — no email verification exists; this test confirms it is expected, not a defect

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

TEST CASE 28
Title: Verify that the payment link checkout does not present Apple Pay or Google Pay as payment method options

Tags: GK Pay Biz, Payment Link, Validation *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer has reached the payment-method screen via a payment link
• Device used supports both Apple Pay and Google Pay, to rule out device-capability as the reason either is absent

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Observe the available payment method options | Only "Pay with GK One App" and a guest/card-entry option are shown; Apple Pay and Google Pay are not presented as options |

Post Conditions:
The following should be true after test completion:
• No Apple Pay or Google Pay option is available anywhere in the Release 1 payment-link flow

---

TEST CASE 29
Title: Verify that the CVV input is masked as it is typed, via a payment link

Tags: GK Pay Biz, Payment Link, Card Entry *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer is on the card entry screen, reached via a payment link

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Enter a valid CVV                            | Each digit entered is masked (not shown in plain text) on screen |

Post Conditions:
The following should be true after test completion:
• The CVV value is not visibly exposed on screen during entry

---

## Post-Condition Verification

TEST CASE 30
Title: Verify that the Merchant Verification modal displays the correct "Powered by" copy and merchant information on a payment link

Tags: GK Pay Biz, Payment Link, Merchant Verification *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer has opened a payment link for a merchant with Business Name, Business Email, Contact Number, and Address configured

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Select/tap on the merchant name or info element to open the merchant info modal | A modal opens |
| 2.   | Observe the modal contents                    | The badge/copy reads "Powered by" (not "Verified GK Pay Biz Merchant"); Business Name, Business Email, Contact Number, and Address are all displayed |

Post Conditions:
The following should be true after test completion:
• The same "Powered by" copy and information display is shown consistently for any merchant — there is no "unverified" variant to compare against this release

---

TEST CASE 31
Title: Verify that the confirmation receipt displays the merchant name and amount but never displays the merchant's email address, via a payment link

Tags: GK Pay Biz, Payment Link, Receipt *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• A payment has just been completed successfully via a payment link (guest checkout path)

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Observe the confirmation/receipt screen       | Merchant name and payment amount are displayed |
| 2.   | Review the full receipt content for any merchant email reference | No merchant email address is displayed anywhere on the receipt |

Post Conditions:
The following should be true after test completion:
• The merchant's email address remains hidden from the customer on the receipt in all cases

---

TEST CASE 32
Title: Verify that an email notification is sent to the customer when a payment via a payment link completes successfully

Tags: GK Pay Biz, Payment Link, Notifications *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer has access to the inbox for the email address used at checkout

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Complete a successful payment via a payment link | Payment success is confirmed in-browser |
| 2.   | Check the customer's email inbox              | An email notification confirming the successful payment has been received |

Post Conditions:
The following should be true after test completion:
• The email notification content is accurate and matches the completed transaction (merchant, amount)

---

TEST CASE 33
Title: Verify that an email notification is sent to the customer when a payment attempt via a payment link fails

Tags: GK Pay Biz, Payment Link, Notifications *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The customer has access to the inbox for the email address used at checkout
• A payment attempt can be forced to fail (e.g. using a known test card that triggers a processor decline)

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Attempt a payment using a card/scenario that will be declined by the processor | Payment fails; failure is shown in-browser |
| 2.   | Check the customer's email inbox              | An email notification indicating the payment failed has been received |

Post Conditions:
The following should be true after test completion:
• The failure notification does not falsely confirm a successful payment

---

## Context applied

- **Primary context:** `playground/gkpay-biz/paybiz_release_1_requirements.md`, §3.5 "Payment Link" — all 33 cases trace back to confirmed requirements/AC there: 37740/37741 (Dynamic/Static amount entry), 37746 (GK One app-launch mechanic — explicitly NOT the Plugin's different "Log into GK One" web-login behavior), and the shared-with-Plugin stories 37742 ("Powered by" verification badge), 37743 (universal $1000–$350,000 band, no payment-method exception), 37744 (guest checkout incl. the accepted email-typo risk), 37745, 37748 (all 10 sub-points incl. the cardholder-name space rule and expiry nonsense-combo gap), 37749 (hidden merchant email), 37750 (email notification), and 37891 (3DS — all three outcomes: success, failure, cancellation).
- **Explicitly out of scope, excluded:** 37747 (Apple Pay/Google Pay) — one negative case (TEST CASE 28) confirms their absence rather than testing functionality. The BNPL/installment option visible in one design variant has no backing story and was not given any test coverage, per instruction.
- **Related/secondary context used:** `squads/payments/features/gkpay-biz/domain-knowledge.md` (payment link as a named channel, GKPS/Bill Express framing), `squads/payments/features/gkpay-biz/integration-points.md` (GK One Wallet integration informing the app-launch framing in TEST CASE 3/4), `squads/payments/squad.md` (card/processor-level validation stays with the Payment Widget/GK Web Pay layer, not this channel's own test scope — reflected in how negative card-validation cases are worded), `_global/cross-cutting-concerns.md` (Notification Service framing for TEST CASE 32/33).
- **Deliberately excluded:** `squads/payments/features/gkpay-biz/edge-cases.md` and `test-patterns.md` — describe the separate merchant-facing admin portal, not this consumer checkout flow.
- **Overlap with the Plugin suite:** several cases here (amount boundaries, card validation, 3DS, guest checkout, receipt, notifications) test the same underlying rule as an equivalent case in `plugin-test-cases-draft.md`, since both channels share Parent 37285's AC but need separate ADO Test Case work items per channel. Titles are deliberately worded "via a payment link" / "via the plugin" where needed so they don't collide, though some (e.g. CVV brand-length cases) may still read very similarly — this is expected per the existing suites' own precedent (see `test-cases/README.md` gotcha #3 on title collisions across suites).
