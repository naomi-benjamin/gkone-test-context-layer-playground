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
  - **Gap:** the P2B scan-to-pay cap is now confirmed to match the plugin channel's $1000–$350,000 band (see 37743), but this story's AC only states the $1000 floor — no $350,000 ceiling is documented here. Story may need updating to add the upper bound explicitly.
- **37737 — Review and Confirm:** review screen shows the payment amount and lets the user pick GK One Wallet or a registered debit/credit card.
  - **Confirmed — update AC:** a Fee (and Tax, where applicable) line item is a required part of this screen, same as the Plugin channel's 37754. Current AC only mentions "the payment amount" — story needs updating to add the Fee/Tax breakdown before Total.
- **37736 — Generate Receipt of Payment:** receipt generated on success, matching existing receipt design, emailed immediately to the customer's registered address.
- **37738 — Notification upon Payment:** push notification sent on success or failure.

### Confirmed NOT in scope
- **37734 — Individual Payment Instrument:** describes sending funds to someone without a wallet (Person-to-Person). **Confirmed excluded** — QR Code 1.0 is P2B only this release.
- **37746 — Pay Using GK One:** mis-mapped by the PO under this parent (37284) — **confirmed (2026-10-14) this story actually belongs to the Payment Link workstream**, not QR Code/Scan-to-Pay. Still removed from QR Code's own scope for that reason — it's a different channel's content, not duplicated here. **Update (2026-10-15): Payment Link itself is now in scope** (see new §3.5 below), so this story is not excluded from Release 1 overall, just from this channel specifically. TEST CASE 7 and TEST CASE 8 in `qr-code-test-cases-draft.md`, both built on this story, should still be removed from the QR draft — the coverage belongs in a Payment Link test case file instead.

### Confirmed NOT in scope (pending removal)
- **37733 — Validate Transaction against Wallet Amount:** transfers that would push the wallet balance over 500,000 are blocked before reaching the payment processor.
  - The 500,000 wallet-to-wallet figure is a drafting mistake — QR Code 1.0 is P2B only this release, so this limit doesn't apply as written. **Confirmed by Mikhail: this story is being removed from the backlog.**
  - Not tested this round. The P2B scan-to-pay cap should match the plugin channel's $1000–$350,000 band (37743) rather than using its own separate limit — see the gap flagged under 37732 above.
  - **Reconfirmed (2026-10-15):** a question briefly arose over whether the 500,000 cap might actually be real but payment-method-specific (tied to GK One Prepaid Card funding, not the QR channel) — that's been settled. The $1000–$350,000 band is the universal cap regardless of channel or funding source, including GK One Prepaid Card. No exception. This removal decision stands.

### Design cross-check (source: `GK Pay Biz Payment Channel - mobile.pdf`, added to playground 2026-10-13; Payment Link screens in the same file were excluded here as of 2026-10-14 since the channel was out of scope — now covered separately under §3.5 since Payment Link is in scope as of 2026-10-15)
- **New detail, no story yet — confirmed with Mikhail:** QR codes come in two variants — **Dynamic** (amount field starts at $0.00, payer enters the amount — matches 37731/37732) and **Static** (amount pre-filled, e.g. $50,000, not editable by the payer). Definitions confirmed correct; still worth getting this written up as explicit AC, since neither 37731 nor 37732 currently distinguishes the two.
- **Confirmed — must-have:** the review/confirm screen's Fee (and in one design variant, Tax) line item before Total is real, required Release 1 behavior, not a design-only detail. Folded into 37737 above.
- **Resolved:** "GK One Wallet" and the specific cards shown aren't in conflict — the wallet is made up of cards. "GK One Prepaid card" is the default wallet card, and other registered cards (e.g. "My NCB MasterCard") only become available/visible after logging into GK One. No AC change needed beyond what's already captured in 37737.
- Reference copy for test assertions: success screen reads "Payment successful — $X JMD — You've made a payment of $X JMD from [Payer Name]."

---

## 3. Payment Plugin 1.0 / Web Pay

