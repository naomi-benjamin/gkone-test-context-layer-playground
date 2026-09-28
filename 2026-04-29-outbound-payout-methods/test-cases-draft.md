# Test Cases — Outbound Payout Methods: MIM, D2B, D2W

Generated: 2026-04-29. Related to WU Outbound v3 testing.

---

## Preconditions (apply to all cases unless stated otherwise)

- Test account: KYC Tier 2, non-expired ID, JM market.
- Corridor confirmed stable in test environment (WU config verified).
- Corridor under test must support the payout method being tested — confirm availability per corridor with dev/WU config before running.
- Access to email inbox associated with the account.

---

## Section 1 — Money in Minutes (MIM / Cash Pickup)

### TC-PM-001: MIM selected — no additional details screen shown

**Preconditions:** Standard preconditions. Corridor that supports Money in Minutes.

**Steps:**
1. Complete the quote screen, selecting Money in Minutes as the payout method.
2. Proceed through PEP/3rd-party checks.
3. Observe whether an additional details screen appears before the recipient details screen.

**Expected:** No additional details screen is shown. The flow proceeds directly to the recipient details screen. No bank or wallet fields are requested for MIM.

---

### TC-PM-002: MIM — quote review shows ~10 minute estimated arrival

**Preconditions:** Standard preconditions. MIM selected.

**Steps:**
1. Select Money in Minutes and complete through to the quote review screen.
2. Observe the estimated arrival time displayed.

**Expected:** Estimated arrival is approximately 10 minutes (or equivalent "Money in Minutes" label). No next-day or bank processing window is shown.

---

### TC-PM-003: MIM — saved payee stores Cash payout method

**Preconditions:** Standard preconditions. MIM selected. Save toggle ON. Fewer than 5 saved payees.

**Steps:**
1. Complete a successful MIM outbound transaction with the save toggle ON.
2. Navigate to the Saved Payee widget.
3. Observe how the saved payee is categorised.

**Expected:** Payee appears under "Outbound - Cash" category in the widget. The stored payout method is Cash/MIM, not D2B or D2W.

---

### TC-PM-004: MIM saved payee reused — only Cash payout method shown

**Preconditions:** An existing saved payee created via a MIM transaction.

**Steps:**
1. Navigate to the Saved Payee widget and select the MIM-created payee.
2. Observe which payout methods are available for this payee.

**Expected:** Only Cash/MIM is shown as a selectable payout method. D2B and D2W are not offered because they were not previously used for this payee.

---

## Section 2 — Direct to Bank (D2B)

### TC-PM-005: D2B selected — additional bank details screen appears

**Preconditions:** Standard preconditions. Corridor that supports Direct to Bank.

**Steps:**
1. Complete the quote screen, selecting Direct to Bank as the payout method.
2. Proceed through PEP/3rd-party checks to the recipient details screen.
3. Proceed past recipient details to the additional details screen.
4. Observe which bank fields are shown.

**Expected:** An additional screen appears requesting bank-specific fields (fields are corridor/field-template-driven — document exact fields observed). All required fields must be filled before continuing.

---

### TC-PM-006: D2B — required bank fields enforced

**Preconditions:** Standard preconditions. D2B selected. Additional bank details screen reached.

**Steps:**
1. Reach the D2B additional details screen.
2. Leave one required bank field empty.
3. Attempt to proceed.

**Expected:** Continue button remains disabled until all required bank fields are completed. No navigation to the next screen.

---

### TC-PM-007: D2B — invalid bank field value rejected

**Preconditions:** Standard preconditions. D2B selected.

**Steps:**
1. Reach the D2B additional details screen.
2. Enter an invalid value in a bank field (e.g. non-numeric account number where numeric is required, or too many/few digits).
3. Attempt to proceed.

**Expected:** Validation error shown adjacent to the invalid field. User cannot proceed until corrected. Error message is user-friendly — no internal codes exposed. [NOTE: exact field-level validation rules are field-template-driven — document observed behaviour per corridor.]

---

### TC-PM-008: D2B — bank details are included in the transaction confirmation

**Preconditions:** Standard preconditions. D2B selected.

**Steps:**
1. Complete a successful D2B outbound transaction.
2. Observe the transaction confirmation screen and the success email.

**Expected:** The bank details (or a summary of them, e.g. masked account number) are shown in the transaction confirmation so the sender can verify the correct account was used.

---

### TC-PM-009: D2B — saved payee stores bank details and D2B payout method

**Preconditions:** Standard preconditions. D2B selected. Save toggle ON. Fewer than 5 saved payees.

**Steps:**
1. Complete a successful D2B outbound transaction with the save toggle ON.
2. Navigate to the Saved Payee widget.
3. Select the saved payee and observe what is stored.

**Expected:** Payee appears under "Outbound - D2B" category. Bank details (account number, bank name, etc.) are stored with the payee.

---

### TC-PM-010: D2B saved payee reused — bank details pre-filled, only D2B payout method offered

**Preconditions:** An existing saved payee created via a D2B transaction.

**Steps:**
1. Select the D2B saved payee from the widget.
2. Proceed to the additional bank details screen.
3. Observe whether bank details are pre-filled.
4. Observe which payout methods are available for this payee.

