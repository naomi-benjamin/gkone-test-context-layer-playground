# WU Outbound V3 — Regression Suite

Standalone V3 test suite structured by flow step. V3-specific behaviours are called out inline where they differ from V2. Saved Payee coverage excluded — see `2026-05-05-saved-payee-v2-v3/`. Payment Widget step excluded — covered under payment-widget test suite.

**Standard preconditions (apply to all cases unless stated otherwise):**
- KYC Tier 1 account, non-expired ID
- JM or KY market
- Known stable corridor confirmed working in the test environment

---

## Section 1 — Eligibility

### OB-01
**Verify that a KYC Tier 0 user cannot access the outbound flow**

Preconditions:
- KYC Tier 0 account

Steps:
1. Login
2. Navigate to the outbound flow entry point
   - Expected: Feature is not accessible; not having completing eKYC is surfaced as the reason

---

### OB-03
**Verify that a KYC Tier 1 user with an expired ID cannot access the outbound flow**

Preconditions:
- KYC Tier 1 account, expired ID

Steps:
1. Login
2. Navigate to the outbound flow entry point
   - Expected: Feature is blocked at the eligibility check; expired ID is surfaced as the reason

---

### OB-04
**Verify that a user in a non-live market cannot access the outbound flow**

Preconditions:
- Account in a non-live market (not JM or KY)

Steps:
1. Login
2. Navigate to the outbound flow entry point
   - Expected: Feature is not accessible for this market

---

## Section 2 — Quote screen

> **V3 note:** The quote screen accepts either send amount or receive amount (V3 addition). Country selection triggers the field template fetch — this is the event that establishes the corridor for the dynamic recipient details screen.

---

### OB-05
**Verify that entering a valid send amount returns a quote with the receive amount calculated**

Preconditions:
- Standard preconditions

Steps:
1. Login
2. Launch the outbound flow
3. Select destination country, state, city, and payout method
4. Enter a valid send amount
5. Tap Get Quote
   - Expected: Quote displayed; receive amount shown alongside send amount; exchange rate, fees, and 10-minute countdown present

---

### OB-06
**Verify that entering a valid receive amount returns a quote with the send amount calculated**

> V3 only — V2 accepts send-side amount only. 

Preconditions:
- Standard preconditions

Steps:
1. Login
2. Launch the outbound flow
3. Select destination country, state, city, and payout method
4. Switch to the receive amount input and enter a valid receive amount
5. Tap Get Quote
   - Expected: Quote displayed; send amount calculated from the entered receive amount; review screen expresses quote in sender currency with receive amount shown alongside

---

### OB-07
**Verify that switching between send and receive input immediately clears the other field**

> V3 only.

Preconditions:
- Standard preconditions

Steps:
1. Login
2. Launch the outbound flow
3. Select destination country, state, city, and payout method
4. Enter a send amount
5. Switch focus to the receive amount field
   - Expected: Send amount field is immediately cleared
6. Enter a receive amount; switch back to the send amount field
   - Expected: Receive amount field is immediately cleared

---

### OB-08
**Verify that a send amount below the corridor minimum shows an inline error**

Preconditions:
- Standard preconditions
- Confirm current JM/KY minimum send limits before running (JM: 1,000 JMD; KY: 5 KYD — configurable)

Steps:
1. Login
2. Launch the outbound flow
3. Select destination country, state, city, and payout method
4. Enter a send amount below the corridor minimum
5. Tap Get Quote
   - Expected: Quote request made; inline error displayed adjacent to the send amount field; user cannot proceed
6. Verify the error message is user-friendly — no internal error codes or raw WU response strings

---

### OB-09
**Verify that a send amount above the corridor maximum shows an inline error**

Preconditions:
- Standard preconditions
- Confirm current JM/KY maximum send limits before running (JM: 150,000 JMD; KY: 830 KYD — configurable)

Steps:
1. Login
2. Launch the outbound flow
3. Select destination country, state, city, and payout method
4. Enter a send amount above the corridor maximum
5. Tap Get Quote
   - Expected: Inline error adjacent to send field; user cannot proceed; error message is user-friendly

---

### OB-10
**Verify that a receive amount below the corridor minimum shows an inline error on the receive field**

> V3 only. Use receive-side minimum for the destination currency — confirm with dev/WU config; these are not the same values as send-side limits.

Preconditions:
- Standard preconditions
- Receive-side minimum for the target corridor confirmed with dev/WU config

Steps:
1. Login
2. Launch the outbound flow
3. Select destination country, state, city, and payout method
4. Switch to receive amount input; enter an amount below the corridor receive minimum
5. Tap Get Quote
   - Expected: Inline error adjacent to the receive amount field (not the send field); user cannot proceed; error message is user-friendly

---

