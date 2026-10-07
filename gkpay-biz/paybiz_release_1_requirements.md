# PayBiz Release 1 — Requirements for In-Scope Features

Derived by cross-referencing `paybiz_release_1_scope.md` against the user stories in `paybiz_channel_stories.csv` and `paybiz_transactions_stories.csv`. A story is included below if it maps to a workstream the scope doc marks in-scope for Release 1. Several mappings are uncertain or conflict with the scope doc — these are flagged inline rather than silently resolved. Full story text is reproduced in the Appendix for traceability.

---

## 1. Merchant Onboarding & Access

No user story in either CSV covers onboarding — these requirements come from the scope doc / meeting notes only.

- Initial merchants (GKGI, Foods) are onboarded **manually** by the team, not self-service.
- Merchant accounts support a **password reset** path.
- A **dummy/test merchant account** is provisioned for QA, with a URL and valid identifiers for creating login accounts.

---

## 2. QR Code 1.0 — Scan-to-Pay (Person-to-Business only)

Source: Parent 37284 (`paybiz_channel_stories.csv`).

- **37731 — Enter Amount:** scanning a merchant QR code presents a payment interface; the user is directed into the GKOne app (or to install it), can enter a payment amount, and add an optional note. User should not be able to change the payee (P2B only).
- **37732 — Validate Amount Entered:** amounts below $1000 are blocked with a validation message.
- **37737 — Review and Confirm:** review screen shows the payment amount and lets the user pick GK One Wallet or a registered debit/credit card.
- **37736 — Generate Receipt of Payment:** receipt generated on success, matching existing receipt design, emailed immediately to the customer's registered address.
- **37738 — Notification upon Payment:** push notification sent on success or failure.
- **37746 — Pay Using GK One:** launching payment via the GK One app — opens directly if installed, otherwise redirects to the app store.

### Flagged — likely out of scope / needs confirmation
- **37734 — Individual Payment Instrument:** describes sending funds to someone without a wallet. This reads as Person-to-Person, which the scope doc explicitly excludes from QR Code 1.0 this release. **Recommend confirming with the PO whether this story is excluded for Release 1** before building test coverage against it.

### Deferred for now
- **37733 — Validate Transaction against Wallet Amount:** transfers that would push the wallet balance over 500,000 are blocked before reaching the payment processor.
  - [UNCERTAIN] This is phrased as a wallet-to-wallet transfer limit — likely a drafting mistake rather than a deliberate rule, since QR Code 1.0 is P2B only this release. Confirm with the PO, and separately confirm whether the P2B scan-to-pay cap should instead match the plugin channel's $1000–$350,000 band (37743) or needs its own defined limit.
  - Parked rather than tested this round — not deprioritized because it's confirmed out of scope, just not being picked up for now. Revisit once the P2P/P2B cap question is resolved.

---

## 3. Payment Plugin 1.0 / Web Pay

Source: Parent 37286 (plugin launch, review, method selection) plus the guest/card checkout sub-flow under Parent 37285, which the scope-doc meeting notes confirm belongs to the plugin (guest payments apply to the plugin only, not Scan-to-Pay).

- **37752 — Launch Payment Plugin:** plugin opens from the merchant site/app when the customer selects "Pay Now"/"Checkout"; merchant branding and payment details are retained.
- **37754 — Review Payment Details Before Checkout:** checkout screen shows Merchant Name, Product/Service Description, Payment Amount, Fees, Taxes (e.g. GCT), Total Amount Due, Currency; Total = Base Amount + Fees + Tax.
- **37755 — Select Payment Method:** customer is offered Pay with GK One App and Manual Card Entry (Guest Checkout).
  - Apple Pay / Google Pay removed from this story's scope for Release 1 — **37747** (below) confirms these are Not MVP, so the method-selection screen should not present wallet buttons this release.
- **37742 — Display Merchant Verification Status:** selecting the merchant opens a modal; a "Verified GK Pay Biz Merchant" badge appears if the merchant is verified via GK Pay Biz/Bill Express; modal shows Business Name, Email, Contact Number, Address.
  - Clarified: this isn't a status a merchant can gain or lose — it's informational "verified by"/"backed by" wording shown for all merchants. There's no "unverified merchant" concept in this release.
  - Note: exact copy may change (e.g. "Powered by" instead of "Verified by") — confirm final wording before writing test assertions tied to specific text.
- **37743 — Validate Amount (Open):** amounts below $1000 or above $350,000 are blocked with a validation message; an empty amount field shows a "required" error.
  - [UNCERTAIN] Separately still unresolved: should the P2B scan-to-pay cap match this plugin channel's $1000–$350,000 band, or does it need its own defined limit? 