Source: Parent 37286 (plugin launch, review, method selection) plus the guest/card checkout sub-flow under Parent 37285, which the scope-doc meeting notes confirm belongs to the plugin (guest payments apply to the plugin only, not Scan-to-Pay).

- **37752 — Launch Payment Plugin:** plugin opens from the merchant site/app when the customer selects "Pay Now"/"Checkout"; merchant branding and payment details are retained.
- **37754 — Review Payment Details Before Checkout:** checkout screen shows Merchant Name, Product/Service Description, Payment Amount, Fees, Taxes (e.g. GCT), Total Amount Due, Currency; Total = Base Amount + Fees + Tax.
- **37755 — Select Payment Method:** customer is offered Pay with GK One App and Manual Card Entry (Guest Checkout).
  - Apple Pay / Google Pay removed from this story's scope for Release 1 — **37747** (below) confirms these are Not MVP, so the method-selection screen should not present wallet buttons this release.
  - **Folded in from Plugin 2.0 design:** "Pay with GK One App" works via a "Log into GK One" step — entering the email/phone associated with the account surfaces the customer's saved GK One payment methods and wallet (shown as selectable cards, e.g. "GK One Prepaid card," "My NCB MasterCard"), with a "Pay another way" link back to guest card entry. No dedicated story exists yet for this login/saved-methods step — treat as in scope for Release 1 and get it written up.
- **37742 — Display Merchant Verification Status:** selecting the merchant opens a modal; a "Verified GK Pay Biz Merchant" badge appears if the merchant is verified via GK Pay Biz/Bill Express; modal shows Business Name, Email, Contact Number, Address.
  - Clarified: this isn't a status a merchant can gain or lose — it's informational "verified by"/"backed by" wording shown for all merchants. There's no "unverified merchant" concept in this release.
  - **Confirmed — update AC:** final copy is **"Powered by"**, not "Verified GK Pay Biz Merchant" as the current AC states. Story/AC needs updating to match; test assertions on this badge's text should use "Powered by."
- **37743 — Validate Amount (Open):** amounts below $1000 or above $350,000 are blocked with a validation message; an empty amount field shows a "required" error.
  - Confirmed: the P2B scan-to-pay cap (QR Code 1.0) should match this $1000–$350,000 band rather than using its own separate limit.
- **37744 — Guest Checkout:** customer enters First/Last Name and Email without creating an account; valid entry + passing field validation proceeds to the auth/payment method screen; merchant-defined custom fields (e.g. Unit Number) are also presented and accepted.
  - **Gap:** no AC defines what counts as a valid/invalid name (allowed characters, length) for these fields — flag for clarification, similar to the character rules 37748 defines for cardholder name.
  - **Risk (accepted by PO):** no email-address verification exists for guest checkout — if the customer mistypes their email, the payment can still complete but they may never receive the confirmation email (37750). Not a functionality gap to fix — PO has accepted this risk. Test cases should treat a typo'd email as expected to still produce a successful payment, just a lost notification.