### OB-11
**Verify that a receive amount above the corridor maximum shows an inline error on the receive field**

> V3 only. Use receive-side maximum for the destination currency.

Preconditions:
- Standard preconditions
- Receive-side maximum for the target corridor confirmed with dev/WU config

Steps:
1. Login
2. Launch the outbound flow
3. Select destination country, state, city, and payout method
4. Switch to receive amount input; enter an amount above the corridor receive maximum
5. Tap Get Quote
   - Expected: Inline error adjacent to receive field; user cannot proceed; error is user-friendly

---

### OB-12
**Verify that an intra-corridor selection disables receive amount input**

> Intra-corridor = same country for send and receive (e.g. GY → GY). V3 only.

Preconditions:
- Standard preconditions
- A destination country that creates an intra-corridor match with the sender's market

Steps:
1. Login
2. Launch the outbound flow
3. Select a destination country that matches the sender's market (intra-corridor)
4. Observe the amount input area
   - Expected: Only send amount input is available; receive amount input is not shown or is disabled; no dual currency toggle presented

---

### OB-13
**Verify that country selection establishes the corridor and the field template is reflected on the recipient details screen**

> V3 corridor establishment behaviour.

Preconditions:
- Standard preconditions

Steps:
1. Login
2. Launch the outbound flow
3. Select a destination country; complete state, city, payout method, and a valid amount; tap Get Quote
4. Proceed through quote review, third-party check, and PEP check to the recipient details screen
   - Expected: Fields on the recipient details screen match the WU field template for the selected corridor and payout method

---

### OB-14
**Verify that the quote screen always shows country, state, and city regardless of corridor**

Preconditions:
- Standard preconditions

Steps:
1. Login
2. Launch the outbound flow
3. Select several different destination countries in turn
   - Expected: Country, state, and city fields are always present and required; no fields appear or disappear on the quote screen based on corridor selection

---

### OB-15
**Verify that a payout method excluded by GKOne config is not shown as an option for that corridor**

> Two independent gatekeepers control payout method availability: WU field template (WU-side) and Excluded destinations config (GKOne-side). This test targets the GKOne-side exclusion.

Preconditions:
- Standard preconditions
- A corridor with a known GKOne excluded destination (e.g. JM → GY excludes Direct to Wallet; JM → CA excludes Direct to Bank — confirm current config with dev)

Steps:
1. Login
2. Launch the outbound flow
3. Select the destination country with the known exclusion
4. Observe the available payout methods
   - Expected: The excluded payout method is not shown; remaining payout methods are available

---

## Section 3 — Quote review

### OB-16
**Verify that the quote review screen shows a consistent fee breakdown**

Preconditions:
- Standard preconditions

Steps:
1. Login
2. Launch the outbound flow; complete the quote screen with a valid amount; tap Get Quote
3. On the review screen, note convenience fee, WU fee, tax, exchange rate, estimated total, and estimated arrival
   - Expected: All line items present; total is arithmetically consistent with the listed fees; exchange rate and amounts are consistent

---

### OB-17
**Verify that the review screen always expresses the quote in sender currency**

> V3 only — verifies that receive-amount-input quotes are normalised correctly on review.

Preconditions:
- Standard preconditions

Steps:
1. Login
2. Launch the outbound flow; complete the quote screen using receive amount input; tap Get Quote
3. Review the quote screen
   - Expected: Quote is expressed in sender currency; receive amount shown alongside but is not the primary figure

---

### OB-18
**Verify that the quote timer expiry blocks progression**

Preconditions:
- Standard preconditions

Steps:
1. Login
2. Launch the outbound flow; reach the review quote screen
3. Allow the 10:00 timer to count down to 0:00
   - Expected: App blocks progression or surfaces an expiry error; user is invited to start a new quote; stale quote cannot be submitted

---

## Section 4 — Third-party and PEP checks

### OB-19
**Verify that answering Yes to the third-party check exits the user from the flow**

Preconditions:
- Standard preconditions
- Quote screen completed and submitted; quote review proceeded past; third-party check screen reached

Steps:
1. Select Yes on the third-party check screen
   - Expected: User exits the flow with an error message; no path to continue

---

### OB-20
**Verify that answering No to the third-party check allows the user to proceed**

Preconditions:
- Standard preconditions
- Third-party check screen reached

Steps:
1. Select No on the third-party check screen
   - Expected: User proceeds to the PEP check

---

### OB-21
**Verify that answering Yes to the PEP check exits the user from the flow**

Preconditions:
- Standard preconditions
- Third-party check answered No; PEP check screen reached

Steps:
1. Select Yes on the PEP check screen
   - Expected: User exits the flow with an error message; no path to continue

---

### OB-22
**Verify that answering No to the PEP check allows the user to proceed**

