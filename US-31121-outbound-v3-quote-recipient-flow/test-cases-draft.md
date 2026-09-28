# Test Cases — US-31121: Outbound v3 Quote Screen & Recipient Flow

Generated: 2026-04-28. Skill: Test Case Generator not available; generated directly in ADO format.

---

## Preconditions (apply to all cases unless stated otherwise)

- Test account: KYC Tier 2, non-expired ID, JM market (or KY where noted).
- A known working corridor is confirmed stable in the test environment (WU config verified before running).
- Access to the email inbox associated with the account.
- Outbound feature enabled in Firebase and Cosmos for the test tenant.

---

## Section 1 — Dual currency quote input (AC2, AC6)

### TC-001 [V3]: Enter valid send amount — receive amount is calculated and quote is displayed [PASS]

**Preconditions:** Standard preconditions. Corridor: JM → US (or confirmed stable corridor).

**Steps:**
1. Launch the Outbound flow and reach the quote screen.
2. Select destination country and allow the corridor to be established.
3. Enter a valid send amount in the send amount field.
4. Leave the receive amount field empty.
5. Tap **Get a quote**.

**Expected:** The receive amount is calculated and displayed. The quote review screen shows send amount, receive amount, exchange rate, fees, and quote timer.

---

### TC-002 [V3]: Enter valid receive amount — send amount is calculated and quote is displayed [PASS]

**Preconditions:** Standard preconditions.

**Steps:**
1. Launch the Outbound flow and reach the quote screen.
2. Select destination country and allow the corridor to be established.
3. Enter a valid receive amount in the receive amount field.
4. Leave the send amount field empty.
5. Tap **Get a quote**.

**Expected:** The send amount is calculated from the exchange rate and displayed. The quote review screen shows both amounts consistently with the displayed exchange rate.

---

### TC-003 [V3]: Non-transactable receive amount (too low) — inline error shown adjacent to receive field [PASS]

**Preconditions:** Standard preconditions. Identify the corridor's minimum transactable receive amount before running.

**Steps:**
1. Launch the Outbound flow and reach the quote screen.
2. Select destination country.
3. Enter a receive amount below the corridor minimum (e.g. a trivially small amount for the destination currency).
4. Tap **Get a quote**.

**Expected:** The app makes the quote request to WU. An inline error message appears adjacent to the receive amount field. The user cannot proceed to the quote review screen. Error message is user-friendly — no internal error codes or raw WU response strings visible.

---

### TC-004 [V3]: Non-transactable receive amount (too high) — inline error shown adjacent to receive field [PASS]

**Preconditions:** Standard preconditions. Identify the corridor's maximum transactable receive amount before running.

**Steps:**
1. Launch the Outbound flow and reach the quote screen.
2. Select destination country.
3. Enter a receive amount above the corridor maximum.
4. Tap **Get a quote**.

**Expected:** Inline error appears adjacent to the receive amount field. Cannot proceed. Error is user-friendly.

---

### TC-005 [V3]: Non-transactable send amount — inline error shown adjacent to send field [PASS]

**Preconditions:** Standard preconditions.

**Steps:**
1. Launch the Outbound flow and reach the quote screen.
2. Select destination country.
3. Enter a send amount that is non-transactable for the corridor (too low or too high).
4. Tap **Get a quote**.

**Expected:** Inline error appears adjacent to the send amount field (not the receive field). Pattern matches TC-003/TC-004. User cannot proceed.

---

### TC-006 [V3]: Switch between send and receive input mid-entry — no stale values [PASS]

**Preconditions:** Standard preconditions.

**Steps:**
1. Launch the Outbound flow and reach the quote screen.
2. Select destination country.
3. Enter a send amount. Note the value.
4. Clear the send amount and switch to entering a receive amount.
5. Enter a receive amount. Note the value.
6. Tap **Get a quote**.

