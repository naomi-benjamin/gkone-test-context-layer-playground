# Saved Payee — Test Cases Draft
**Investigation folder:** `2026-05-05-saved-payee-v2-v3`
**Generated:** 2026-05-05
**Scope:** Saved Payee feature evaluated against WU Outbound V2 (all fields required) and V3 (fields per field template)

> Note: The Test Case Generator skill was not available in this session. Test cases follow the "Verify that..." title convention and ADO step/expected-result structure based on known conventions. Review structure against the skill's output format before uploading to ADO.

---

## Key V2 vs V3 Distinction

| | V2 | V3 |
|---|---|---|
| Recipient details form | Static — all fields fixed and required | Dynamic — fields driven by WU field template for the corridor |
| Required fields at save time | First Name, Last Name, Country, State, City, Payment Method (+ bank/wallet if applicable) | Determined by the field template for that corridor |
| Address Line 1/2, Postal Code | Present on form; required status: [UNCERTAIN for V2 — treat as capturing all visible fields] | Dynamic — shown and required only if the field template specifies |
| Middle Name | [UNCERTAIN whether present in V2 flow] | Dynamic — shown only if field template specifies |
| Save toggle | Not present in V2 (save payee is V3-introduced) | Appears on recipient details screen; defaults ON |
| Latin American Name Format | Not present in V2 | Toggle present; switches between international and Latin American name field sets |

> Note: Based on the feature docs, the "Securely save for future use" toggle and Saved Payee integration were introduced in V3. If V2 has a separate save mechanism, these V2 test cases should be revised once that mechanism is confirmed.

---

---

# Part 1 — Outbound V2: Saved Payee Test Cases

*For V2: all recipient detail fields are required and static. There is no field-template-driven dynamic rendering.*

---

## SP-V2-01 — Save Flow: Happy Path (Cash Pickup)

**Title:** Verify that completing a successful V2 outbound transaction saves the payee with all required fields when the save toggle is ON

**Priority:** 1

**Preconditions:**
- KYC Tier 1 account with non-expired ID (JM or KY market)
- Account has fewer than 5 saved payees
- Save payee toggle is ON (default)
- Access to test account email inbox
- A known-working corridor in the test environment

**Steps:**
1. Launch the WU Outbound V2 flow
2. Complete the quote screen: select destination country, state, city, enter a valid send amount, select Cash Pickup as the payout method
3. Review the quote and proceed
4. Pass the third-party check (answer No)
5. Pass the PEP check (answer No)
6. Enter all recipient fields: First Name, Last Name (ensure the save toggle is ON)
7. Complete all remaining steps (relationship, purpose of transaction, source of funds if required)
8. Authorise payment via the Payment Widget
9. After the transaction completes successfully, navigate to the Saved Payee widget on the transaction page

**Expected Result:**
- Transaction completes successfully with MTCN shown in-app (or delivered by email if processing exceeds 2 minutes)
- The new payee appears in the Saved Payee widget under the **Outbound - Cash** category
- All required fields are present in the stored record: First Name, Last Name, Destination Country, State, City, Payment Method (Cash Pickup)
- A combined success + payee saved email notification is received

---

## SP-V2-02 — Save Flow: Happy Path (Direct to Bank)

**Title:** Verify that a V2 outbound transaction with Direct to Bank saves the payee including bank details

**Priority:** 1

**Preconditions:**
- KYC Tier 1 account, fewer than 5 saved payees
- Corridor that supports Direct to Bank (confirm in test environment)
- Access to email inbox

**Steps:**
1. Launch the WU Outbound V2 flow
2. On the quote screen, select a destination country/state/city and choose **Direct to Bank** as the payout method
3. Complete the additional bank details screen (fields per field template for this corridor)
4. Proceed through all remaining steps and authorise payment
5. After successful completion, open the Saved Payee widget

**Expected Result:**
- Payee appears in the widget under **Outbound - D2B**
- Stored record includes First Name, Last Name, Country, State, City, payout method, and all bank detail fields entered
- Success + payee saved email received

---

## SP-V2-03 — Save Flow: Toggle OFF

**Title:** Verify that completing a successful V2 outbound transaction with the save toggle OFF does not create a saved payee

**Priority:** 1

**Preconditions:**
- KYC Tier 1 account
- Existing payee count below 5 (to confirm absence is intentional, not due to limit)

**Steps:**
1. Launch the WU Outbound V2 flow
2. On the recipient details screen, locate the save toggle and set it to **OFF**
3. Complete all remaining steps and authorise payment
4. After successful transaction, open the Saved Payee widget

**Expected Result:**
- Transaction completes successfully
- No new payee entry is created in the widget
- Standard transaction success email received (no payee saved confirmation)

---

## SP-V2-04 — Save Flow: Failed Transaction Does Not Save

**Title:** Verify that a failed V2 outbound transaction does not save the payee regardless of toggle state

**Priority:** 1