Preconditions:
- Standard preconditions
- PEP check screen reached

Steps:
1. Select No on the PEP check screen
   - Expected: User proceeds to the recipient details screen

---

## Section 5 — Recipient details screen

> **V3 note:** Fields are dynamically driven by the WU field template for the corridor + payout method. V2 had a static form. Latin American Name Format toggle is V2-introduced.

---

### OB-23
**Verify that a corridor requiring no additional fields shows only name fields**

Preconditions:
- Standard preconditions
- A corridor where the field template does not require address or postal code fields

Steps:
1. Login
2. Complete the quote screen for the target corridor; proceed through checks to the recipient details screen
   - Expected: Only the name fields for the current toggle state are shown; no Address Line 1, Address Line 2, or Postal Code fields present

---

### OB-24
**Verify that a corridor requiring address fields shows them as required**

Preconditions:
- Standard preconditions
- A corridor where the field template requires address fields (e.g. US corridor)

Steps:
1. Login
2. Complete the quote screen for the target corridor; proceed through checks to the recipient details screen
   - Expected: Address Line 1, Address Line 2, and Postal Code are present and marked required
3. Attempt to tap Continue with address fields empty
   - Expected: Continue button remains disabled

---

### OB-25
**Verify that the Latin American Name Format toggle is always present and defaults to OFF**

Preconditions:
- Standard preconditions

Steps:
1. Login
2. Complete the quote screen for any corridor; proceed through checks to the recipient details screen
   - Expected: Latin American Name Format toggle is visible; default state is OFF (international mode)

---

### OB-26
**Verify that international mode (toggle OFF) shows correct name fields per corridor**

Preconditions:
- Standard preconditions
- Recipient details screen reached; toggle in default (OFF) state

Steps:
1. Login
2. Complete the quote screen; proceed through checks to the recipient details screen
3. Confirm toggle is OFF
   - Expected: First Name and Last Name shown and required; Middle Name shown only if the field template requires it for this corridor

---

### OB-27
**Verify that Latin American mode (toggle ON) replaces international name fields**

Preconditions:
- Standard preconditions

Steps:
1. Login
2. Complete the quote screen; proceed through checks to the recipient details screen
3. Confirm First Name and Last Name are present (toggle OFF)
4. Switch the toggle ON
   - Expected: First Name and Last Name disappear; Given Name, Maternal Name, and Paternal Name appear; both sets do not appear simultaneously
5. Switch the toggle back OFF
   - Expected: International name fields reappear; Latin American fields disappear

---

### OB-28
**Verify that switching the toggle clears name fields entered in the replaced set**

Preconditions:
- Standard preconditions

Steps:
1. Login
2. Complete the quote screen; proceed through checks to the recipient details screen
3. With toggle OFF, partially fill First Name and Last Name
4. Switch the toggle ON
   - Expected: International fields replaced; First Name and Last Name values are cleared
5. Fill Given Name, Maternal Name, Paternal Name; switch back OFF
   - Expected: International fields shown empty; Latin American values are cleared

---

### OB-29
**Verify that address fields are not affected by toggle switches**

Preconditions:
- Standard preconditions
- A corridor requiring address fields

Steps:
1. Login
2. Complete the quote screen for the target corridor; proceed through checks to the recipient details screen
3. Fill address fields
4. Switch the Latin American Name Format toggle ON, then back OFF
   - Expected: Address Line 1, Address Line 2, and Postal Code values are preserved across both toggle switches

---

### OB-30
**Verify that the Continue button remains disabled until all required fields are filled**

Preconditions:
- Standard preconditions
- A corridor requiring address fields

Steps:
1. Login
2. Complete the quote screen for the target corridor; proceed through checks to the recipient details screen
3. Leave at least one required field empty
   - Expected: Continue button is disabled
4. Fill all required fields for the current toggle state including address fields
   - Expected: Continue button becomes enabled

---

### OB-31
**Verify that a field template fetch failure after country selection is handled gracefully**

> [UNCERTAIN: error vs hang — confirm test environment capability to simulate a field template failure for a specific corridor before running]

Preconditions:
- Standard preconditions
- Ability to simulate WU field template unavailability for a specific corridor in the test environment

Steps:
1. Login
2. Launch the outbound flow; select a destination country for which the field template will fail
   - Expected: Observe and document — does the app show a specific error or hang? Does it allow the user to retry or go back? Capture exact behaviour.

---

## Section 6 — Transaction metadata

### OB-32
**Verify that relationship and purpose of transaction fields are required**

Preconditions:
- Standard preconditions
- Recipient details completed; transaction metadata screen reached

Steps:
1. Leave relationship and purpose of transaction empty
   - Expected: Cannot proceed; fields are required