**Expected:** Only the receive amount is used for the quote request. No stale send amount value is sent. The returned quote is consistent with the receive amount entered.

---

### TC-007 [V3]: Both amounts shown on quote review screen are consistent with exchange rate [PASS]

**Preconditions:** Standard preconditions.

**Steps:**
1. Complete a quote flow entering a receive amount.
2. Reach the quote review screen.
3. Note the send amount, receive amount, and exchange rate shown.

**Expected:** Send amount × exchange rate = receive amount (within rounding tolerance). No discrepancy between the amounts and the displayed rate.

---

### TC-008 [V3]: Existing fee and limit rules are applied consistently for receive-amount-initiated quote [PASS]

**Preconditions:** Standard preconditions.

**Steps:**
1. Complete a quote using a receive amount input.
2. On the quote review screen, note the convenience fee, WU fee, tax, and estimated total.
3. Compare to a quote initiated from the same corridor using send amount input for the equivalent value.

**Expected:** Fees and limits are identical regardless of which direction the amount was entered. No fees are skipped or doubled because of the input direction switch.

---

### TC-009 [V3]: Rounding — receive amount that produces a fractional send amount [PASS]

**Preconditions:** Standard preconditions. JM corridor (JMD has no fractional cents).

**Steps:**
1. Enter a receive amount that, when converted at the displayed exchange rate, produces a send amount with more decimal places than JMD supports.
2. Tap **Get a quote**.

**Expected:** The displayed send amount is rounded (direction TBD — verify with dev). The rounded amount is clearly shown to the user before they proceed to the quote review screen. The user is not surprised by the final amount.

---

### TC-010 [V3]: Intra-corridor (same country send and receive) — dual currency input is not available [PASS]

**Preconditions:** Standard preconditions. Account in a market that supports intra-corridor remittance (e.g. GY → GY). Confirm this corridor is enabled and stable in the test environment.

**Steps:**
1. Launch the Outbound flow.
2. Select a destination country that matches the sender's market (e.g. GY user selects GY as destination).
3. Observe the quote screen.

**Expected:** The dual currency input (send amount / receive amount toggle or dual fields) is not presented. Only a single amount input is shown, since both sides are in the same currency and no conversion is required.

---

## Section 2 — Dynamic recipient details screen (AC4, AC5)

### TC-011 [V3]: Corridor requiring no additional fields — only First Name and Last Name shown [PASS]

**Preconditions:** Standard preconditions. Identify a corridor whose field template requires no additional fields beyond name (confirm with dev/WU config).

**Steps:**
1. Complete the quote flow for the identified corridor.
2. Proceed past PEP/3rd-party checks to the recipient details screen.
3. Observe which fields are displayed.

**Expected:** Only First Name and Last Name are shown. Address Line 1, Address Line 2, Postal Code, Middle Name do not appear. Latin American Name Format toggle is visible. Continue button is disabled until both name fields are filled.

---

### TC-012 [V3]: Corridor requiring all additional fields — all address fields shown

**Preconditions:** Standard preconditions. Identify a corridor whose field template requires Address Line 1, Address Line 2, and Postal Code (e.g. JM → US corridor confirmed by WU config).

**Steps:**
1. Complete the quote flow for the identified corridor.
2. Proceed to the recipient details screen.
3. Observe which fields are displayed.

**Expected:** First Name, Last Name, Address Line 1, Address Line 2, Postal Code all appear and are required. Continue button remains disabled until all required fields are filled.

---

### TC-013 [V3]: Required field left empty — Continue button remains disabled

**Preconditions:** Standard preconditions. Corridor with at least two required fields.

**Steps:**
1. Reach the recipient details screen.
2. Fill all required fields except one.
3. Attempt to tap Continue.

**Expected:** Continue button remains disabled. No navigation to the next screen. No error toast required — the disabled button state is sufficient.

---

### TC-014 [V3]: Latin American Name Format toggle OFF — international name fields shown [PASS]