**Preconditions:**
- KYC Tier 1 account
- Save toggle ON
- Ability to cause a transaction failure in the test environment (e.g. trigger a processing stage failure)
- Note payee count before the test

**Steps:**
1. Launch the WU Outbound V2 flow with the save toggle ON
2. Complete all steps through payment authorisation
3. Ensure the transaction fails (confirm failure in-app and/or via failure email)
4. Open the Saved Payee widget

**Expected Result:**
- Transaction shows as failed in-app and/or via failure email
- No new payee entry in the widget (count unchanged from before the test)
- Only a transaction failure notification is received — no payee saved or payee save failure message

---

## SP-V2-05 — Reuse: Saved Payee Pre-fills All Required V2 Fields

**Title:** Verify that selecting a saved payee in the V2 flow pre-fills all required recipient fields

**Priority:** 1

**Preconditions:**
- At least 1 saved payee exists (with all required fields: First Name, Last Name, Country, State, City, Payment Method)
- V2 outbound flow accessible

**Steps:**
1. Navigate to the Saved Payee widget on the transaction page
2. Select an existing saved payee (Cash Pickup type)
3. Observe the recipient details screen

**Expected Result:**
- First Name, Last Name, Destination Country, State, City are all pre-filled with the stored values
- The payout method is pre-selected as Cash Pickup (the method used to save this payee)
- The Continue/Next button is enabled without the user needing to re-enter any required field
- No required field is left blank

---

## SP-V2-06 — Reuse: D2B Saved Payee Pre-fills Bank Details

**Title:** Verify that selecting a Direct to Bank saved payee in the V2 flow pre-fills all bank detail fields

**Priority:** 1

**Preconditions:**
- A saved payee exists that was created via Direct to Bank (includes stored bank details)

**Steps:**
1. Navigate to the Saved Payee widget and select the D2B saved payee
2. Observe the recipient details screen and the bank details screen

**Expected Result:**
- All recipient fields are pre-filled (First Name, Last Name, Country, State, City)
- Payout method pre-selected as Direct to Bank
- Bank detail fields are pre-filled with the stored values
- Continue button enabled without requiring re-entry of bank fields

---

## SP-V2-07 — Reuse: Payout Method Filtering — Cash Only

**Title:** Verify that only Cash Pickup is selectable when a saved payee was created via Cash Pickup in the V2 flow

**Priority:** 2

**Preconditions:**
- Saved payee exists that was created exclusively via Cash Pickup

**Steps:**
1. Select the Cash Pickup saved payee from the widget
2. On the recipient details or payout method screen, observe which payout methods are available

**Expected Result:**
- Only Cash Pickup is shown as a selectable payout method
- Direct to Bank and Direct to Wallet are not shown or are greyed out / absent
- User cannot switch to a different payout method via the saved payee path

---

## SP-V2-08 — Reuse: Payout Method Filtering — D2B Only

**Title:** Verify that only Direct to Bank is selectable when a saved payee was created via Direct to Bank in the V2 flow

**Priority:** 2

**Preconditions:**
- Saved payee exists that was created exclusively via Direct to Bank

**Steps:**
1. Select the D2B saved payee from the widget
2. Observe the payout method options

**Expected Result:**
- Only Direct to Bank is selectable
- Cash Pickup and Direct to Wallet are not offered

---

## SP-V2-09 — Widget: Correct Category Labels

**Title:** Verify that saved payees created in the V2 flow appear under the correct category in the Saved Payee widget

**Priority:** 2

**Preconditions:**
- At least one Cash Pickup saved payee and one D2B saved payee exist

**Steps:**
1. Open the Saved Payee widget
2. Locate both payees and note which category heading they appear under

**Expected Result:**
- Cash Pickup payee appears under **Outbound - Cash**
- D2B payee appears under **Outbound - D2B**
- No payees appear under incorrect categories (e.g. P2P or Bill Payment)

---

## SP-V2-10 — Notification: Success + Payee Saved

**Title:** Verify that a V2 successful transaction with a successful payee save sends the combined success + payee saved email

**Priority:** 2

**Preconditions:**
- KYC Tier 1 account, fewer than 5 saved payees, save toggle ON
- Access to email inbox

**Steps:**
1. Complete a V2 outbound transaction successfully with the save toggle ON
2. Check the email inbox

**Expected Result:**
- One email received that covers both: transaction success (with MTCN) AND confirmation that the payee was saved
- Email is user-friendly; no internal error codes or system references
- No separate payee-failed warning email

---

## SP-V2-11 — Notification: Success + Payee Save Failed

**Title:** Verify that when the V2 transaction succeeds but payee save fails, the user receives a success email with a payee save failure warning

**Priority:** 2

**Preconditions:**
- Ability to simulate a save payee failure after a successful transaction (may require test environment tooling)
- Access to email inbox

**Steps:**
1. Complete a V2 outbound transaction with the save toggle ON
2. Trigger or simulate a save payee failure (back-end side)
3. Check the email inbox