2. Fill both fields and proceed
   - Expected: Flow continues

---

### OB-33
**Verify that source of funds is shown only for corridors that require it**

Preconditions:
- Standard preconditions
- One corridor that requires source of funds; one that does not (confirm with dev/WU field template)

Steps:
1. Login
2. Complete the flow for the corridor that requires source of funds through to the metadata screen
   - Expected: Source of funds field is present and required
3. Repeat for the corridor that does not require it
   - Expected: Source of funds field is absent

---

## Section 7 — Processing and outcome

> Payment Widget step excluded from this suite — covered under payment-widget test suite. These cases assume payment authorisation has completed successfully.

---

### OB-34
**Verify the happy path — processing completes within 2 minutes**

Preconditions:
- Standard preconditions
- Cash Pickup (MIM) corridor confirmed stable

Steps:
1. Login
2. Complete the full outbound flow through payment authorisation
3. Wait up to 2 minutes for processing
   - Expected: MTCN displayed in-app; success email with MTCN received; transaction appears in transaction history with correct status and amount

---

### OB-35
**Verify the FE polling timeout path — processing exceeds 2 minutes**

Preconditions:
- Standard preconditions
- Ability to simulate or trigger a processing delay beyond 2 minutes (confirm test environment method with dev)

Steps:
1. Login
2. Complete the full outbound flow through payment authorisation
3. Allow the frontend polling to reach the 2-minute timeout
   - Expected: Pending screen shown in-app informing user the MTCN will be sent by email; no MTCN shown in-app
4. Check the email inbox once processing completes
   - Expected: Success email with MTCN received

---

### OB-36
**Verify that a pre-payment processing failure blocks the transaction without charging the user**

> Pre-payment stages: CUSTOMER_PROFILE_VALIDATION, REMOTE_SERVICE_PRE_CREATE. Failure here occurs before payment is taken.

Preconditions:
- Standard preconditions
- Ability to trigger a pre-payment stage failure in the test environment (confirm method with dev)

Steps:
1. Login
2. Trigger a failure at a pre-payment stage; proceed through the flow
   - Expected: Transaction fails; user sees an error in-app; no payment is taken; no MTCN generated

---

### OB-37
**Verify that a post-payment processing failure shows an error and triggers the recovery process**

> Post-payment failure at WESTERN_UNION_API_CALL_TO_CONFIRM_OUTBOUND_REMITTANCE: payment has been taken; back-office recovery handles refund.

Preconditions:
- Standard preconditions
- Ability to trigger a post-payment stage failure in the test environment

Steps:
1. Login
2. Trigger a failure at the WU API confirm stage; proceed through the flow
   - Expected: Error shown in-app; failure email received; no MTCN generated; payment deducted (back-office recovery is out of scope for this test — do not reverse manually)

---

### OB-38
**Verify that a REMOTE_SERVICE_CREATE failure delivers both a failure email and an MTCN error email**

> REMOTE_SERVICE_CREATE failure: MTCN has already been generated by WU at this point. Back-office process applies.

Preconditions:
- Standard preconditions
- Ability to trigger a REMOTE_SERVICE_CREATE failure in the test environment

Steps:
1. Login
2. Trigger a REMOTE_SERVICE_CREATE failure; proceed through the flow
   - Expected: Error shown in-app; failure email received; MTCN error email also received (two separate emails)

---

### OB-39
**Verify that success and failure email content is user-friendly with no internal identifiers**

Preconditions:
- Standard preconditions

Steps:
1. Login
2. Complete a successful outbound transaction; open the success email
   - Expected: Email contains MTCN; no internal stage names, system identifiers, or WU error codes
3. Trigger a failure; open the failure email
   - Expected: User-friendly failure message; no raw error codes or internal stage names

---

## Context applied

- `squads/remittance/features/wu-outbound/domain-knowledge.md` — eligibility; V2 user flow (Steps 1–12); V3 delta (dual currency, corridor establishment, dynamic recipient details, notifications); amount limits; payout methods; non-obvious behaviour; processing stages table; outcome delivery table
- `squads/remittance/features/wu-outbound/edge-cases.md` — field template failure edge case; intra-corridor restriction; receive-amount rounding; Latin American toggle data loss; excluded destinations two-gatekeeper pattern
- `squads/remittance/features/wu-outbound/test-patterns.md` — quote screen, recipient details, payout method, email delivery test angles

[UNCERTAIN] markers noted:
- OB-10/OB-11: receive-side limit values not documented — need corridor-specific WU field template values from dev
- OB-31: field template failure behaviour not confirmed (error vs hang)
- OB-35/OB-36/OB-37/OB-38: test environment capability to simulate stage failures needs dev confirmation before running

Saved Payee coverage excluded. Payment Widget coverage excluded.
