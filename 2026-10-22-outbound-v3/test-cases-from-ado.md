# Outbound V3 (imported from ADO)

**Source:** ADO test plan "Remittances" (#7642), suite "Outbound V3" (#32405). Imported 2026-10-22. [Open in ADO](https://dev.azure.com/GKDigital/GKOne/_testPlans/define?planId=7642&suiteId=32405)

**Origin:** written in ADO, not generated from the test-context repo. See `notes.md` for cases that didn't convert cleanly.

---

## Test cases

TEST CASE 1
Title: Verify that a KYC Tier 0 user cannot access the outbound flow

ADO: [#34051](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34051) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 0 account

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Navigate to the outbound flow entry point | Feature is not accessible; no path into the flow |

---

TEST CASE 2
Title: Verify that a KYC Tier 1 user with an expired ID cannot access the outbound flow

ADO: [#34052](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34052) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, expired ID

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Navigate to the outbound flow entry point | Feature is blocked at the eligibility check; expired ID is surfaced as the reason |

---

TEST CASE 3
Title: Verify that a user in a non-live market cannot access the outbound flow

ADO: [#34053](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34053) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - Account in a non-live market (not JM or KY)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Navigate to the outbound flow entry point | Feature is not accessible for this market |

---

TEST CASE 4
Title: Verify that entering a valid send amount returns a quote with the receive amount calculated

ADO: [#34054](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34054) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Launch the outbound flow |  |
| 3. | Select destination country, state, city, and payout method |  |
| 4. | Enter a valid send amount |  |
| 5. | Tap Get Quote | Quote displayed; receive amount shown alongside send amount; exchange rate, fees, and 10-minute countdown present |

---

TEST CASE 5
Title: Verify that entering a valid receive amount returns a quote with the send amount calculated

ADO: [#34055](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34055) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Launch the outbound flow |  |
| 3. | Select destination country, state, city, and payout method |  |
| 4. | Switch to the receive amount input and enter a valid receive amount |  |
| 5. | Tap Get Quote | Quote displayed; send amount calculated from the entered receive amount; review screen expresses quote in sender currency with receive amount shown alongside |

---

TEST CASE 6
Title: Verify that switching between send and receive input immediately clears the other field

ADO: [#34056](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34056) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Launch the outbound flow |  |
| 3. | Select destination country, state, city, and payout method |  |
| 4. | Enter a send amount |  |
| 5. | Switch focus to the receive amount field | Send amount field is immediately cleared |
| 6. | Enter a receive amount; switch back to the send amount field | Receive amount field is immediately cleared |

---

TEST CASE 7
Title: Verify that a send amount below the corridor minimum shows an inline error

ADO: [#34057](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34057) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - Confirm current JM/KY minimum send limits before running (JM: 1,000 JMD; KY: 5 KYD — configurable)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Launch the outbound flow |  |
| 3. | Select destination country, state, city, and payout method |  |
| 4. | Enter a send amount below the corridor minimum |  |
| 5. | Tap Get Quote | Quote request made; inline error displayed adjacent to the send amount field; user cannot proceed |
| 6. | Verify the error message is user-friendly | No internal error codes or raw WU response strings visible |

---

TEST CASE 8
Title: Verify that a send amount above the corridor maximum shows an inline error

ADO: [#34058](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34058) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - Confirm current JM/KY maximum send limits before running (JM: 150,000 JMD; KY: 830 KYD — configurable)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Launch the outbound flow |  |
| 3. | Select destination country, state, city, and payout method |  |
| 4. | Enter a send amount above the corridor maximum |  |
| 5. | Tap Get Quote | Inline error adjacent to send field; user cannot proceed; error message is user-friendly |

---

TEST CASE 9
Title: Verify that a receive amount below the corridor minimum shows an inline error on the receive field

ADO: [#34059](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34059) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - Receive-side minimum for the target corridor confirmed with dev/WU config

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Launch the outbound flow |  |
| 3. | Select destination country, state, city, and payout method |  |
| 4. | Switch to receive amount input; enter an amount below the corridor receive minimum |  |
| 5. | Tap Get Quote | Inline error adjacent to the receive amount field (not the send field); user cannot proceed; error message is user-friendly |

---

TEST CASE 10
Title: Verify that a receive amount above the corridor maximum shows an inline error on the receive field

ADO: [#34060](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34060) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - Receive-side maximum for the target corridor confirmed with dev/WU config

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Launch the outbound flow |  |
| 3. | Select destination country, state, city, and payout method |  |
| 4. | Switch to receive amount input; enter an amount above the corridor receive maximum |  |
| 5. | Tap Get Quote | Inline error adjacent to receive field; user cannot proceed; error is user-friendly |

---

TEST CASE 11
Title: Verify that an intra-corridor selection disables receive amount input

ADO: [#34061](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34061) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - A destination country that creates an intra-corridor match with the sender's market

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Launch the outbound flow |  |
| 3. | Select a destination country that matches the sender's market (intra-corridor) |  |
| 4. | Observe the amount input area | Only send amount input is available; receive amount input is not shown or is disabled; no dual currency toggle presented |

---

TEST CASE 12
Title: Verify that country selection establishes the corridor and the field template is reflected on the recipient details screen

ADO: [#34062](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34062) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Launch the outbound flow |  |
| 3. | Select a destination country; complete state, city, payout method, and a valid amount; tap Get Quote |  |
| 4. | Observe the receipient details screen | Fields on the recipient details screen match the WU field template for the selected corridor and payout method |

---

TEST CASE 13
Title: Verify that the quote request screen always shows country, state, and city regardless of corridor

ADO: [#34063](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34063) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Launch the outbound flow |  |
| 3. | Select several different destination countries in turn | Country, state, and city fields are always present and required; no fields appear or disappear on the quote request screen based on corridor selection |

---

TEST CASE 14
Title: Verify that a payout method excluded by GKOne config is not shown as an option for that corridor

ADO: [#34064](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34064) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - A corridor with a known GKOne excluded destination confirmed with dev (e.g. JM to GY excludes Direct to Wallet; JM to CA excludes Direct to Bank)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Launch the outbound flow |  |
| 3. | Select the destination country with the known exclusion |  |
| 4. | Observe the available payout methods | The excluded payout method is not shown; remaining payout methods are available |

---

TEST CASE 15
Title: Verify that the quote review screen shows a consistent fee breakdown

ADO: [#34065](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34065) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Launch the outbound flow; complete the quote screen with a valid amount; tap Get Quote |  |
| 3. | On the review screen, note convenience fee, WU fee, tax, exchange rate, estimated total, and estimated arrival | All line items present; total is arithmetically consistent with the listed fees; exchange rate and amounts are consistent |

---

TEST CASE 16
Title: Verify that the quote review screen always expresses the quote in sender currency

ADO: [#34066](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34066) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Launch the outbound flow; complete the quote screen using receive amount input; tap Get Quote |  |
| 3. | Review the quote screen | Quote is expressed in sender currency; receive amount shown alongside but is not the primary figure |

---

TEST CASE 17
Title: Verify that the quote timer expiry blocks progression

ADO: [#34067](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34067) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Launch the outbound flow; reach the review quote screen |  |
| 3. | Allow the 10:00 timer to count down to 0:00 | App blocks progression or surfaces an expiry error; user is invited to start a new quote; stale quote cannot be submitted |

---

TEST CASE 18
Title: Verify that answering Yes to the third-party check exits the user from the flow

ADO: [#34068](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34068) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - Quote screen completed and submitted; quote review proceeded past; third-party check screen reached

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Select Yes on the third-party check screen | User exits the flow with an error message; no path to continue |

---

TEST CASE 19
Title: Verify that answering No to the third-party check allows the user to proceed

ADO: [#34069](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34069) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - Third-party check screen reached

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Select No on the third-party check screen | User proceeds to the PEP check |

---

TEST CASE 20
Title: Verify that answering Yes to the PEP check exits the user from the flow

ADO: [#34070](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34070) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - Third-party check answered No; PEP check screen reached

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Select Yes on the PEP check screen | User exits the flow with an error message; no path to continue |

---

TEST CASE 21
Title: Verify that answering No to the PEP check allows the user to proceed

ADO: [#34071](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34071) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - PEP check screen reached

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Select No on the PEP check screen | User proceeds to the recipient details screen |

---

TEST CASE 22
Title: Verify that a corridor requiring no additional fields shows only name fields

ADO: [#34072](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34072) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - A corridor where the field template does not require address or postal code fields

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Complete the quote screen for the target corridor; proceed through checks to the recipient details screen | Only the name fields for the current toggle state are shown; no Address Line 1, Address Line 2, or Postal Code fields present |

---

TEST CASE 23
Title: Verify that a corridor requiring address fields shows them as required

ADO: [#34073](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34073) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - A corridor where the field template requires address fields (e.g. US corridor)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Complete the quote screen for the target corridor; proceed through checks to the recipient details screen | Address Line 1, Address Line 2, and Postal Code are present and marked required |
| 3. | Attempt to tap Continue with address fields empty | Continue button remains disabled |

---

TEST CASE 24
Title: Verify that the Latin American Name Format toggle is always present and defaults to OFF

ADO: [#34074](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34074) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Complete the quote screen for any corridor; proceed through checks to the recipient details screen | Latin American Name Format toggle is visible; default state is OFF (international mode) |

---

TEST CASE 25
Title: Verify that international mode (toggle OFF) shows correct name fields per corridor

ADO: [#34075](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34075) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - Recipient details screen reached; toggle in default (OFF) state

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Complete the quote screen; proceed through checks to the recipient details screen |  |
| 3. | Confirm toggle is OFF | First Name and Last Name shown and required; Middle Name shown only if the field template requires it for this corridor |

---

TEST CASE 26
Title: Verify that Latin American mode (toggle ON) replaces international name fields

ADO: [#34076](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34076) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Complete the quote screen; proceed through checks to the recipient details screen |  |
| 3. | Confirm First Name and Last Name are present (toggle OFF) |  |
| 4. | Switch the toggle ON | First Name and Last Name disappear; Given Name, Maternal Name, and Paternal Name appear; both sets do not appear simultaneously |
| 5. | Switch the toggle back OFF | International name fields reappear; Latin American fields disappear |

---

TEST CASE 27
Title: Verify that switching the toggle clears name fields entered in the replaced set

ADO: [#34077](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34077) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Complete the quote screen; proceed through checks to the recipient details screen |  |
| 3. | With toggle OFF, partially fill First Name and Last Name |  |
| 4. | Switch the toggle ON | International fields replaced; First Name and Last Name values are cleared |
| 5. | Fill Given Name, Maternal Name, Paternal Name; switch back OFF | International fields shown empty; Latin American values are cleared |

---

TEST CASE 28
Title: Verify that address fields are not affected by toggle switches

ADO: [#34078](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34078) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - A corridor requiring address fields

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Complete the quote screen for the target corridor; proceed through checks to the recipient details screen |  |
| 3. | Fill address fields |  |
| 4. | Switch the Latin American Name Format toggle ON, then back OFF | Address Line 1, Address Line 2, and Postal Code values are preserved across both toggle switches |

---

TEST CASE 29
Title: Verify that the Continue button remains disabled until all required fields are filled for the quote

ADO: [#34079](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34079) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - A corridor requiring address fields

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Complete the quote screen for the target corridor; proceed through checks to the recipient details screen |  |
| 3. | Leave at least one required field empty | Continue button is disabled |
| 4. | Fill all required fields for the current toggle state including address fields | Continue button becomes enabled |

---

TEST CASE 30
Title: Verify that a field template fetch failure after country selection is handled gracefully

ADO: [#34080](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34080) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - Ability to simulate WU field template unavailability for a specific corridor in the test environment

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Launch the outbound flow; select a destination country for which the field template will fail | Observe and document — does the app show a specific error or hang? Does it allow the user to retry or go back? Capture exact behaviour. |

---

TEST CASE 31
Title: Verify that relationship and purpose of transaction fields are required

ADO: [#34081](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34081) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - Recipient details completed; transaction metadata screen reached

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Leave relationship and purpose of transaction empty | Cannot proceed; fields are required |
| 2. | Fill both fields and proceed | Flow continues |

---

TEST CASE 32
Title: Verify that source of funds is shown only for corridors that require it

ADO: [#34082](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34082) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - One corridor that requires source of funds; one that does not (confirm with dev/WU field template)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Complete the flow for the corridor that requires source of funds through to the metadata screen | Source of funds field is present and required |
| 3. | Repeat for the corridor that does not require it | Source of funds field is absent |

---

TEST CASE 33
Title: Verify that processing completes within 2 minutes

ADO: [#34083](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34083) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - Cash Pickup (MIM) corridor confirmed stable

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Complete the full outbound flow through payment authorisation |  |
| 3. | Wait up to 2 minutes for processing | MTCN displayed in-app; success email with MTCN received; transaction appears in transaction history with correct status and amount |

---

TEST CASE 34
Title: Verify the FE polling timeout path where processing exceeds 2 minutes

ADO: [#34084](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34084) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - Ability to simulate or trigger a processing delay beyond 2 minutes (confirm test environment method with dev)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Complete the full outbound flow through payment authorisation |  |
| 3. | Allow the frontend polling to reach the 2-minute timeout | Pending screen shown in-app informing user the MTCN will be sent by email; no MTCN shown in-app |
| 4. | Check the email inbox once processing completes | Success email with MTCN received |

---

TEST CASE 35
Title: Verify that a pre-payment processing failure blocks the transaction without charging the user

ADO: [#34085](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34085) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - Ability to trigger a pre-payment stage failure in the test environment (confirm method with dev)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Trigger a failure at a pre-payment stage; proceed through the flow | Transaction fails; user sees an error in-app; no payment is taken; no MTCN generated |

---

TEST CASE 36
Title: Verify that a post-payment processing failure shows an error and triggers the recovery process

ADO: [#34086](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34086) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment - Ability to trigger a post-payment stage failure in the test environment

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Trigger a failure at the WU API confirm stage; proceed through the flow | Error shown in-app; failure email received; no MTCN generated; payment deducted (back-office recovery is out of scope — do not reverse manually) |

---

TEST CASE 37
Title: Verify that success and failure email content is user-friendly with no internal identifiers

ADO: [#34088](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/34088) · Ready

Tags: Outbound V3

Pre Conditions:
The following should be true before proceeding:
• Pre Conditions: The following should be true before proceeding: - KYC Tier 1 account, non-expired ID - JM or KY market - Known stable corridor confirmed working in the test environment

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login |  |
| 2. | Complete a successful outbound transaction; open the success email | Email contains MTCN; no internal stage names, system identifiers, or WU error codes |
| 3. | Trigger a failure; open the failure email | User-friendly failure message; no raw error codes or internal stage names |

---

TEST CASE 38
Title: Verify that the middle name field is optional

ADO: [#38039](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38039) · Ready

Tags: 

Pre Conditions:
The following should be true before proceeding:
• KycStatus = 2
• User must be able to do an outbound transaction (not flagged/blocked)
• User must have a linked payment method
• Name toggle should be off

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the application |  |
| 2. | Navigate to the outbound flow |  |
| 3. | Enter an @amountToSend | Get quote button should still be grayed out as no country has been provided |
| 4. | Select the country that the intended user is in | State/Parish field should now be visible. Get quote button should still be grayed out |
| 5. | Select the state/parish that the intended user is in | City/town field should now be visible. Get quote button should still be grayed out |
| 6. | Select the city/town that the intended user is in |  |
| 7. | Select the payout method |  |
| 8. | Accept the terms and conditions | Get quote button should now be red |
| 9. | Continue to where the sender must provide the receiver's name | The user should see that the middle name field is optional. Continue button should be disabled |
| 10. | Provide the receiver's first name | Continue button should be disabled |
| 11. | Provide the receiver's last name | Continue button should be enabled |

---

TEST CASE 39
Title: Verify that the user is unable to continue without providing the receiver's first and last names

ADO: [#38040](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38040) · Ready

Tags: Automated

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Open the GKOne Application |  |
| 2. | Tap "Login" | User should be directed to the Login Screen |
| 3. | Enter @phoneNumber in the mobile number field | User should see no error under the field |
| 4. | Enter @passcode in the passcode field | User should see no error under the field |
| 5. | Tap "Login" | User should be taken to the home screen |
| 6. | Select the 'Recipient's country' | User should see the country in the field. 'Get a quote' button should be disabled |
| 7. | Enter the amount that you would like to send | User should see the 'They receive' field populate with the conversion based on the exchange rate. 'Get a quote' button should be disabled |
| 8. | Select how the user will receive the funds | User should see the option in the field. 'Get a quote' button should be disabled. |
| 9. | Agree to the Western Union Terms & Conditions | User should see the check box checked. 'Get a quote' button should be enabled. |
| 10. | Tap 'Get quote' | User should be taken to a loading screen and should be able to review their quote once generated |
| 11. | Review Quote | User should see 'Proceed with transfer' button enabled/red |
| 12. | Tap 'Proceed with transfer' | User should see a screen requesting to know if the transaction is a "Third Party" transaction |
| 13. | Indicate that this is not a third party transaction | User should be taken to a screen requesting to know if they are a PEP |
| 14. | Indicate that the user is not a PEP | User should be taken to a screen requesting that they enter the receiver's name. 'Continue' button should be disabled |
| 15. | Tap 'Continue' | Nothing should happen |

---

TEST CASE 40
Title: Verify that the user is unable to enter numbers in the receiver first name

ADO: [#38041](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38041) · Ready

Tags: Automated

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Open the GKOne Application |  |
| 2. | Tap "Login" | User should be directed to the Login Screen |
| 3. | Enter @phoneNumber in the mobile number field | User should see no error under the field |
| 4. | Enter @passcode in the passcode field | User should see no error under the field |
| 5. | Tap "Login" | User should be taken to the home screen |
| 6. | Select the 'Recipient's country' | User should see the country in the field. 'Get a quote' button should be disabled |
| 7. | Enter the amount that you would like to send | User should see the 'They receive' field populate with the conversion based on the exchange rate. 'Get a quote' button should be disabled |
| 8. | Select how the user will receive the funds | User should see the option in the field. 'Get a quote' button should be disabled. |
| 9. | Agree to the Western Union Terms & Conditions | User should see the check box checked. 'Get a quote' button should be enabled. |
| 10. | Tap 'Get quote' | User should be taken to a loading screen and should be able to review their quote once generated |
| 11. | Review Quote | User should see 'Proceed with transfer' button enabled/red |
| 12. | Tap 'Proceed with transfer' | User should see a screen requesting to know if the transaction is a "Third Party" transaction |
| 13. | Indicate that this is not a third party transaction | User should be taken to a screen requesting to know if they are a PEP |
| 14. | Indicate that the user is not a PEP | User should be taken to a screen requesting that they enter the receiver's name. 'Continue' button should be disabled |
| 15. | Enter numbers in the first name field | User should see an error under the field |
| 16. | Enter a @validLastName |  |
| 17. | Tap 'Continue' | User should not be able to continue. User should see an error under the first name field |

---

TEST CASE 41
Title: Verify that the user is unable to enter unwanted special characters in the receiver first name

ADO: [#38042](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38042) · Ready

Tags: Automated

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Open the GKOne Application |  |
| 2. | Tap "Login" | User should be directed to the Login Screen |
| 3. | Enter @phoneNumber in the mobile number field | User should see no error under the field |
| 4. | Enter @passcode in the passcode field | User should see no error under the field |
| 5. | Tap "Login" | User should be taken to the home screen |
| 6. | Select the 'Recipient's country' | User should see the country in the field. 'Get a quote' button should be disabled |
| 7. | Enter the amount that you would like to send | User should see the 'They receive' field populate with the conversion based on the exchange rate. 'Get a quote' button should be disabled |
| 8. | Select how the user will receive the funds | User should see the option in the field. 'Get a quote' button should be disabled. |
| 9. | Agree to the Western Union Terms & Conditions | User should see the check box checked. 'Get a quote' button should be enabled. |
| 10. | Tap 'Get quote' | User should be taken to a loading screen and should be able to review their quote once generated |
| 11. | Review Quote | User should see 'Proceed with transfer' button enabled/red |
| 12. | Tap 'Proceed with transfer' | User should see a screen requesting to know if the transaction is a "Third Party" transaction |
| 13. | Indicate that this is not a third party transaction | User should be taken to a screen requesting to know if they are a PEP |
| 14. | Indicate that the user is not a PEP | User should be taken to a screen requesting that they enter the receiver's name. 'Continue' button should be disabled |
| 15. | Enter a @nameWithBadChars in the first name field | User should see an error under the field |
| 16. | Enter a @validLastName |  |
| 17. | Tap 'Continue' | User should not be able to continue. User should see an error under the first name field |

---

TEST CASE 42
Title: Verify that the user is unable to enter unwanted special characters in the receiver last name

ADO: [#38043](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38043) · Ready

Tags: Automated

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Open the GKOne Application |  |
| 2. | Tap "Login" | User should be directed to the Login Screen |
| 3. | Enter @phoneNumber in the mobile number field | User should see no error under the field |
| 4. | Enter @passcode in the passcode field | User should see no error under the field |
| 5. | Tap "Login" | User should be taken to the home screen |
| 6. | Select the 'Recipient's country' | User should see the country in the field. 'Get a quote' button should be disabled |
| 7. | Enter the amount that you would like to send | User should see the 'They receive' field populate with the conversion based on the exchange rate. 'Get a quote' button should be disabled |
| 8. | Select how the user will receive the funds | User should see the option in the field. 'Get a quote' button should be disabled. |
| 9. | Agree to the Western Union Terms & Conditions | User should see the check box checked. 'Get a quote' button should be enabled. |
| 10. | Tap 'Get quote' | User should be taken to a loading screen and should be able to review their quote once generated |
| 11. | Review Quote | User should see 'Proceed with transfer' button enabled/red |
| 12. | Tap 'Proceed with transfer' | User should see a screen requesting to know if the transaction is a "Third Party" transaction |
| 13. | Indicate that this is not a third party transaction | User should be taken to a screen requesting to know if they are a PEP |
| 14. | Indicate that the user is not a PEP | User should be taken to a screen requesting that they enter the receiver's name. 'Continue' button should be disabled |
| 15. | Enter a @validFirstName |  |
| 16. | Enter an @lNameWithBadChars | User should see an error under the field |
| 17. | Tap 'Continue' | User should not be able to continue. User should see an error under the last name field |

---

TEST CASE 43
Title: Verify that the user is unable to enter numbers in the receiver last name

ADO: [#38044](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38044) · Ready

Tags: Automated

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Open the GKOne Application |  |
| 2. | Tap "Login" | User should be directed to the Login Screen |
| 3. | Enter @phoneNumber in the mobile number field | User should see no error under the field |
| 4. | Enter @passcode in the passcode field | User should see no error under the field |
| 5. | Tap "Login" | User should be taken to the home screen |
| 6. | Select the 'Recipient's country' | User should see the country in the field. 'Get a quote' button should be disabled |
| 7. | Enter the amount that you would like to send | User should see the 'They receive' field populate with the conversion based on the exchange rate. 'Get a quote' button should be disabled |
| 8. | Select how the user will receive the funds | User should see the option in the field. 'Get a quote' button should be disabled. |
| 9. | Agree to the Western Union Terms & Conditions | User should see the check box checked. 'Get a quote' button should be enabled. |
| 10. | Tap 'Get quote' | User should be taken to a loading screen and should be able to review their quote once generated |
| 11. | Review Quote | User should see 'Proceed with transfer' button enabled/red |
| 12. | Tap 'Proceed with transfer' | User should see a screen requesting to know if the transaction is a "Third Party" transaction |
| 13. | Indicate that this is not a third party transaction | User should be taken to a screen requesting to know if they are a PEP |
| 14. | Indicate that the user is not a PEP | User should be taken to a screen requesting that they enter the receiver's name. 'Continue' button should be disabled |
| 15. | Enter a @validFirstName |  |
| 16. | Enter a last name with numbers | User should see an error under the field |
| 17. | Tap 'Continue' | User should not be able to continue. User should see an error under the last name field |

---

TEST CASE 44
Title: Verify that a user is able to continue after providing a valid first and a valid last name

ADO: [#38045](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38045) · Ready

Tags: Automated

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Open the GKOne Application |  |
| 2. | Tap "Login" | User should be directed to the Login Screen |
| 3. | Enter @phoneNumber in the mobile number field | User should see no error under the field |
| 4. | Enter @passcode in the passcode field | User should see no error under the field |
| 5. | Tap "Login" | User should be taken to the home screen |
| 6. | Select the 'Recipient's country' | User should see the country in the field. 'Get a quote' button should be disabled |
| 7. | Enter the amount that you would like to send | User should see the 'They receive' field populate with the conversion based on the exchange rate. 'Get a quote' button should be disabled |
| 8. | Select how the user will receive the funds | User should see the option in the field. 'Get a quote' button should be disabled. |
| 9. | Agree to the Western Union Terms & Conditions | User should see the check box checked. 'Get a quote' button should be enabled. |
| 10. | Tap 'Get quote' | User should be taken to a loading screen and should be able to review their quote once generated |
| 11. | Review Quote | User should see 'Proceed with transfer' button enabled/red |
| 12. | Tap 'Proceed with transfer' | User should see a screen requesting to know if the transaction is a "Third Party" transaction |
| 13. | Indicate that this is not a third party transaction | User should be taken to a screen requesting to know if they are a PEP |
| 14. | Indicate that the user is not a PEP | User should be taken to a screen requesting that they enter the receiver's name. 'Continue' button should be disabled |
| 15. | Enter a @validFirstName |  |
| 16. | Enter an @validLastName |  |
| 17. | Tap 'Continue' | User should be taken to a screen requesting the recipient's phone number |

---

TEST CASE 45
Title: Verify that the maternal name field is optional

ADO: [#38046](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38046) · Ready

Tags: 

Pre Conditions:
The following should be true before proceeding:
• KycStatus = 2
• User must be able to do an outbound transaction (not flagged/blocked)
• User must have a linked payment method

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the application |  |
| 2. | Navigate to the outbound flow |  |
| 3. | Enter an @amountToSend | Get quote button should still be grayed out as no country has been provided |
| 4. | Select the country that the intended user is in | State/Parish field should now be visible. Get quote button should still be grayed out |
| 5. | Select the state/parish that the intended user is in | City/town field should now be visible. Get quote button should still be grayed out |
| 6. | Select the city/town that the intended user is in |  |
| 7. | Select the payout method |  |
| 8. | Accept the terms and conditions | Get quote button should now be red |
| 9. | Continue to where the sender must provide the receiver's name |  |
| 10. | Toggle "Latin-American" name toggle | User should see given name, paternal name and maternal name |
| 11. | Provide receiver's given name | Continue button should be disabled |
| 12. | Provide receiver's paternal name | Continue button should be enabled |

---

TEST CASE 46
Title: Verify that a user is unable to select black listed countries as the "Recipient's country"

ADO: [#38047](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38047) · Ready

Tags: Automated

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Open the GKOne Application |  |
| 2. | Tap "Login" | User should be directed to the Login Screen |
| 3. | Enter @phoneNumber in the mobile number field | User should see no error under the field |
| 4. | Enter @passcode in the passcode field | User should see no error under the field |
| 5. | Tap "Login" | User should be taken to the home screen |
| 6. | Tap the "Send Money" icon on the home screen | User should be taken to the Request a quote screen. 'Get a quote' button should be disabled |
| 7. | Tap 'Select a country' | User should see a draw open with the list of (valid) countries |
| 8. | Tap the search bar |  |
| 9. | Enter any country on the @countryName | The user should not see the country show up as an option |

---

TEST CASE 47
Title: Verify that a user is unable to continue without entering their phone number

ADO: [#38048](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38048) · Ready

Tags: Automated

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Open the GKOne Application |  |
| 2. | Tap "Login" | User should be directed to the Login Screen |
| 3. | Enter @phoneNumber in the mobile number field | User should see no error under the field |
| 4. | Enter @passcode in the passcode field | User should see no error under the field |
| 5. | Tap "Login" | User should be taken to the home screen |
| 6. | Select the 'Recipient's country' | User should see the country in the field. 'Get a quote' button should be disabled |
| 7. | Enter the amount that you would like to send | User should see the 'They receive' field populate with the conversion based on the exchange rate. 'Get a quote' button should be disabled |
| 8. | Select how the user will receive the funds | User should see the option in the field. 'Get a quote' button should be disabled. |
| 9. | Agree to the Western Union Terms & Conditions | User should see the check box checked. 'Get a quote' button should be enabled. |
| 10. | Tap 'Get quote' | User should be taken to a loading screen and should be able to review their quote once generated |
| 11. | Review Quote | User should see 'Proceed with transfer' button enabled/red |
| 12. | Tap 'Proceed with transfer' | User should see a screen requesting to know if the transaction is a "Third Party" transaction |
| 13. | Indicate that this is not a third party transaction | User should be taken to a screen requesting to know if they are a PEP |
| 14. | Indicate that the user is not a PEP | User should be taken to a screen requesting that they enter the receiver's name. 'Continue' button should be disabled |
| 15. | Provide the recipient's first and last names |  |
| 16. | Tap 'Continue' | User should be taken to a screen requesting the recipient's phone number. 'Continue' button should be diabled |
| 17. | Tap 'Continue' | Nothing should happen |

---

TEST CASE 48
Title: Verify that a user is unable to provide non-numeric characters in their phone number

ADO: [#38049](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38049) · Design

Tags: Automated

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|

---

TEST CASE 49
Title: Verify that a user is unable to continue with an incomplete phone number

ADO: [#38050](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38050) · Design

Tags: Automated

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|

---

TEST CASE 50
Title: Verify that the user is unable to proceed without agreeing to Western Union's Terms & Conditions

ADO: [#38051](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38051) · Ready

Tags: Automated

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Open the GKOne Application |  |
| 2. | Tap "Login" | User should be directed to the Login Screen |
| 3. | Enter @phoneNumber in the mobile number field | User should see no error under the field |
| 4. | Enter @passcode in the passcode field | User should see no error under the field |
| 5. | Tap "Login" | User should be taken to the home screen |
| 6. | Tap the "Send Money" icon on the home screen | User should be taken to the Request a quote screen. 'Get a quote' button should be disabled |
| 7. | Select the 'Recipient's country' | User should see the country in the field. 'Get a quote' button should be disabled |
| 8. | Enter the amount that you would like to send | User should see the 'They receive' field populate with the conversion based on the exchange rate. 'Get a quote' button should be disabled |
| 9. | Select how the user will receive the funds | 'Get a quote' button should be disabled |
| 10. | Do not agree to the Western Union Terms & Conditions | 'Get a quote' button should be disabled |
| 11. | Tap 'Get a quote' | Nothing should happen. 'Get a quote' button should be disabled |

---

TEST CASE 51
Title: Verify that the send amount field is denominated according to the user's tenant

ADO: [#38052](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38052) · Ready

Tags: Not Automating

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Open the GKOne Application |  |
| 2. | Tap "Login" | User should be directed to the Login Screen |
| 3. | Enter @phoneNumber in the mobile number field | User should see no error under the field |
| 4. | Enter @passcode in the passcode field | User should see no error under the field |
| 5. | Tap "Login" | User should be taken to the home screen |
| 6. | Tap the "Send Money" icon on the home screen | User should be taken to the Request a quote screen. 'Get a quote' button should be disabled |
| 7. | Enter a valid value in the "You send" field | The user should see [@currency] at the end of of the value |
| 8. | [no action in ADO] | The user should see the Jamaican flag to the far right |

---

TEST CASE 52
Title: Verify that the user is able to save their receipt

ADO: [#38053](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38053) · Design

Tags: Not Automated

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|

---

TEST CASE 53
Title: Verify that the details on the receipt are correct

ADO: [#38054](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38054) · Design

Tags: Not Automated

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the application |  |
| 2. | Navigate to the Outbound flow |  |
| 3. | Complete the outbound flow |  |
| 4. | Tap "Save receipt" |  |
| 5. | Observe the receipt in the device's gallery |  |

---

TEST CASE 54
Title: Verify that a user can complete an outbound transaction by funding with their GKOne Card

ADO: [#38055](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38055) · Design

Tags: Automated

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|

---

TEST CASE 55
Title: Verify that a user can complete an outbound transaction by funding with their debit/credit card

ADO: [#38056](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38056) · Design

Tags: Automated

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|

---

TEST CASE 56
Title: Verify that the receiver amount field is denominated according to the receiver's country

ADO: [#38057](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38057) · Design

Tags: 

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|

---

TEST CASE 57
Title: Verify that the details on the final review screen are correct

ADO: [#38058](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38058) · Design

Tags: Adjacently Automated

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|

---

TEST CASE 58
Title: Verify that if the outbound transaction is successful, the user gets an mtcn

ADO: [#38059](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38059) · Design

Tags: Adjacently Automated

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|

---

TEST CASE 59
Title: Verify that if the outbound transaction is unsuccessful, the user does not get an mtcn

ADO: [#38060](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/38060) · Design

Tags: Adjacently Automated

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|

---

TEST CASE 60
Title: Verify that a user cannot submit a zero value for the send amount when requesting a quote

Tags: Outbound V3, Remittances, Mobile

Pre Conditions:
The following should be true before proceeding:
• User has a KYC Tier 1 account with a non-expired ID
• User is in the JM or KY market
• Outbound is enabled for the user's tenant (Firebase and Cosmos)
• A known stable corridor is confirmed working in the test environment

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Log in to the GKOne application |  |
| 2. | Tap the "Send Money" icon on the home screen | User is taken to the Request a quote screen; "Get a quote" button is disabled |
| 3. | Select the destination country, state, city, and payout method |  |
| 4. | Enter "0" in the "You send" field |  |
| 5. | Tap "Get a quote" | No quote is returned; an inline error is displayed adjacent to the send amount field; user is not taken to the quote review screen |
| 6. | Review the inline error message | Message explains that the amount is invalid in user-friendly language; no internal error codes or raw WU response strings are visible |

Post Conditions:
The following should be true after test completion:
• User remains on the Request a quote screen
• No quote has been generated and no 10-minute quote timer has started

---

TEST CASE 61
Title: Verify that a user cannot submit a zero value for the receive amount when requesting a quote

Tags: Outbound V3, Remittances, Mobile

Pre Conditions:
The following should be true before proceeding:
• User has a KYC Tier 1 account with a non-expired ID
• User is in the JM or KY market
• Outbound is enabled for the user's tenant (Firebase and Cosmos)
• A known stable corridor that accepts receive amount input (not an intra-corridor selection) is confirmed working in the test environment

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Log in to the GKOne application |  |
| 2. | Tap the "Send Money" icon on the home screen | User is taken to the Request a quote screen; "Get a quote" button is disabled |
| 3. | Select the destination country, state, city, and payout method |  |
| 4. | Switch to the receive amount field and enter "0" | Send amount field is empty |
| 5. | Tap "Get a quote" | No quote is returned; an inline error is displayed adjacent to the receive amount field, not the send amount field; user is not taken to the quote review screen |
| 6. | Review the inline error message | Message explains that the amount is invalid in user-friendly language; no internal error codes or raw WU response strings are visible |

Post Conditions:
The following should be true after test completion:
• User remains on the Request a quote screen
• No quote has been generated and no 10-minute quote timer has started
• No send amount has been calculated or displayed

---