**Expected Result:**
- Transaction success email received (with MTCN)
- A separate or combined warning email received indicating the payee was NOT saved
- No new payee entry in the Saved Payee widget
- Email content does not expose internal error codes

---

## SP-V2-12 — Notification: Failed Transaction (No Payee Save)

**Title:** Verify that a failed V2 transaction sends only a transaction failure email with no payee save messaging

**Priority:** 2

**Preconditions:**
- Ability to trigger a transaction failure
- Access to email inbox

**Steps:**
1. Initiate V2 outbound transaction with save toggle ON
2. Cause the transaction to fail
3. Check the email inbox

**Expected Result:**
- One failure email received covering only the transaction failure
- No payee saved confirmation email
- No payee save failure warning email
- Email does not expose internal stage names (e.g. `WESTERN_UNION_API_CALL_TO_CONFIRM_OUTBOUND_REMITTANCE`) or raw error codes

---

## SP-V2-13 — Save Toggle Defaults to ON

**Title:** Verify that the save toggle defaults to ON at the start of each new V2 outbound transaction

**Priority:** 2

**Preconditions:**
- KYC Tier 1 account

**Steps:**
1. Begin a new V2 outbound transaction from scratch
2. Navigate to the recipient details screen
3. Observe the state of the save toggle without touching it

**Expected Result:**
- Toggle is ON (enabled) by default without any user action
- User must actively turn it OFF to skip saving

---

## SP-V2-14 — Payee Limit: 5th Payee Saves Successfully

**Title:** Verify that saving a 5th payee succeeds when the account already has 4 saved payees

**Priority:** 2

**Preconditions:**
- Account has exactly 4 saved payees

**Steps:**
1. Complete a V2 outbound transaction with save toggle ON
2. After successful completion, open the Saved Payee widget

**Expected Result:**
- 5th payee is saved and appears in the widget
- No limit message shown
- Total count is now 5

---

## SP-V2-15 — Payee Limit: 6th Save Attempt Blocked

**Title:** Verify that attempting to save a 6th payee when the 5-payee limit is reached surfaces the limit-reached message in the widget

**Priority:** 2

**Preconditions:**
- Account has exactly 5 saved payees (the limit)
- Save toggle ON

**Steps:**
1. Complete a V2 outbound transaction with save toggle ON
2. After successful completion, open the Saved Payee widget

**Expected Result:**
- Widget displays a message indicating no more payees can be saved (limit reached)
- The 6th payee is NOT added to the widget
- The transaction itself succeeds normally
- [Confirm whether the toggle is hidden, disabled, or still visible but ineffective at the limit]

---

## SP-V2-16 — Payee Limit: Delete and Re-save

**Title:** Verify that deleting a saved payee when at the limit allows a new payee to be saved on the next transaction

**Priority:** 2

**Preconditions:**
- Account has exactly 5 saved payees

**Steps:**
1. Delete one payee from the Saved Payee widget
2. Verify the count is now 4
3. Complete a V2 outbound transaction with save toggle ON
4. Open the widget after successful completion

**Expected Result:**
- New payee saves successfully
- Widget count returns to 5
- No limit-reached message

---

## SP-V2-17 — Duplicate Payee: Same Recipient Saved Twice

**Title:** Verify that the same recipient can be saved twice and creates two separate widget entries with no deduplication

**Priority:** 3

**Preconditions:**
- Account has fewer than 4 saved payees (to allow two saves)

**Steps:**
1. Complete a V2 outbound transaction to Recipient A with save toggle ON
2. Complete a second V2 outbound transaction to the same Recipient A with save toggle ON (different or identical nickname)
3. Open the Saved Payee widget

**Expected Result:**
- Two separate entries exist for Recipient A in the widget
- Both consume limit slots (count now includes both entries)
- No deduplication warning or merge is performed

---

## SP-V2-18 — Management: Edit Nickname

**Title:** Verify that the saved payee nickname can be edited and the widget reflects the updated name

**Priority:** 3

**Preconditions:**
- At least 1 saved payee exists with a nickname

**Steps:**
1. Open the Saved Payee widget and select a payee's management options
2. Tap to edit the nickname
3. Clear the existing nickname and enter a new one
4. Save the change
5. Return to the widget

**Expected Result:**
- Nickname field is editable
- Updated nickname is displayed in the widget
- All other fields (First Name, Last Name, Country, etc.) remain unchanged and are not editable

---

## SP-V2-19 — Management: Only Nickname Is Editable

**Title:** Verify that no fields other than the nickname can be edited for a saved payee

**Priority:** 3

**Preconditions:**
- At least 1 saved payee exists

**Steps:**
1. Open the Saved Payee widget and access the management screen for a saved payee
2. Attempt to modify First Name, Last Name, Country, State, City, or bank details

**Expected Result:**
- No field other than nickname is editable
- Recipient detail fields are displayed as read-only
- There is no Save / Update button for non-nickname fields