**Expected:** Bank details are pre-filled from the saved payee. Only D2B is offered as a payout method — Cash/MIM and D2W are not shown because they were not previously used for this payee.

---

## Section 3 — Direct to Wallet (D2W)

### TC-PM-011: D2W selected — additional wallet details screen appears

**Preconditions:** Standard preconditions. Corridor that supports Direct to Wallet.

**Steps:**
1. Complete the quote screen, selecting Direct to Wallet as the payout method.
2. Proceed through PEP/3rd-party checks and recipient details.
3. Observe the additional details screen.

**Expected:** An additional screen appears requesting wallet-specific fields (fields are corridor/field-template-driven — document exact fields observed). All required fields must be filled before continuing.

---

### TC-PM-012: D2W — required wallet fields enforced

**Preconditions:** Standard preconditions. D2W selected. Additional wallet details screen reached.

**Steps:**
1. Reach the D2W additional details screen.
2. Leave one required wallet field empty.
3. Attempt to proceed.

**Expected:** Continue button remains disabled until all required wallet fields are completed.

---

### TC-PM-013: D2W — invalid wallet field value rejected

**Preconditions:** Standard preconditions. D2W selected.

**Steps:**
1. Reach the D2W additional details screen.
2. Enter an invalid value in a wallet field.
3. Attempt to proceed.

**Expected:** Validation error shown adjacent to the invalid field. Error is user-friendly — no internal codes exposed. [NOTE: exact validation rules are field-template-driven — document observed behaviour per corridor.]

---

### TC-PM-014: D2W — saved payee stores wallet details and D2W payout method

**Preconditions:** Standard preconditions. D2W selected. Save toggle ON. Fewer than 5 saved payees.

**Steps:**
1. Complete a successful D2W outbound transaction with the save toggle ON.
2. Navigate to the Saved Payee widget.
3. Observe the saved payee category and stored details.

**Expected:** Payee appears under "Outbound - D2W (Deposit to Wallet)" category. Wallet details are stored with the payee.

---

### TC-PM-015: D2W saved payee reused — wallet details pre-filled, only D2W payout method offered

**Preconditions:** An existing saved payee created via a D2W transaction.

**Steps:**
1. Select the D2W saved payee from the widget.
2. Proceed to the additional wallet details screen.
3. Observe whether wallet details are pre-filled and which payout methods are available.

**Expected:** Wallet details are pre-filled. Only D2W is offered as a payout method for this payee.

---

## Section 4 — Cross-payout-method cases

### TC-PM-016: Payout method not available for corridor — not shown on quote screen

**Preconditions:** Identify a corridor where one of the three payout methods (MIM, D2B, or D2W) is not supported per the WU field template. Confirm with dev/WU config.

**Steps:**
1. Initiate the Outbound flow for the identified corridor.
2. Reach the payout method selection on the quote screen.
3. Observe which methods are available.

**Expected:** Only the payout methods supported by that corridor's field template are shown. Unsupported methods do not appear — they are not greyed out or disabled, they are absent entirely.

---

### TC-PM-017: Switch payout method after initial selection — additional screen updates accordingly

**Preconditions:** Standard preconditions. Corridor supporting at least two payout methods (e.g. MIM and D2B).

**Steps:**
1. On the quote screen, select D2B as the payout method.
2. Go back and change the payout method to MIM.
3. Proceed through the flow.

**Expected:** The additional bank details screen does not appear (since MIM was selected). No residual D2B data from the first selection is submitted with the transaction.

---

### TC-PM-018: Saved payee used across two payout methods — both shown on reuse

**Preconditions:** A saved payee that has been used successfully with both MIM and D2B on separate transactions.

**Steps:**
1. Select the payee from the Saved Payee widget.
2. Observe which payout methods are offered.

**Expected:** Both MIM (Cash) and D2B are shown as selectable payout methods, since both have been used successfully for this payee. [UNCERTAIN: confirm whether multiple prior payout methods are surfaced or only the most recent — see saved-payee domain knowledge.]

---

## Gaps / Reminders

- **Saved payee: nickname edit when no payee was saved** — must test the scenario where the user did not choose to save the payee during the transaction. Verify that the nickname edit option is either not accessible or correctly guarded — the edit flow should not be reachable for a payee that was never saved.

---

## Context applied

- **Primary:** `wu-outbound/domain-knowledge.md` — payout methods table (MIM/Next Day/D2W/D2B), additional screen per method, field-template-driven fields.
- **Primary:** `wu-outbound/test-patterns.md` — payout method test angles table.
- **Related:** `saved-payee/domain-knowledge.md` — payout method filtering on saved payee (only previously used methods shown), widget categories (Outbound - Cash, Outbound - D2B), what data is stored per payee. Used directly for TC-PM-003/004/009/010/014/015/018.
- **Marked content leaned on:** `[UNCERTAIN]` on whether multiple prior payout methods are surfaced for a saved payee (TC-PM-018 — flagged inline). Specific bank/wallet field names are field-template-driven and not documented — flagged inline on TC-PM-005/007/011/013.
