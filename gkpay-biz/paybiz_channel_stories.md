# PayBiz Payment Channel Stories

Readable version of `paybiz_channel_stories.csv`. Stories are grouped by their `Parent` field, which represents the payment channel. [UNCERTAIN] The CSV has no parent title row, so channel names below are inferred from the stories grouped under each Parent ID — confirm against ADO if the actual channel/epic names differ.

All stories are `State: New`, unassigned, no tags, unless noted otherwise.

---

## Channel: Parent 37284 — In-App Wallet Payment (GK One to GK One / Individual)

| ID | Title |
|---|---|
| 37731 | Enter Amount |
| 37732 | Validate Amount Entered |
| 37733 | Validate Transaction against Wallet Amount |
| 37734 | Individual Payment Instrument |
| 37736 | Generate Receipt of Payment |
| 37737 | Review and Confirm |
| 37738 | Notification upon Payment |
| 37746 | Pay Using GK One |

### 37731 — Enter Amount
- **As a:** GK One user
- **I want to:** scan a QR code and enter an amount
- **So that:** I can make a payment
- **AC:** Given the user scans a merchant QR code, when the payment interface is presented, then the user is directed into the app (or to download it) and can enter a payment amount, change the Payee, and add an optional note.

### 37732 — Validate Amount Entered
- **As a:** GK One user
- **I want to:** enter a minimum amount for payment
- **So that:** payment is validated
- **AC:** Given the user is entering a payment amount, when the amount entered is less than $1000, then the system prevents submission and shows a validation message.

### 37733 — Validate Transaction against Wallet Amount
- **As a:** GkOne user
- **I want to:** send funds without exceeding my wallet max
- **So that:** I always have funds
- **AC:** Given a user initiates a transfer into their wallet, when the transfer would push the wallet balance over the 500,000 maximum, then the system blocks the transaction before it reaches the payment processor and shows an appropriate error/warning.

### 37734 — Individual Payment Instrument
- **As a:** GK One user
- **I want to:** send funds to someone without a wallet
- **So that:** the recipient can still receive funds
- **AC:** Given a user is initiating a payment, when the transaction is validated, then both sender and receiver must have the GK One app installed; the Payer must have a wallet, the Payee does not need one.

### 37736 — Generate Receipt of Payment
- **As a:** user
- **I want to:** get a receipt after top-up
- **So that:** I can confirm my purchase
- **AC:** Given a successful payment, when the confirmation is displayed, then the user can view a receipt matching the design/layout of all other receipts in the system, and it is emailed immediately to the customer's registered email address.

### 37737 — Review and Confirm
- **As a:** GkOne user
- **I want to:** review payment details before paying
- **So that:** I can make corrections if needed
- **AC:** Given the user is preparing to confirm a payment, when the review screen is displayed, then it shows the payment amount and lets the user pick a payment method — GK One Wallet or a registered debit/credit card.

### 37738 — Notification upon Payment
- **As a:** GK One user
- **I want to:** receive a notification upon an attempt to make a payment
- **So that:** I am aware of whether it was successful or it failed
- **AC:** Given a payment attempt has been made, when it succeeds or fails, then the system sends a **push notification** with the status.

*Note (2026-10-15): story 37746 ("Pay Using GK One," listed above) is also referenced by `GKPayBiz_addedscope.csv` as part of the Payment Link channel — see Parent 37285 below. Full story content is written up once, here under its original Parent 37284; the Payment Link channel section just points back to it rather than duplicating.*

---

## Channel: Parent 37285 — Payment Link Checkout (Guest / Card / Wallet)

**Scope update (2026-10-15):** `GKPayBiz_addedscope.csv` (same folder) confirms this channel — Payment Link — is being added to Release scope. It lists 11 story IDs: ten already documented below (37740, 37741, 37742, 37743, 37744, 37745, 37747, 37748, 37749, 37750), one from the QR channel shared into this flow (37746, see note on its table row), and one brand-new story not previously seen anywhere in this repo (37891 — see entry at the bottom of this section). The added-scope CSV has no Description/Acceptance Criteria columns — it's an ID/title manifest only, not full story content.