---

## SP-V2-20 — Management: Delete Payee

**Title:** Verify that deleting a saved payee removes it from the widget and frees the limit slot

**Priority:** 2

**Preconditions:**
- At least 1 saved payee exists (note the count before deletion)

**Steps:**
1. Open the Saved Payee widget and select the delete option for one payee
2. Confirm the deletion
3. Observe the widget

**Expected Result:**
- Payee is removed from the widget immediately after confirmation
- Payee count decrements by 1
- Deleted payee is no longer accessible or selectable

---

## SP-V2-21 — PII: No Leakage in Logs After Save

**Title:** Verify that saved payee PII fields (name, address, bank details) do not appear in debug logs or analytics after a V2 save payee operation

**Priority:** 3

**Preconditions:**
- Debug logging accessible in the test environment

**Steps:**
1. Complete a V2 outbound transaction with save toggle ON
2. After the save payee operation, check device debug logs and any accessible analytics events

**Expected Result:**
- First Name, Last Name, address fields, and bank/wallet detail fields are not present in plaintext in any log or analytics event
- If these fields appear, they are masked or tokenised

---

---

# Part 2 — Outbound V3: Saved Payee Test Cases

*For V3: recipient detail fields are dynamic, driven by the WU field template for the corridor. Which fields are required varies per corridor. The save toggle appears on the V3 recipient details screen.*

---

## SP-V3-01 — Save Flow: Happy Path — Corridor With Minimal Fields

**Title:** Verify that completing a successful V3 outbound transaction in a corridor that requires only name fields saves the payee with those fields and the payout method

**Priority:** 1

**Preconditions:**
- KYC Tier 1 account, fewer than 5 saved payees
- A corridor where the field template requires only First Name and Last Name (no address, no postal code)
- Save toggle ON (default)
- Access to email inbox

**Steps:**
1. Launch the V3 outbound flow
2. On the quote screen, select a country/state/city for a corridor confirmed to have minimal field template requirements
3. On the recipient details screen, confirm only name fields are shown (no address or postal code)
4. Confirm the "Securely save for future use" toggle is ON
5. Enter First Name and Last Name; tap Continue
6. Complete all remaining steps and authorise payment
7. After successful transaction, open the Saved Payee widget

**Expected Result:**
- Payee appears in the widget under the correct category (Outbound - Cash or D2B depending on payout method)
- Stored fields match exactly what was captured: First Name, Last Name, Country, State, City, Payment Method
- Address fields are NOT stored (they were not part of the field template for this corridor)
- Combined success + payee saved email received

---

## SP-V3-02 — Save Flow: Happy Path — Corridor With Address Fields Required

**Title:** Verify that completing a successful V3 outbound transaction in a corridor that requires address fields saves the payee including all address fields

**Priority:** 1

**Preconditions:**
- KYC Tier 1 account, fewer than 5 saved payees
- A corridor where the field template requires Address Line 1 and/or Postal Code
- Save toggle ON

**Steps:**
1. Launch the V3 outbound flow and select a corridor confirmed to require address fields
2. On the recipient details screen, confirm Address Line 1 and/or Postal Code fields are shown
3. Ensure save toggle is ON
4. Enter all required fields including address data; tap Continue
5. Complete remaining steps and authorise payment
6. After successful transaction, open the Saved Payee widget and select the new payee to inspect stored data

**Expected Result:**
- Payee is saved with all fields captured: First Name, Last Name, Country, State, City, Payment Method, Address Line 1 (and/or Postal Code as required by the template)
- Stored address data matches what was entered
- Success + payee saved email received

---

## SP-V3-03 — Save Flow: Toggle OFF — No Save

**Title:** Verify that completing a successful V3 outbound transaction with the save toggle OFF does not create a saved payee

**Priority:** 1

**Preconditions:**
- KYC Tier 1 account, fewer than 5 saved payees (to confirm absence is intentional)

**Steps:**
1. Launch the V3 outbound flow
2. On the recipient details screen, locate the "Securely save for future use" toggle and set it to **OFF**
3. Complete the transaction successfully
4. Open the Saved Payee widget

**Expected Result:**
- No new payee entry in the widget
- Standard success email received with MTCN, but no payee saved confirmation
- No payee save failure warning

---

## SP-V3-04 — Save Flow: Failed Transaction Does Not Save

**Title:** Verify that a failed V3 outbound transaction does not save the payee regardless of toggle state

**Priority:** 1

**Preconditions:**
- KYC Tier 1 account, save toggle ON
- Ability to trigger a transaction failure
- Note payee count before test

**Steps:**
1. Begin a V3 outbound transaction with save toggle ON
2. Complete through payment authorisation
3. Cause or wait for the transaction to fail
4. Open the Saved Payee widget

**Expected Result:**
- Widget count unchanged from before the test
- No new payee entry created
- Only a failure notification email received

---

## SP-V3-05 — Save Toggle: Defaults to ON on V3 Recipient Details Screen