- **37745 — Validate Guest Checkout:** blank required fields and invalid email addresses are both blocked with validation messages.
- **37748 — Enter Card Details** — 10 sub-requirements:
  1. Payment summary (Merchant Name, Amount, Currency, Payment Method section) matches the amount from the previous step.
  2. Cardholder name accepts alphabetic characters, spaces, hyphens, apostrophes.
  3. Cardholder name is mandatory — empty + "Make Payment" blocks with an error.
     - Confirmed: Cardholder Name is a single combined field expecting a full name (first + last), e.g. "Naomi Silvera" is valid, "NaomiSilvera" (no space) is not. Needs explicit test coverage around this space-separation rule — single-word entries, extra/multiple spaces, hyphenated or multi-part last names, etc.
  4. Card number auto-formats in groups (e.g. `4111111111111111` → `4111 1111 1111 1111`).
  5. Invalid card number fails validation with an appropriate error.
  6. Expiry date accepts a valid future MM/YYYY value.
     - **Gap:** AC only covers valid-future and expired(past) dates — should also explicitly cover rejecting nonsensical combinations (e.g. month > 12, non-numeric input, malformed MM/YYYY).
  7. Expired card + "Make Payment" blocks with an error; request is not submitted.
  8. CVV is masked during entry; valid CVV accepted.
  9. CVV validated by brand length (Visa/Mastercard = 3 digits, Amex = 4); invalid CVV + "Make Payment" blocks with an error.
  10. Valid details + required fields → request submitted to the processor with a loading indicator shown during processing.
  - **Resolved (2026-10-15):** the 3DS step now has a full story — **37891, Complete 3D Secure Authentication** (received from the user, written up in `paybiz_channel_stories.md`). Four scenarios: (1) if the card issuer requires 3DS, the customer is redirected to the issuer's authentication page after submitting payment; (2) successful authentication → payment processing continues; (3) failed authentication → payment is declined; (4) customer exits/abandons the authentication flow → payment is not processed. **Parent confirmed as 37285 (Payment Link)** — not this channel's own parent (37286), but the card-entry flow it's attached to (37748) is shared between Plugin and Payment Link, so it still applies to Plugin's guest card payments too.
    - [UNCERTAIN] Scenario 1 implies that if the issuer does *not* require 3DS, payment proceeds without a redirect — but this isn't stated explicitly, only implied by the Given clause. This was the sub-question raised during test drafting (non-3DS-enrolled cards) — likely answered, but worth a quick confirmation rather than treating as fully certain.
- **37749 — Confirmation Receipt of Payment:** receipt shows merchant name, amount, and a **hidden** merchant email address.
- **37750 — Notification upon Payment:** email notification sent on success or failure (vs. push notification on the QR/wallet channel — confirmed channel-specific, not a duplicate).

### Flagged as NOT in scope
- **37747 — Pay Using Apple Pay or Google Pay:** title explicitly states **Not MVP** — excluded from Release 1 test scope. 37755's method-selection AC above has been updated accordingly (Apple/Google Pay removed).

*(37740/37741, the standalone payment-link entry point, were flagged NOT in scope here as of 2026-10-14. As of 2026-10-15, Payment Link is confirmed in scope — see new §3.5 below. Note removed from this list accordingly.)*

### Design cross-check (source: `GK Pay Biz Payment Channel - mobile.pdf`, added to playground 2026-10-13; Payment Link screens in the same file covered separately under §3.5)
- The in-scope "Payment Plug-in" flow (shown embedded in a third-party app — a MyDigicel example) is a **minimal** flow: amount entry → review & confirm (merchant name, amount, total, one already-registered card selected) → processing → success with a reference number and a Share-receipt action. "Powered by GK Pay Biz" branding is visible, consistent with 37752's merchant-branding requirement.
- No fee/tax line appears on the Plugin's review screen in this example, unlike the QR channel's (see §2) — may be merchant-specific rather than a channel rule; don't assume Plugin never charges fees without confirming.