**Preconditions:** Standard preconditions.

**Steps:**
1. Reach the recipient details screen.
2. Verify the Latin American Name Format toggle is in the OFF state.
3. Observe the name fields shown.

**Expected:** First Name, Last Name, and Middle Name (if required by the corridor's field template) are shown. Given Name, Maternal Name, and Paternal Name do not appear.

---

### TC-015 [V3]: Latin American Name Format toggle ON — Latin American name fields replace international fields [PASS]

**Preconditions:** Standard preconditions. Corridor that supports Latin American Name Format.

**Steps:**
1. Reach the recipient details screen.
2. Toggle Latin American Name Format ON.
3. Observe the name fields shown.

**Expected:** Given Name, Maternal Name, and Paternal Name are shown. First Name, Last Name, and Middle Name are no longer visible. The field sets are mutually exclusive — both sets do not appear simultaneously.

---

### TC-016 [V3]: Toggle Latin American Name Format after partially filling fields — international name data is not carried over

**Preconditions:** Standard preconditions.

**Steps:**
1. Reach the recipient details screen.
2. Fill First Name and Last Name with test values.
3. Toggle Latin American Name Format ON.
4. Observe whether First Name / Last Name values appear in Given Name / Maternal Name / Paternal Name fields.
5. Toggle OFF again.
6. Observe whether the originally entered First Name and Last Name values are restored or cleared.

**Expected:** Switching the toggle replaces the field set entirely. Data entered in international fields (First Name, Last Name) does not carry over to Latin American fields or vice versa. User must re-enter name data after toggling. No orphaned or hidden values are submitted with the form.

**Note:** This test case applies to a fresh transaction only (not from saved payee). When initiating a transaction from a saved payee, the Latin American Name Format toggle is locked to the position stored at save time — this is intended behaviour, not a bug. Do not raise the locked toggle as a defect in the saved payee flow.

---

### TC-017 [V3]: Same destination country from JM vs KY account — recipient details fields may differ

**Preconditions:** One JM account and one KY account, both KYC Tier 2.

**Steps:**
1. On the JM account, initiate Outbound and select a destination country (e.g. US). Note the quote screen fields — country, state, city should appear for both. Proceed to the recipient details screen and note all fields shown.
2. On the KY account, initiate Outbound and select the same destination country. Proceed to the recipient details screen and note all fields shown.

**Expected:** Quote screen is identical for both accounts (country, state, city always required). Recipient details screen fields may differ because the corridor (and therefore field template) differs between JM and KY tenants. Document any differences observed — this is expected behaviour, not a bug.

---

### TC-018 [V3]: Payout method selection changes required recipient fields [PASS]

**Preconditions:** Standard preconditions. Corridor that supports multiple payout methods (e.g. Money in Minutes and Direct to Bank).

**Steps:**
1. Complete the quote for a corridor with multiple payout methods.
2. Select Money in Minutes as the payout method.
3. Proceed to the recipient details screen. Note the fields.
4. Go back and change the payout method to Direct to Bank.
5. Proceed to the recipient details screen. Note the fields.

**Expected:** The fields shown on the recipient details screen differ between payout methods, as determined by the field template. Direct to Bank shows bank-specific fields; Money in Minutes does not.

---

## Section 3 — Save recipient toggle (AC3)

### TC-019 [V3]: Save recipient toggle defaults to ON

**Preconditions:** Standard preconditions. First use of the Outbound flow (or after most recent payee was deleted to ensure toggle state is not persisted from last session).

**Steps:**
1. Initiate the Outbound flow.
2. Navigate to the recipient details screen.
3. Observe the state of the "Securely save for future use" toggle without touching it.

**Expected:** Toggle is ON by default. The user must actively turn it off to skip saving.

---

### TC-020 [V3]: Successful transaction with toggle ON — payee is saved

**Preconditions:** Standard preconditions. Toggle ON. Fewer than 5 saved payees on the account.

**Steps:**
1. Complete a full successful Outbound transaction with the save toggle ON.
2. After transaction completes, navigate to the Saved Payee widget on the transaction page.

**Expected:** The recipient appears as a new saved payee in the widget. Payee data matches what was entered in the recipient details screen.

---

### TC-021 [V3]: Successful transaction with toggle OFF — payee is not saved

**Preconditions:** Standard preconditions. Toggle deliberately turned OFF.

**Steps:**
1. Complete a full successful Outbound transaction with the save toggle OFF.
2. Navigate to the Saved Payee widget.

**Expected:** No new payee is added to the widget. Payee count is unchanged from before the transaction.

---

### TC-022 [V3]: Failed transaction with toggle ON — payee is not saved [FAILED]

**Preconditions:** Standard preconditions. Toggle ON. A known method to cause a post-payment processing failure (or a pre-payment failure that can be reproduced).

**Steps:**
1. Initiate an Outbound transaction with the save toggle ON.
2. Cause the transaction to fail (pre-payment failure preferred to avoid funds being taken).
3. Navigate to the Saved Payee widget.

**Expected:** No new payee is added. The save is not attempted because the transaction did not complete successfully.

---

### TC-023 [V3]: Save attempted but payee limit already reached (5 payees)

**Preconditions:** Account with exactly 5 saved payees. Toggle ON.

**Steps:**
1. Complete a successful Outbound transaction with the save toggle ON.
2. Navigate to the Saved Payee widget.
3. Observe the widget message.

**Expected:** The 6th payee is not saved. The widget displays a message indicating the limit has been reached. The transaction itself succeeds regardless of save failure.

---

### TC-024 [V3]: Duplicate payee — same recipient saved twice

**Preconditions:** Account with at least one existing saved payee. Toggle ON. Initiate a new transaction to the same recipient details.

**Steps:**
1. Complete a second successful transaction to the same recipient with the toggle ON.
2. Navigate to the Saved Payee widget.

**Expected:** Two entries appear for the same recipient (deduplication is not implemented — verify this is expected). Both entries consume limit slots. Document observed behaviour.

---

## Section 4 — Outcome notifications (AC7)

All notification cases: notifications are email-only. Remittance does not use push or in-app notifications.

### TC-025 [V3]: Transaction success + payee save success — single success email covering both outcomes

**Preconditions:** Standard preconditions. Toggle ON. Fewer than 5 saved payees.

**Steps:**
1. Complete a successful Outbound transaction with the toggle ON and verify payee is saved (check widget).
2. Check the email inbox.

**Expected:** One email is received confirming both the transaction success (includes MTCN) and that the recipient was saved for future use. Wording is unambiguous — the user knows both operations succeeded.

---

### TC-026 [V3]: Transaction success + payee save failure — success email plus save failure warning

**Preconditions:** Standard preconditions. Toggle ON. Method to cause the save to fail while the transaction succeeds (may require dev assistance or limit scenario).

**Steps:**
1. Complete a successful Outbound transaction where the payee save fails (e.g. limit reached, or simulated save failure).
2. Check the email inbox.

**Expected:** Two distinct pieces of communication: the transaction success notification (with MTCN) and a clear warning that the payee was not saved. The user understands their transfer went through but they'll need to re-enter recipient details next time. No confusion between the two outcomes.

---

### TC-027 [V3]: Transaction failure — failure email only, no save payee notification

**Preconditions:** Standard preconditions. Toggle ON. A transaction that will fail (pre-payment failure preferred).

**Steps:**
1. Initiate an Outbound transaction that fails.
2. Check the email inbox.

**Expected:** A single failure notification email is received. No payee save notification is included — the save was not attempted. Email content is user-friendly; does not expose processing stage names or internal error codes.

---

### TC-028: Transaction success within 2 minutes — MTCN in-app and in success email

**Preconditions:** Standard preconditions.

**Steps:**
1. Complete a successful Outbound transaction.
2. Observe the in-app result immediately after payment auth.
3. Check the email inbox.

**Expected:** MTCN is displayed in-app (processing completed within the 2-minute polling window). A success email is received separately containing the MTCN.

---

## Section 5 — V2 regression: unchanged steps still apply

### TC-029: Third-party check — answering "Yes" boots user from flow 
[PASS]

**Preconditions:** Standard preconditions.

**Steps:**
1. Reach the third-party transaction check screen.
2. Select "Yes" (conducting on behalf of another person).

**Expected:** User is booted from the flow with an error message. No outbound transaction is initiated. The PEP screen is not reached.

---

### TC-030: PEP check — answering "Yes" boots user from flow 
[PASS]

**Preconditions:** Standard preconditions.

**Steps:**
1. Reach the PEP check screen.
2. Select "Yes."

**Expected:** User is booted from the flow with an error message. No outbound transaction is initiated.

---

### TC-031: Quote timer expires mid-flow — error screen shown and user invited to start over

**Preconditions:** Standard preconditions.

**Steps:**
1. Reach the quote review screen.
2. Wait for the 10:00 timer to reach 0:00 without tapping anything.

**Expected:** An error screen is shown informing the user that the quote has expired. The user is invited to start the flow over. The user cannot proceed with the expired quote — there is no path to submit a stale quote to WU.

---

### TC-032: Ineligible user — KYC below Tier 2 cannot access Outbound

**Preconditions:** Account with KYC below Tier 2.

**Steps:**
1. Attempt to access the Outbound flow.

**Expected:** Feature is not accessible. User sees an appropriate message or the entry point is not visible.

---

### TC-033: Ineligible user — expired ID blocks access

**Preconditions:** KYC Tier 2 account with an expired ID.

**Steps:**
1. Attempt to access the Outbound flow.

**Expected:** Feature is blocked at eligibility check. User sees a message indicating they need to update their ID.

---

## Gaps / Reminders

- **Receive-amount mode: currency symbol correctness** — when switching the quote screen to enter the amount in the receiver's currency, verify that the currency symbol displayed matches the destination country's currency. Check both the input field and the calculated send-amount display.

---

## Context applied

- **Primary:** `wu-outbound/domain-knowledge.md` — v3 flow changes (dual currency input §, dynamic recipient details §, saved payee integration §, outcome notifications §); v2 flow (all unchanged steps); processing stages table; amount validation behaviour.
- **Primary:** `wu-outbound/edge-cases.md` — extreme receive amount (TC-003/004), rounding edge case (TC-009), Latin American Name Format toggle (TC-014/015), duplicate payee (TC-023), quote timer (TC-031 — confirmed behaviour updated 2026-04-28), same destination/different tenant (TC-017).
- **Primary:** `wu-outbound/test-patterns.md` — dual currency angle table, recipient details table, save payee notification table, standard preconditions.
- **Primary:** `wu-outbound/integration-points.md` — feature flags (Firebase + Cosmos), WU field template dependency, email service.
- **Related:** `saved-payee/domain-knowledge.md` — toggle defaults ON, save only on success, 5-payee limit, payout method filtering, notification outcomes (TC-019 through TC-026). Relied on directly for Section 3 and 4.
- **Related:** `saved-payee/edge-cases.md` — limit reached (TC-022), duplicate payee (TC-023), toggle defaults ON + limit interaction.
- **Story:** US-31121 acceptance criteria (AC1–AC7) — used to scope what is in vs out for this story.
- **Global files:** all empty — no global context applied.
- **Marked content leaned on:** `[UNCERTAIN]` on duplicate payee deduplication (TC-024 — flagged inline). Latin American Name Format fields confirmed 2026-04-28 — marker resolved. Quote timer expiry behaviour confirmed 2026-04-28 — marker resolved.