**Title:** Verify that the "Securely save for future use" toggle defaults to ON on the V3 recipient details screen for each new transaction

**Priority:** 2

**Preconditions:**
- KYC Tier 1 account
- V3 outbound flow accessible

**Steps:**
1. Begin a new V3 outbound flow
2. Navigate to the recipient details screen (after selecting country/state/city on the quote screen)
3. Observe the toggle state before touching it

**Expected Result:**
- Toggle is ON by default
- No user action required to enable saving — the user must actively turn it OFF to skip

---

## SP-V3-06 — Reuse: Saved Payee Pre-fills Fields Per Current Corridor Template

**Title:** Verify that selecting a saved payee in the V3 flow pre-fills only the fields required by the current corridor's field template

**Priority:** 1

**Preconditions:**
- A saved payee exists that was created in a corridor requiring minimal fields (name only)
- Reuse in the same corridor (same field template applies)

**Steps:**
1. Navigate to the Saved Payee widget and select the minimal-field saved payee
2. Observe the recipient details screen

**Expected Result:**
- First Name and Last Name are pre-filled
- No address or postal code fields are shown (not required by this corridor's template)
- Continue button is enabled without requiring additional input
- Payout method is pre-selected per the stored value

---

## SP-V3-07 — Reuse: Address Pre-fills When Corridor Requires It

**Title:** Verify that selecting a saved payee in a V3 corridor that requires address pre-fills the address from the stored record

**Priority:** 1

**Preconditions:**
- A saved payee exists that was created in a corridor that required Address Line 1 (so address is in stored data)
- Reuse in a corridor that also requires Address Line 1

**Steps:**
1. Select a saved payee (with stored address data) from the widget
2. Observe the recipient details screen for the address-requiring corridor

**Expected Result:**
- Address Line 1 is pre-filled with the stored address value
- All other stored fields (First Name, Last Name, etc.) are also pre-filled
- Continue button enabled immediately if all required fields are satisfied by the pre-fill

---

## SP-V3-08 — Reuse: Address Field Not Shown When Corridor Doesn't Require It

**Title:** Verify that selecting a saved payee (which has stored address data) in a corridor that does NOT require address does not display the address field

**Priority:** 2

**Preconditions:**
- A saved payee exists that was created with address data (corridor that required address)
- The target corridor for reuse does NOT require address fields

**Steps:**
1. Select the saved payee (with stored address) from the widget
2. Choose or navigate to a corridor whose field template does not include address fields
3. Observe the recipient details screen

**Expected Result:**
- Address field is NOT shown on the recipient details screen
- The stored address data is not surfaced but remains in the record
- Only field-template-required fields are shown and pre-filled

---

## SP-V3-09 — Reuse: Cross-Corridor Mismatch — Missing Required Field Blocks Continue

**Title:** Verify that selecting a saved payee in a corridor that requires address, when the payee was saved without address data, leaves the address field empty and blocks the Continue button

**Priority:** 1

**Preconditions:**
- A saved payee exists that was created in a corridor that did NOT require address (no address stored)
- The current corridor for reuse DOES require Address Line 1

**Steps:**
1. Select the saved payee (no stored address) from the widget
2. Navigate to the recipient details screen for the address-requiring corridor

**Expected Result:**
- First Name and Last Name are pre-filled from the stored data
- Address Line 1 field is shown (required by template) but is EMPTY
- Continue button remains disabled until the user enters the address
- No error or crash — the empty required field is handled gracefully

---

## SP-V3-10 — Reuse: D2B Saved Payee Pre-fills Bank Details in V3

**Title:** Verify that selecting a D2B saved payee in V3 pre-fills bank detail fields on the recipient details screen

**Priority:** 1

**Preconditions:**
- A saved payee exists with stored bank details (created via Direct to Bank)
- Reuse in a corridor that supports D2B

**Steps:**
1. Select the D2B saved payee from the widget
2. Observe the recipient details screen and the bank details area

**Expected Result:**
- Recipient fields (First Name, Last Name, Country, State, City) are pre-filled
- Payout method pre-selected as Direct to Bank
- Bank detail fields are pre-filled with the stored values
- Continue enabled if all required template fields are satisfied

---

## SP-V3-11 — Reuse: International Name Format Saves and Re-fills Correctly

**Title:** Verify that a V3 saved payee created with international name fields (Latin American toggle OFF) correctly pre-fills First Name, Last Name, and Middle Name (if applicable) on reuse

**Priority:** 2

**Preconditions:**
- A saved payee exists created with Latin American toggle OFF (international mode): First Name, Last Name, and Middle Name (if the corridor required it)

**Steps:**
1. Select the international-mode saved payee from the widget
2. On the recipient details screen, ensure the Latin American Name Format toggle is OFF
3. Observe which name fields are pre-filled

**Expected Result:**
- First Name pre-filled with stored value
- Last Name pre-filled with stored value
- Middle Name pre-filled if it was stored (corridor required it); absent if not
- No Latin American name fields (Given Name, Maternal Name, Paternal Name) are shown or populated

---

## SP-V3-12 — Reuse: Latin American Name Format Saves and Re-fills Correctly

**Title:** Verify that a V3 saved payee created with Latin American name fields correctly pre-fills Given Name, Maternal Name, and Paternal Name on reuse when the Latin American toggle is ON

**Priority:** 2

**Preconditions:**
- A saved payee exists created with Latin American toggle ON: Given Name, Maternal Name, Paternal Name stored
- Access to a corridor that allows Latin American name format

**Steps:**
1. Select the Latin American mode saved payee from the widget
2. On the recipient details screen, toggle ON the Latin American Name Format toggle
3. Observe which name fields are pre-filled

**Expected Result:**
- Given Name, Maternal Name, Paternal Name are pre-filled with stored values
- International name fields (First Name, Last Name, Middle Name) are replaced / not shown while toggle is ON
- Toggle state is correct when the saved payee is loaded

---

## SP-V3-13 — Reuse: Latin American Payee Loaded With Toggle OFF — Name Fields Empty

**Title:** Verify that selecting a saved payee created in Latin American name format and loading it with the Latin American toggle OFF results in empty international name fields (no data bleed)

**Priority:** 2

**Preconditions:**
- A saved payee exists created with Latin American toggle ON (Given/Maternal/Paternal names stored)

**Steps:**
1. Select the Latin American saved payee from the widget
2. Ensure the Latin American Name Format toggle is OFF on the recipient details screen
3. Observe the international name fields (First Name, Last Name)

**Expected Result:**
- First Name and Last Name fields are shown (toggle is OFF = international mode)
- First Name and Last Name are NOT pre-populated with the Latin American name values
- No bleed of Given Name / Maternal Name / Paternal Name data into the international name fields
- Continue button is disabled (required fields empty) — user must enter international name fields

---

## SP-V3-14 — Payout Method Filtering: Cash Only

**Title:** Verify that only Cash Pickup is selectable when a V3 saved payee was created via Cash Pickup

**Priority:** 2

**Preconditions:**
- A saved payee exists created via Cash Pickup in V3

**Steps:**
1. Select the Cash Pickup saved payee from the widget
2. Observe which payout methods are available on the recipient details screen

**Expected Result:**
- Only Cash Pickup is shown / selectable
- D2B and Direct to Wallet are not offered via this saved payee path

---

## SP-V3-15 — Payout Method Filtering: D2B Only

**Title:** Verify that only Direct to Bank is selectable when a V3 saved payee was created via Direct to Bank

**Priority:** 2

**Preconditions:**
- A saved payee exists created via D2B in V3

**Steps:**
1. Select the D2B saved payee from the widget
2. Observe which payout methods are available

**Expected Result:**
- Only Direct to Bank is selectable
- Cash Pickup and Direct to Wallet are not offered

---

## SP-V3-16 — Notification: Success + Payee Saved (V3)

**Title:** Verify that a V3 successful transaction with a successful payee save sends the combined success + payee saved email

**Priority:** 2

**Preconditions:**
- KYC Tier 1 account, fewer than 5 saved payees, save toggle ON
- Access to email inbox

**Steps:**
1. Complete a V3 outbound transaction successfully with the save toggle ON
2. Check the email inbox

**Expected Result:**
- Email covers both transaction success (with MTCN) and payee saved confirmation
- User-friendly language; no internal error codes or system references
- No separate payee save failure warning

---

## SP-V3-17 — Notification: Success + Payee Save Failed (V3)

**Title:** Verify that when the V3 transaction succeeds but payee save fails, the user receives a transaction success email with a payee save failure warning

**Priority:** 2

**Preconditions:**
- Ability to simulate a save payee failure after a successful transaction
- Access to email inbox

**Steps:**
1. Complete a V3 outbound transaction with save toggle ON
2. Trigger or simulate a save payee back-end failure
3. Check the email inbox and the Saved Payee widget

**Expected Result:**
- Transaction success email received with MTCN
- Warning email (or combined email with warning section) indicating payee was NOT saved
- No new payee entry in the widget
- Warning message does not expose internal error codes

---

## SP-V3-18 — Notification: Failed Transaction (V3)

**Title:** Verify that a failed V3 transaction sends only a transaction failure email and no payee save messaging

**Priority:** 2

**Preconditions:**
- Ability to trigger a transaction failure in V3 flow
- Access to email inbox

**Steps:**
1. Initiate a V3 outbound transaction with save toggle ON
2. Cause the transaction to fail
3. Check email inbox and widget

**Expected Result:**
- One failure email received
- No payee saved email, no payee save failure warning
- Email content is user-friendly; does not expose internal stage names

---

## SP-V3-19 — Payee Limit: 5-Payee Limit Applies in V3

**Title:** Verify that the 5-payee limit applies to V3 savings and the limit-reached message appears in the widget on the 6th attempt

**Priority:** 2

**Preconditions:**
- Account has exactly 5 saved payees (could be a mix of V2 and V3)
- Save toggle ON

**Steps:**
1. Complete a V3 outbound transaction with save toggle ON
2. After successful completion, open the Saved Payee widget

**Expected Result:**
- Widget displays a limit-reached message
- No 6th payee entry created
- Transaction succeeds normally
- [Confirm whether the toggle is hidden, disabled, or still visible but ineffective at the limit]

---

## SP-V3-20 — Corridor: Minimal Fields — No Address Stored or Shown

**Title:** Verify that in a V3 corridor with no additional fields required, only name and payout method are saved, and a subsequent transaction using this payee completes without address input

**Priority:** 2

**Preconditions:**
- A corridor whose field template requires only name fields (no address, no postal code) is available in the test environment

**Steps:**
1. Complete a V3 transaction in the minimal-field corridor; save toggle ON
2. Confirm the widget entry exists
3. Select the saved payee for a new transaction in the same corridor
4. On the recipient details screen, observe field state and attempt to proceed

**Expected Result:**
- Saved payee only contains First Name, Last Name, Country, State, City, Payment Method
- On reuse: only First Name and Last Name fields shown (no address); both are pre-filled
- Continue button is enabled immediately — no missing required fields

---

## SP-V3-21 — Corridor: Postal Code Dynamic Field — Stored and Pre-filled

**Title:** Verify that Postal Code is stored in a V3 saved payee when the corridor requires it, and correctly pre-fills on reuse in the same corridor

**Priority:** 2

**Preconditions:**
- A corridor whose field template requires Postal Code is available in the test environment

**Steps:**
1. Complete a V3 transaction in the postal-code-required corridor; enter a valid postal code; save toggle ON
2. After successful transaction, select the saved payee for a new transaction in the same corridor
3. Observe the Postal Code field on the recipient details screen

**Expected Result:**
- Postal Code is pre-filled with the stored value
- Field format is correct (e.g. 5-digit for US corridor)
- Continue button enabled if all other required fields are also satisfied

---

## SP-V3-22 — Middle Name: Stored When Required by Template, Pre-fills Correctly

**Title:** Verify that Middle Name is stored when required by the V3 corridor's field template and pre-fills correctly on reuse in the same corridor

**Priority:** 3

**Preconditions:**
- A corridor whose field template requires or includes Middle Name is available in the test environment

**Steps:**
1. Complete a V3 transaction in a corridor that shows Middle Name; enter a value; save toggle ON
2. Select the saved payee for reuse in the same corridor
3. Observe the Middle Name field

**Expected Result:**
- Middle Name is pre-filled with the stored value
- If the corridor template makes Middle Name optional, the pre-fill still populates it
- Middle Name does NOT appear when selecting this payee in a corridor whose template does not include Middle Name

---

## SP-V3-23 — Management: Edit Nickname (V3 Payee)

**Title:** Verify that the nickname of a V3 saved payee can be edited and the updated value is reflected in the widget

**Priority:** 3

**Preconditions:**
- At least 1 V3-created saved payee with a nickname exists

**Steps:**
1. Open the Saved Payee widget and access management options for the V3 payee
2. Edit the nickname to a new value
3. Save the change and return to the widget

**Expected Result:**
- Updated nickname is shown in the widget
- All other stored fields are unchanged

---

## SP-V3-24 — Management: Delete Payee (V3)

**Title:** Verify that deleting a V3 saved payee removes it from the widget and frees the limit slot

**Priority:** 2

**Preconditions:**
- At least 1 V3-created saved payee exists

**Steps:**
1. Open the Saved Payee widget and delete the V3 payee
2. Confirm deletion
3. Observe the widget count

**Expected Result:**
- Payee removed from widget
- Count decrements
- Slot freed (a new save on the next transaction should succeed if previously at the limit)

---

## SP-V3-25 — PII: No Leakage in Logs After V3 Save

**Title:** Verify that saved payee PII fields (name, address, bank details) do not appear in debug logs or analytics after a V3 save payee operation

**Priority:** 3

**Preconditions:**
- Debug logging accessible in the test environment

**Steps:**
1. Complete a V3 outbound transaction in a corridor that captures address fields, with save toggle ON
2. After the save, check device debug logs and any accessible analytics events for PII

**Expected Result:**
- First Name, Last Name, address fields, bank/wallet fields are not present in plaintext in logs or analytics
- If these fields appear at all, they are masked or tokenised

---

---

# Edge Cases — Shared / Both Versions

These scenarios are not version-specific but should be tested in whichever version surfaces them first.

---

## SP-EC-01 — Save Fails Silently — Email Is the Only Recovery Signal

**Title:** Verify that when a payee save fails after a successful transaction, the failure is communicated by email only and the widget accurately reflects the failed state

**Priority:** 2

**Preconditions:**
- Ability to simulate a save payee failure
- Access to email inbox

**Steps:**
1. Complete an outbound transaction with save toggle ON
2. Trigger/simulate a save payee back-end failure
3. Check the email inbox
4. Check the Saved Payee widget

**Expected Result:**
- Warning email received about the save failure
- Widget shows NO new payee entry
- No in-app error or notification is shown (remittance is email-only)
- No retry path is exposed to the user in-app

---

## SP-EC-02 — Payout Method Unavailable for Saved Payee Corridor

**Title:** Verify that selecting a saved payee whose stored payout method is no longer available for the corridor is handled gracefully

**Priority:** 3

**Preconditions:**
- A saved payee exists that was created with a payout method that is now excluded or removed for that corridor
- [Note: requires corridor configuration change in test environment — may only be testable via targeted setup]

**Steps:**
1. Select the saved payee from the widget
2. Observe the payout method state on the recipient details screen

**Expected Result:**
- App does not crash or hang
- User receives a clear message that the stored payout method is unavailable
- [Confirm whether the user is presented with alternative payout methods or must exit and start fresh]

---

## SP-EC-03 — Widget Empty State

**Title:** Verify the widget behavior when the account has no saved payees

**Priority:** 3

**Preconditions:**
- Account has zero saved payees (either never saved, or all deleted)

**Steps:**
1. Open the Saved Payee widget with no payees saved

**Expected Result:**
- [Confirm whether: widget is hidden entirely OR displays an empty state message]
- No crash or unexpected UI state

---

## SP-EC-04 — Save Toggle Default — User Inadvertently Reaches 5-Payee Limit

**Title:** Verify that when a user completes 5 transactions without disabling the default-ON save toggle, the limit-reached message is shown on the 6th transaction

**Priority:** 3

**Preconditions:**
- Account starting from 0 saved payees

**Steps:**
1. Complete 5 separate outbound transactions without ever disabling the save toggle (leaving it at its ON default each time)
2. Initiate a 6th outbound transaction with toggle ON
3. After the transaction succeeds, observe the widget

**Expected Result:**
- After transaction 5: all 5 payees are saved, no limit message
- After transaction 6: limit-reached message appears in the widget; 6th payee is not saved
- The 6th transaction itself succeeds normally

---

---

# Context Applied

**Primary sources:**
- `squads/remittance/features/saved-payee/overview.md` — feature scope, entry points, status (V3 only)
- `squads/remittance/features/saved-payee/domain-knowledge.md` — all business rules, field list, payout method filtering, notification matrix, 5-payee limit, management rules
- `squads/remittance/features/saved-payee/edge-cases.md` — limit-reached edge case, duplicate payee, silent save failure, toggle default, PII leakage
- `squads/remittance/features/saved-payee/integration-points.md` — WU Outbound as sole entry point; Cosmos as assumed storage
- `squads/remittance/features/saved-payee/known-issues.md` — no entries (feature in development)
- `squads/remittance/features/saved-payee/test-patterns.md` — notification matrix, widget angles, payout method filter angles, limit angles, management angles
- `squads/remittance/features/wu-outbound/domain-knowledge.md` — V2 static flow (all fields required), V3 dynamic recipient details screen (field template-driven), Latin American Name Format toggle, saved payee integration in V3 (US2), notification outcomes
- `squads/remittance/features/wu-outbound/edge-cases.md` — Latin American toggle field replacement, field template unavailability, cross-corridor mismatch
- `squads/remittance/features/wu-outbound/test-patterns.md` — V3 recipient details angles, notification test angles
- `squads/remittance/squad.md` — squad scope, PO (Jon Williams)
- `CONVENTIONS.md` — marker rules, test case format conventions

**Marked content leaned on:**
- `[UNCERTAIN]` in `saved-payee/domain-knowledge.md`: multi-payout-method payee behavior (whether all methods shown or only most recent) — SP-V2-07/08 and SP-V3-14/15 take a conservative approach and test single-method payees only; the multi-method case is not covered and should be added once this is resolved
- `[UNCERTAIN]` in `saved-payee/domain-knowledge.md`: nickname validation rules — SP-V2-18 and SP-V3-23 do not specify valid/invalid nickname inputs; steps should be expanded once validation rules are confirmed
- `[UNCERTAIN]` on whether the toggle is hidden, disabled, or visible-but-ineffective at the 5-payee limit — SP-V2-15 and SP-V3-19 include a reminder to confirm this behavior
- `[UNCERTAIN]` on widget empty state — SP-EC-03 notes the behavior to confirm
- `[UNCERTAIN]` on whether V2 has the save toggle at all — the domain docs treat saved payee as a V3 feature; if V2 has a different save mechanism, the V2 test cases may need restructuring

**Skill note:** The Test Case Generator skill was not available in this session. Test cases are structured using known ADO conventions (step/expected-result format, "Verify that..." titles, priority 1–4). Review structure against the skill's output format before uploading to ADO.