### Plugin 2.0 design (source: `GK Pay Biz Payment Plug-in(2.0) - Mobile.pdf`, added 2026-10-13)
A fuller version of the Plugin flow — **resolves the structural question raised above.**
- **Resolved:** guest checkout, card entry, and the review screen's Fee/GCT/Total breakdown ARE part of the Plugin flow after all. Tapping "Pay Now" in the merchant's app/site redirects to the GK Pay Biz payment portal (`gracekennedy.b2clogin.com`), which shows Review & Confirm (Merchant, Product, Fees, GCT, Total — matches 37754's AC closely) and then either a saved-payment-method path or "Or continue as guest" with the same card-entry form already documented under 37748. 37742/37744/37745/37748/37754 can stay mapped to Plugin as currently written — no re-scoping needed.
- "Log into GK One" saved-payment-method detail folded into 37755 above.
- **New detail, no story yet:** full email receipt template shown — "Payment Receipt for [Merchant]" header, Recipient details (Name, When, Reference #), Payment details (Payment method, Amount, Fee, Tax, Total), a security footer ("if you did not do this, change your password/PIN, contact support"), and "Powered by Pay Biz" branding. Useful as a reference for 37749/37750 test assertions.
  - Checked: the receipt shows the merchant's **name**, not their email — 37749's "hidden merchant email address" AC still holds, no conflict. The email address itself isn't displayed anywhere on this receipt.
- **Versioning caveat — confirmed:** this file is labeled "2.0" and its payment-method screen shows Apple Pay / Google Pay, but these are confirmed **still out of scope for Release 1** — the design is forward-looking (a later release), consistent with 37747's "Not MVP" and 37755's Apple/Google Pay exclusion. No change to Release 1 test scope.

### Plugin 2.1 design (source: `GK Pay Biz Payment Plug-in 2.1- Mobile - Check out as GK One.pdf` and `Checkout as Guest - Payment Plug-in.pdf`, added 2026-10-13)
- **Resolved — "Pay another way":** confirmed to be a back button, explicitly annotated as such in the design file. It appears on both the GK One saved-payment-methods screen (after login) and the dedicated guest card-entry screen, and in both cases returns the customer to the Review & Confirm "Pay with" step, which presents four distinct options: "Log into GK One," "Pay with GooglePay," "Pay with ApplePay," "Checkout as guest." It does not reveal an inline guest form on the same screen — see TEST CASE 3 in `plugin-test-cases-draft.md`, updated accordingly.
- **Open question — button label drift:** this design's guest-entry option is labeled "Checkout as guest." Earlier test cases in this draft (e.g. TEST CASE 1, step 4) reference "Manual Card Entry (Guest Checkout)" as the button label instead. Not yet confirmed whether these are the same button under two different names (a labeling drift across design iterations) or two different things — worth a quick check before relying on either label in finalized test steps.
- **Versioning caveat — reconfirmed:** both "Pay with GooglePay" and "Pay with ApplePay" appear as explicit, distinct buttons on this screen, same as the 2.0 design above — confirmed **still out of scope for Release 1**, consistent with 37747's "Not MVP" and 37755's Apple/Google Pay exclusion, even in this newer (2.1) design iteration. No change to Release 1 test scope.

---

## 3.5 Payment Link

**Added to scope 2026-10-15**, confirmed via `GKPayBiz_addedscope.csv`. Source: Parent 37285 (`paybiz_channel_stories.csv` / `GKPayBiz_addedscope.csv`) — the same parent already documented under §3 for the Plugin's shared checkout sub-flow. Entry point is a payment link (web browser or in-app), distinct from launching the embedded Plugin, but it lands on the same downstream GK Pay Biz checkout experience once the amount step is passed.

- **37740 — Enter a Payment Amount (Dynamic):** clicking a payment link presents a browser-based payment interface; the user enters a payment amount and may add an optional note; the Payee cannot be changed. (Retitled from "Open" to "Dynamic" in `paybiz_channel_stories.md`, 2026-10-15 — consistent with the QR channel's Dynamic/Static terminology.)
- **37741 — Enter a Payment Amount (Static):** same entry point, but neither the Payee nor the amount can be changed — the amount is fixed by the merchant. (Retitled from "Fixed" to "Static" — resolves the earlier title/AC mismatch flagged against this story; "Static" now matches the QR channel's naming for the same concept.)
- **37746 — Pay Using GK One:** launching payment via the GK One app from a payment link — opens directly if installed, otherwise redirects to the app store. (Previously mis-mapped under QR Code/§2 — confirmed here instead, see §2's note on 37746.)

**Shared with Plugin (§3) — already written up there, not duplicated:**
- **37742** (Merchant Verification Status, "Powered by" copy), **37743** (Validate Amount — $1000–$350,000 band), **37744** (Guest Checkout, incl. the PO-accepted email-typo risk), **37745** (Validate Guest Checkout), **37748** (Enter Card Details, all 10 sub-requirements incl. the cardholder-name space rule), **37749** (Confirmation Receipt, hidden merchant email), **37750** (email Notification upon Payment), **37891** (3DS Authentication — Parent 37285, documented against this channel originally, applies equally to Plugin's guest card payments per the note under §3's 37748).
- These apply to Payment Link exactly as written under §3 — the checkout steps don't differ by entry point. A defect in any of these likely affects both Plugin and Payment Link simultaneously.

### Confirmed NOT in scope (same exclusion as Plugin)
- **37747 — Pay Using Apple Pay or Google Pay:** **confirmed still out of scope for Release 1**, even though Apple Pay and Google Pay buttons are visible on the Payment Link web-checkout design (`GK Pay Biz Payment Channel - mobile.pdf`, "Payment link - Web version"). Same exclusion as the Plugin channel (§3) — do not generate test coverage for either button on this channel.

### Design cross-check (source: `GK Pay Biz Payment Channel - mobile.pdf`, "Payment link - Web version" and "Payment link - In App version" sections, read 2026-10-13, previously excluded from use while this channel was out of scope — now applicable)
- The merchant verification modal shown in this design matches 37742 closely: "About this merchant" with Business Name, Business Email, Contact Number, Address, and a "Verified GK Pay Biz Merchant" badge. [UNCERTAIN] this design predates the "Powered by" wording confirmation (§3, 37742) — treat "Powered by" as current, this design's "Verified GK Pay Biz Merchant" text as outdated.
- Guest checkout in this design shows "First and last name," "Email," and a merchant-defined "Unit number" custom field, consistent with 37744.
- Card entry shows a single "Card holder's name" field (First & last name placeholder) — consistent with the already-confirmed single-combined-field rule under 37748.
- Success screen (Web version): shows the paid amount, "Payment made to [Merchant Name]," merchant reference number, and a masked merchant email, with a "Share" action — broadly consistent with 37749's hidden-merchant-email rule, though the masked (partially visible) email here is worth double-checking against 37749's "hidden" wording — not identical treatments.
- **New, undocumented, NOT assumed in scope:** the Payment Link (In-App version) review screen shows a BNPL/installment option — "4 payments of $14,812.50, 0% interest, every 2 weeks" with an auto-pay toggle. No story anywhere describes this. **Do not generate test coverage for it** until a story or explicit scope confirmation exists — flagged as a new open item below.

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

1. Confirm settlement is deliberately out of test scope, not just undocumented.
2. Get stories or documented requirements for manual merchant onboarding, password reset, and dummy-account provisioning.
3. Confirm expiry-date validation on 37748 should reject nonsensical date combinations, not just past/future dates.
4. Confirm whether Guest Checkout (37744) name fields need defined valid/invalid character rules.
5. Get a story/AC written for the "Log into GK One" saved-payment-method option (folded into 37755 above) — currently undocumented as its own story.
6. Confirm whether anything on the Merchant Transactions list/detail view (§4, 37333) should distinguish a guest-checkout Payment Plugin transaction from one made by an authenticated GK One user. 37333's AC doesn't address this either way — raised during test drafting 2026-10-13, see `transactions-test-cases-draft.md` TEST CASE 3.
7. Quick confirmation on 37891: does "issuer does not require 3DS" mean payment proceeds straight through with no redirect? Implied by the AC's Given clause but not stated outright — low-risk, but worth a one-line confirmation before writing the "card not 3DS-enrolled" test case.
8. **New (2026-10-15):** is the BNPL/installment option shown on the Payment Link (In-App) design (§3.5) in scope for Release 1? No story backs it — confirm before any test coverage is written for it.
9. **New (2026-10-15):** the Payment Link success-screen design shows a masked (partially visible) merchant email, while 37749's AC says the merchant email is fully hidden — confirm whether "masked" and "hidden" are meant to be the same treatment before writing assertions against either.
10. Get dedicated Payment Link test cases written — none exist yet now that the channel is in scope (§3.5). Covers: 37740/37741 (amount entry via link), 37746 (GK One app launch from a link), plus confirming the already-written Plugin test cases (TC4 onward in `plugin-test-cases-draft.md`, the shared checkout steps) apply unchanged with just the entry point swapped.

### Stories/AC that still need writing (requirement confirmed, text not yet updated)
These are no longer open questions — they're settled requirements where the actual story/AC text just hasn't caught up yet. Test planning should proceed against the confirmed behavior regardless of story state.
- **37732:** add the $350,000 upper bound (confirmed to match the plugin's band).
- **37737:** add the Fee/Tax breakdown line item.
- **37742:** update the verification badge copy to "Powered by."
- **QR Dynamic/Static variants** (37731/37732): write up as explicit AC — concept confirmed, no story distinguishes the two yet.
- **"Log into GK One" saved-payment-method step** (§3, near 37755): no story exists at all yet — see item 5 above.

### Resolved (2026-10-15)
- **3DS challenge step — fully resolved.** Story **37891 (Parent 37285, Payment Link)** now has complete AC: issuer-required redirect, successful/failed challenge outcomes, and cancellation handling. See §3 under 37748, and the full write-up in `paybiz_channel_stories.md`. Propagated into `test-cases/plugin-test-cases-draft.md` (TEST CASE 25–27).
- **Payment Link channel — added to Release 1 scope.** Confirmed via `GKPayBiz_addedscope.csv`. New §3.5 added above. Apple Pay / Google Pay remain explicitly out of scope on this channel too, same as Plugin, despite appearing in the design. Dedicated Payment Link test cases still need writing — see open item 10.

---

## Appendix: All User Stories (Reference)

### A. `paybiz_channel_stories.csv`

| ID | Title | Parent | In Release 1 requirements above? |
|---|---|---|---|
| 37731 | Enter Amount | 37284 | Yes (§2) |
| 37732 | Validate Amount Entered | 37284 | Yes (§2) |
| 37733 | Validate Transaction against Wallet Amount | 37284 | No — confirmed for removal by Mikhail (§2) |
| 37734 | Individual Payment Instrument | 37284 | No — confirmed excluded, P2P (§2) |
| 37736 | Generate Receipt of Payment | 37284 | Yes (§2) |
| 37737 | Review and Confirm | 37284 | Yes (§2) |
| 37738 | Notification upon Payment | 37284 | Yes (§2) |
| 37740 | Enter a Payment Amount (Dynamic) | 37285 | Yes — added to scope 2026-10-15 (§3.5) |
| 37741 | Enter a Payment Amount (Static) | 37285 | Yes — added to scope 2026-10-15 (§3.5) |
| 37742 | Display merchant verification status | 37285 | Yes (§3, shared with §3.5) |
| 37743 | Validate Amount (Open) | 37285 | Yes (§3, shared with §3.5) |
| 37744 | Guest Checkout | 37285 | Yes (§3, shared with §3.5) |
| 37745 | Validate Guest Checkout | 37285 | Yes (§3, shared with §3.5) |
| 37746 | Pay Using GK One | 37284 | Yes — mis-mapped (actually Payment Link), added to scope 2026-10-15 (§3.5) |
| 37747 | Pay Using Apple Pay or Google Pay (Not MVP) | 37285 | No — Not MVP (§3 and §3.5) |
| 37748 | Enter Card Details | 37285 | Yes (§3, shared with §3.5) |
| 37749 | Confirmation Receipt of Payment | 37285 | Yes (§3, shared with §3.5) |
| 37750 | Notification upon Payment | 37285 | Yes (§3, shared with §3.5) |
| 37752 | Launch Payment Plugin from Merchant Website or Mobile App | 37286 | Yes (§3) |
| 37754 | Review Payment Details Before Checkout | 37286 | Yes (§3) |
| 37755 | Select Payment Method | 37286 | Yes — Apple/Google Pay removed from AC (§3) |
| 37891 | Complete 3D Secure Authentication | 37285 | Yes — resolves the 3DS gap (§3, shared with §3.5) |

Full story text (role/goal + acceptance criteria) for all of the above is maintained in **`paybiz_channel_stories.md`** — not duplicated here to avoid drift between two copies of the same source text. (37891 arrived via `GKPayBiz_addedscope.csv`, not the original `paybiz_channel_stories.csv`, but is written up in the same place.)

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