| ID | Title |
|---|---|
| 37740 | Enter a Payment Amount (Dynamic) |
| 37741 | Enter a Payment Amount (Static) |
| 37742 | Display merchant verification status |
| 37743 | Validate Amount (Dynamic) |
| 37744 | Guest Checkout |
| 37745 | Validate Guest Checkout |
| 37746 | Pay Using GK One *(shared with Parent 37284 — see note below)* |
| 37747 | Pay Using Apple Pay or Google Pay (Not MVP) |
| 37748 | Enter Card Details |
| 37749 | Confirmation Receipt of Payment |
| 37750 | Notification upon Payment |
| 37891 | Complete 3D Secure Authentication *(new — see entry below)* |

### 37740 — Enter a Payment Amount (Dynamic)
- **As a:** GKOne customer
- **I want to:** enter the amount I wish to pay when I click on a payment link
- **So that:** I can make a payment to the merchant
- **AC:** Given a payment link is clicked, a browser link should be presented; when the payment interface is shown, then the user can enter a payment amount, cannot change the Payee, and may add an optional note.

### 37741 — Enter a Payment Amount (Static)
- **As a:** GKOne customer
- **I want to:** enter the amount I wish to pay when I click on a payment link
- **So that:** I can make a payment to the merchant
- **AC:** Given a payment link is clicked, a browser link should be presented; when the payment interface is shown, then the user can make a payment but **neither the Payee nor the amount can be changed**; an optional note may be added.

### 37742 — Display merchant verification status
- **As a:** customer
- **I want to:** view merchant verification information before making a payment
- **So that:** I can confirm I am paying a legitimate merchant
- **AC (3 scenarios):**
  1. Given the customer is on the payment initiation screen, when the payer selects the merchant, then a merchant information modal is displayed.
  2. Given the merchant is verified through GK Pay Biz / Bill Express, when the modal is opened, then a "Verified GK Pay Biz Merchant" badge is shown.
  3. Given merchant info exists, when the modal is displayed, then it shows: Business Name, Business Email, Contact Number, Business Address.

### 37743 — Validate Amount (Dynamic)
- **Description:** "gk" — [UNCERTAIN] placeholder/incomplete description, no proper user story written.
- **AC (3 scenarios):**
  1. Given the payee enters an amount below $1000, when they select Continue, then a validation message is shown and they cannot proceed.
  2. Given the payee enters an amount above $350,000, when they select Continue, then a validation message is shown and payment does not proceed.
  3. Given the amount field is empty, when they select Continue, then an error indicates an amount is required.

### 37744 — Guest Checkout
- **As a:** GKOne customer
- **I want to:** provide my contact information without creating an account
- **So that:** I can complete a payment quickly
- **AC:**
  - Given a valid amount and passing field validation, when the payee selects Continue, then the authentication/payment method screen is displayed.
  - Given the guest form is displayed, when the customer enters First/Last Name and Email, then the values are accepted.
  - Given the merchant has created a custom field (e.g. Unit Number), when the form is displayed, then that field is presented and its value accepted.

### 37745 — Validate Guest Checkout
- **As a** user 
- **I want to** be able to ensure my checkout experience is validated 
- **So that** I am aware if any mistakes were made.
- **AC:**
  - Given required fields are blank, when the payee selects "Continue to Payment," then validation messages are displayed.
  - Given an invalid email address is entered, when the customer selects Continue to Payment, then an error message is displayed.