- **37744 — Guest Checkout:** customer enters First/Last Name and Email without creating an account; valid entry + passing field validation proceeds to the auth/payment method screen; merchant-defined custom fields (e.g. Unit Number) are also presented and accepted.
  - **Gap:** no AC defines what counts as a valid/invalid name (allowed characters, length) for these fields — flag for clarification, similar to the character rules 37748 defines for cardholder name.
- **37745 — Validate Guest Checkout:** blank required fields and invalid email addresses are both blocked with validation messages.
- **37748 — Enter Card Details** — 10 sub-requirements:
  1. Payment summary (Merchant Name, Amount, Currency, Payment Method section) matches the amount from the previous step.
  2. Cardholder name accepts alphabetic characters, spaces, hyphens, apostrophes.
  3. Cardholder name is mandatory — empty + "Make Payment" blocks with an error.
     - **Gap:** AC doesn't specify whether "Cardholder Name" is one combined field or separate First/Last Name fields — confirm before writing field-level test cases.
  4. Card number auto-formats in groups (e.g. `4111111111111111` → `4111 1111 1111 1111`).
  5. Invalid card number fails validation with an appropriate error.
  6. Expiry date accepts a valid future MM/YYYY value.
     - **Gap:** AC only covers valid-future and expired(past) dates — should also explicitly cover rejecting nonsensical combinations (e.g. month > 12, non-numeric input, malformed MM/YYYY).
  7. Expired card + "Make Payment" blocks with an error; request is not submitted.
  8. CVV is masked during entry; valid CVV accepted.
  9. CVV validated by brand length (Visa/Mastercard = 3 digits, Amex = 4); invalid CVV + "Make Payment" blocks with an error.
  10. Valid details + required fields → request submitted to the processor with a loading indicator shown during processing.
  - **Gap:** the scope doc confirms guest card payments are presented with a **3DS challenge**, but no step in 37748's AC describes the 3DS step itself. Test cases for 3DS will need to be derived from the scope-doc meeting note alone until a story exists — flag this to the team.
- **37749 — Confirmation Receipt of Payment:** receipt shows merchant name, amount, and a **hidden** merchant email address.
- **37750 — Notification upon Payment:** email notification sent on success or failure (vs. push notification on the QR/wallet channel — confirmed channel-specific, not a duplicate).

### Flagged as NOT in scope
- **37747 — Pay Using Apple Pay or Google Pay:** title explicitly states **Not MVP** — excluded from Release 1 test scope. 37755's method-selection AC above has been updated accordingly (Apple/Google Pay removed).
- **37740 — Enter a Payment Amount (Open)** and **37741 — Enter a Payment Amount (Fixed):** both describe a standalone "payment link" entry point, distinct from launching the plugin from a merchant site. **Confirmed out of scope for Release 1** — only Plugin 1.0 and QR Code 1.0 are in this release.

---

## 4. Merchant View Transactions

Source: Parent 32611 (`paybiz_transactions_stories.csv`). The scope doc describes this workstream as **read-only — list + balance only**; two of the five stories go beyond that and are flagged rather than included as confirmed scope.

- **32622 — Real-Time Transaction Dashboard:** new transactions appear on refresh/open without delay; pending transactions show "Pending" until completed.
- **37332 — Transaction Status Tracking:** status reflects Pending/Completed/Failed; failed transactions show an error/reason on request.
- **37333 — Customer Payment Details:** transaction detail view shows customer name, payment method, reference ID, and payment channel; same details are included in any export.

### Flagged as NOT in scope
- **37325 — Transaction Filtering:** confirmed out of scope for Release 1 — no filtering (by date/channel/amount) this release, consistent with the scope doc's read-only list + balance description.
- **37331 — Transaction Export:** confirmed out of scope for Release 1 as well — no CSV/PDF export this release. Workstream 5 is now fully consistent with the scope doc's "read-only, list + balance only" description.

---

## 5. Settlement 

- No user stories exist for settlement in either CSV.
- Per the scope doc: settlement uses the existing Bill Express infrastructure via biller codes; no new settlement build this release.
- QA note from the scope-doc meeting: settlement was called out as low priority for testing this release — confirm this is a deliberate risk-acceptance decision before finalizing the test plan, not just an assumption carried over from the scope doc.

---

## Summary of open items before test planning