### 37747 — Pay Using Apple Pay or Google Pay (Not MVP)
- **As a:** customer
- **I want to:** pay using my digital wallet
- **So that:** I can complete payment quickly and securely
- **Note:** Title explicitly flags **Not MVP** — deprioritized/future scope.
- **AC (3 scenarios):**
  1. Given the device supports Apple Pay, when the payment page loads, then the Apple Pay button is shown.
  2. Given the device supports Google Pay, when the payment page loads, then the Google Pay button is shown.
  3. Given the customer authorizes wallet payment, when authorization succeeds, then payment is submitted for processing.

### 37748 — Enter Card Details
- **As a:** customer
- **I want to:** securely enter my card details
- **So that:** I can complete payment to the merchant using my debit or credit card
- **AC — 10 scenarios:**
  1. **Payment summary display:** shows Merchant Name, Payment Amount, Currency, Payment Method section; amount matches the previous step.
  2. **Cardholder name entry:** accepts alphabetic characters, spaces, hyphens, apostrophes.
  3. **Cardholder name mandatory:** empty name + "Make Payment" → error, payment blocked.
  4. **Card number formatting:** auto-formats in groups (e.g. `4111111111111111` → `4111 1111 1111 1111`).
  5. **Card number validation:** invalid number → validation fails with an appropriate error.
  6. **Expiry date entry:** accepts a valid future MM/YYYY date.
  7. **Expired card validation:** past expiry + "Make Payment" → error, request not submitted.
  8. **CVV entry:** valid CVV accepted; field is masked during entry.
  9. **CVV validation:** invalid CVV + "Make Payment" → error. Visa/Mastercard = 3 digits, Amex = 4 digits.
  10. **Submit payment:** valid details + required fields → request submitted to payment processor, with a loading indicator shown during processing.

### 37749 — Confirmation Receipt of Payment
- **As a:** user
- **I want to:** get a receipt after top-up
- **So that:** I can confirm my purchase
- **AC:** Given a successful payment, when the confirmation is displayed, then the payer can view a receipt showing merchant name, amount, and a **hidden** merchant email address.
- Confirmed: the hidden-merchant-email treatment is consistent with the Plugin channel's 37749 (same ID, shared story) — not a copy-paste inconsistency, this is the standard pattern.

### 37750 — Notification upon Payment
- **As a:** GK One user
- **I want to:** receive a notification upon an attempt to make a payment
- **So that:** I am aware of whether it was successful or it failed
- **AC:** Given a payment attempt has been made, when it succeeds or fails, then the system sends an **email notification** with the status.
- Note: mirrors 37738 (same title) on the wallet channel, but 37738 sends a **push** notification while this one sends **email** — channel-specific difference, not a duplicate.

### 37891 — Complete 3D Secure Authentication
- **As a:** customer
- **I want to:** complete issuer authentication when required
- **So that:** my card transaction can be authorized securely
- **AC (4 scenarios):**
  1. **3DS challenge required:** Given the card issuer requires 3D Secure authentication, when payment is submitted, then the customer is redirected to their issuer's authentication page.
  2. **Successful challenge:** Given authentication is completed successfully, when the issuer returns approval, then payment processing continues.
  3. **Failed challenge:** Given authentication fails, when the challenge outcome is returned, then payment is declined.
  4. **Authentication cancelled:** Given the customer exits the authentication flow, when authentication is incomplete, then payment is not processed.
- **Resolved (2026-10-15):** story content received from the user, closing the long-standing 3DS gap flagged throughout `paybiz_release_1_requirements.md` and the Plugin test case draft. Propagate this into both before continuing test planning — see cross-channel observations below for what needs updating.
- **Parent confirmed: 37285 (Payment Link).** Grouped correctly here. Per the cross-channel note below, 3DS applies to Plugin's guest card payments too, since Plugin shares this card-entry sub-flow (37748) with Payment Link — not a separate story needed per channel.

---

## Channel: Parent 37286 — Merchant-Embedded Checkout (Plugin)

| ID | Title |
|---|---|
| 37752 | Launch Payment Plugin from Merchant Website or Mobile App |
| 37754 | Review Payment Details Before Checkout |
| 37755 | Select Payment Method |

### 37752 — Launch Payment Plugin from Merchant Website or Mobile App
- **As a:** customer
- **I want to:** launch the GK Pay Biz payment plugin directly from a merchant website or mobile application
- **So that:** I can securely complete payment without leaving the merchant experience
- **AC (2 scenarios):**
  1. Given the customer is on a merchant site/app, when they select "Pay Now," "Checkout," or similar, then the GK Pay Biz plugin is displayed.
  2. Given the plugin is launched, when the checkout screen loads, then merchant branding and payment details provided by the merchant system are displayed.

### 37754 — Review Payment Details Before Checkout
- **As a:** customer
- **I want to:** review all charges before making payment
- **So that:** I understand exactly what I am paying for
- **AC:**
  - Given the checkout page loads, when payment info is retrieved, then it shows: Merchant Name, Product/Service Description, Payment Amount, Fees (if applicable), Taxes (e.g. GCT), Total Amount Due, Payment Currency.
  - Given fees and taxes apply, when the summary is presented, then Total = Base Amount + Fees + Tax.

### 37755 — Select Payment Method
- **As a:** customer
- **I want to:** choose my preferred payment method
- **So that:** I can use the payment option most convenient for me
- **AC:**
  - Given checkout has been initiated, when payment methods are available, then the customer sees: Pay with GK One App, Google Pay (where supported), Apple Pay (where supported), Manual Card Entry (Guest Checkout).
  - Given multiple methods are available, when the customer selects one, then the selected payment journey begins.

---

## Cross-channel observations

- **Duplicate titles across channels, different behavior:** "Notification upon Payment" appears on both the wallet channel (37738, push) and the link-checkout channel (37750, email) — not a true duplicate, but worth flagging in case one was meant to cover both channels. Similarly "Generate Receipt of Payment" (37736, wallet) vs. "Confirmation Receipt of Payment" (37749, link checkout, hidden merchant email).
- **Validation limits — resolved:** the $1000–$350,000 band (37743) is the universal cap, regardless of channel or funding source (including GK One Prepaid Card). No payment-method-specific exception. This reconfirms the existing 37733 decision in `paybiz_release_1_requirements.md` — the 500,000 figure stays a drafting mistake, and 37733 stays marked for removal from the backlog. The tension flagged above is resolved in favor of the single $350,000 cap.
- **One story has a placeholder description** ("gk"): 37743. The AC is present and usable, but the user-story framing (As a / I want / So that) is missing — may be worth flagging back to the author. (37745's description was previously placeholder too — now resolved, see entry above.)
- **37747 (Apple Pay/Google Pay) is explicitly Not MVP** — consider excluding from initial test coverage unless the squad confirms otherwise.
- **Payment Link reuses stories from both other channels:** 37746 (QR channel) and the merchant-verification/guest-checkout/card-entry group (37742–37750, originally documented here as "Payment Link Checkout") both resurface in `GKPayBiz_addedscope.csv`'s scope-addition list — consistent with earlier design review (`paybiz_release_1_requirements.md`) finding that Payment Link and the embedded Plugin share the same downstream checkout experience, just with different entry points. Worth keeping in mind when writing test cases: a defect in the shared checkout steps likely affects Payment Link, Plugin, and partially QR (for 37746) simultaneously.
- **37891 (3DS Authentication) is now resolved with full content** (see entry above) — closes the 3DS gap previously flagged across `paybiz_release_1_requirements.md` (§3 and the open items list) and `test-cases-draft.md` (TEST CASE 25, marked provisional pending this). Both need updating to reflect the real AC rather than the scope-doc-only assumption.

---

*Source: `paybiz_channel_stories.csv` and `GKPayBiz_addedscope.csv` (same folder, added 2026-10-15). This file is scratch/playground content — not authoritative feature documentation.*