1. Confirm 37734 (Individual Payment Instrument) is excluded from QR Code 1.0 as a P2P case.
2. Get a story (or at least documented AC) for the 3DS guest-payment challenge step.
3. Confirm settlement is deliberately out of test scope, not just undocumented.
4. Get stories or documented requirements for manual merchant onboarding, password reset, and dummy-account provisioning.
5. Confirm whether the P2B scan-to-pay cap should match the plugin's $1000–$350,000 band (37743) or needs its own limit, now that the 500,000 wallet-to-wallet figure (37733) is flagged as a likely drafting mistake.
6. Confirm whether "Cardholder Name" on 37748 is one combined field or separate First/Last Name fields.
7. Confirm expiry-date validation on 37748 should reject nonsensical date combinations, not just past/future dates.
8. Confirm whether Guest Checkout (37744) name fields need defined valid/invalid character rules.
9. Confirm final wording for the merchant verification badge/note (37742) — "Verified by" vs "Powered by" vs other copy.

### Resolved this round
- Apple Pay / Google Pay removed from 37755's Release 1 scope — no longer conflicts with 37747 (Not MVP).
- Payment-link stories (37740, 37741) confirmed out of scope for Release 1.
- Merchant verification status (37742) clarified — not a gain/lose concept, just informational "verified by"/"backed by" display shown for all merchants.
- Transaction Filtering (37325) confirmed out of scope for Release 1.
- Transaction Export (37331) confirmed out of scope for Release 1 — Workstream 5 is now fully read-only (list + balance), matching the scope doc.

---

## Appendix: All User Stories (Reference)

### A. `paybiz_channel_stories.csv`

| ID | Title | Parent | In Release 1 requirements above? |
|---|---|---|---|
| 37731 | Enter Amount | 37284 | Yes (§2) |
| 37732 | Validate Amount Entered | 37284 | Yes (§2) |
| 37733 | Validate Transaction against Wallet Amount | 37284 | Deferred for now (§2) |
| 37734 | Individual Payment Instrument | 37284 | Flagged — likely excluded (§2) |
| 37736 | Generate Receipt of Payment | 37284 | Yes (§2) |
| 37737 | Review and Confirm | 37284 | Yes (§2) |
| 37738 | Notification upon Payment | 37284 | Yes (§2) |
| 37740 | Enter a Payment Amount (Open) | 37285 | No — confirmed out of scope (§3) |
| 37741 | Enter a Payment Amount (Fixed) | 37285 | No — confirmed out of scope (§3) |
| 37742 | Display merchant verification status | 37285 | Yes (§3) |
| 37743 | Validate Amount (Open) | 37285 | Yes (§3) |
| 37744 | Guest Checkout | 37285 | Yes (§3) |
| 37745 | Validate Guest Checkout | 37285 | Yes (§3) |
| 37746 | Pay Using GK One | 37284 | Yes (§2) |
| 37747 | Pay Using Apple Pay or Google Pay (Not MVP) | 37285 | No — Not MVP (§3) |
| 37748 | Enter Card Details | 37285 | Yes (§3) |
| 37749 | Confirmation Receipt of Payment | 37285 | Yes (§3) |
| 37750 | Notification upon Payment | 37285 | Yes (§3) |
| 37752 | Launch Payment Plugin from Merchant Website or Mobile App | 37286 | Yes (§3) |
| 37754 | Review Payment Details Before Checkout | 37286 | Yes (§3) |
| 37755 | Select Payment Method | 37286 | Yes — Apple/Google Pay removed from AC (§3) |

Full story text (role/goal + acceptance criteria) for all of the above is maintained in **`paybiz_channel_stories.md`** — not duplicated here to avoid drift between two copies of the same source text.

### B. `paybiz_transactions_stories.csv`

| ID | Title | Parent | In Release 1 requirements above? |
|---|---|---|---|
| 32622 | Real-Time Transaction Dashboard | 32611 | Yes (§4) |
| 37325 | Transaction Filtering | 32611 | No — confirmed out of scope (§4) |
| 37331 | Transaction Export | 32611 | No — confirmed out of scope (§4) |
| 37332 | Transaction Status Tracking | 32611 | Yes (§4) |
| 37333 | Customer Payment Details | 32611 | Yes (§4) |

Full story text is maintained in **`paybiz_transactions_stories.md`** — not duplicated here for the same reason.

---

*Derived from `paybiz_release_1_scope.md`, `paybiz_channel_stories.md`/`.csv`, and `paybiz_transactions_stories.md`/`.csv` (all in this folder), 2026-10-07. This file is scratch/playground content — not authoritative feature documentation. If any of the open items above get resolved, update this file and the relevant source file, and consider whether the resolved rule belongs in the permanent feature docs under `squads/`.*
