# Saved Payee — Nickname Validation Test Cases

Story: Saved Payee Nickname Validation (standardised rules for in-flow and edit fields)

---

## Happy Path

---

TEST CASE 1 [PASS]
Title: Verify that a user can enter a valid nickname during the outbound save flow and the payee is stored with that nickname

Tags: Saved Payee, Remittances, Mobile, Nickname Validation

Pre Conditions:
The following should be true before proceeding:
• User is KYC Tier 1 with a non-expired ID
• User is in the WU Outbound recipient details screen with the save toggle ON
• A valid recipient has been entered and the transaction is ready to proceed
• The nickname field is visible

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Proceed to the nickname field in the outbound save flow | Nickname field is visible; character counter is displayed (e.g. "0 / 50" or equivalent) |
| 2. | Enter a valid nickname between 3 and 50 characters using alphabetic characters only (e.g. "John Smith") | Counter updates to reflect the number of characters entered; no inline error displayed |
| 3. | Complete and submit the transaction | Transaction completes successfully; toast appears confirming the payee was saved |
| 4. | Navigate to the Saved Payee widget | Saved payee appears under the correct category (Outbound - Cash or Outbound - D2B) with the entered nickname displayed |

Post Conditions:
The following should be true after test completion:
• Payee is stored with the exact nickname entered — not the Receiver's Name or a fallback
• Nickname is visible in the widget with no truncation or character loss

---

TEST CASE 2 [PASS]
Title: Verify that a user can edit an existing payee nickname via the Saved Payee widget and the widget reflects the updated nickname

Tags: Saved Payee, Remittances, Mobile, Nickname Validation, Edit

Pre Conditions:
The following should be true before proceeding:
• User has at least one saved payee in the Saved Payee widget with an existing nickname
• User is on the transaction page with the Saved Payee widget visible

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Locate the saved payee in the widget and select the option to edit the nickname | Nickname edit field is displayed, pre-populated with the current nickname |
| 2. | Clear the existing nickname and enter a new valid nickname (e.g. "Mary-Jane") | Character counter updates to reflect the new entry; the new nickname is visible in the field |
| 3. | Confirm and save the updated nickname | Nickname is saved |
| 4. | Observe the Saved Payee widget | The payee displays the updated nickname; the old nickname is no longer shown |

Post Conditions:
The following should be true after test completion:
• Payee nickname is updated to the new value
• The change persists — navigating away and returning to the widget still shows the updated nickname

---

## Alternate Valid Paths

---

TEST CASE 3 [PASS]
Title: Verify that a nickname containing all allowed character types is accepted in the in-flow nickname field

Tags: Saved Payee, Remittances, Mobile, Nickname Validation

Pre Conditions:
The following should be true before proceeding:
• User is KYC Tier 1 with a non-expired ID
• User is in the WU Outbound recipient details screen with the save toggle ON
• A valid recipient has been entered

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Proceed to the nickname field | Nickname field is displayed |
| 2. | Enter a nickname that includes alphabetic characters, a numeric character, a space, a hyphen, and an apostrophe (e.g. "Anne-Marie O'Brien 2") | All characters are accepted; no inline error; character counter reflects the full entry |
| 3. | Complete and submit the transaction | Transaction completes; payee saved |
| 4. | Check the Saved Payee widget | Nickname displays exactly as entered — hyphen, apostrophe, number, and spaces all rendered correctly |

Post Conditions:
The following should be true after test completion:
• All five allowed character types are accepted and stored without modification
• No character substitution or rendering issue in the widget

---

TEST CASE 4 [PASS]
Title: Verify that a nickname of exactly 3 characters is accepted in the in-flow nickname field

Tags: Saved Payee, Remittances, Mobile, Nickname Validation

Pre Conditions:
The following should be true before proceeding:
• User is KYC Tier 1 with a non-expired ID
• User is in the WU Outbound recipient details screen with the save toggle ON
• A valid recipient has been entered

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Proceed to the nickname field | Nickname field is displayed |
| 2. | Enter a nickname that is exactly 3 characters long (e.g. "Jon") | Counter shows 3 / 50; no inline error displayed |
| 3. | Complete and submit the transaction | Transaction completes; payee saved |
| 4. | Check the Saved Payee widget | Payee appears with the 3-character nickname — no modification |

Post Conditions:
The following should be true after test completion:
• The minimum boundary (3 characters) is accepted without error

---

TEST CASE 5 [PASS]
Title: Verify that a nickname of exactly 50 characters is accepted in the in-flow nickname field

Tags: Saved Payee, Remittances, Mobile, Nickname Validation

Pre Conditions:
The following should be true before proceeding:
• User is KYC Tier 1 with a non-expired ID
• User is in the WU Outbound recipient details screen with the save toggle ON
• A valid recipient has been entered

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Proceed to the nickname field | Nickname field is displayed |
| 2. | Enter a nickname that is exactly 50 characters long (e.g. a valid string of exactly 50 alphabetic/numeric characters) | Counter shows 50 / 50; no inline error displayed |
| 3. | Complete and submit the transaction | Transaction completes; payee saved |
| 4. | Check the Saved Payee widget | Payee appears with the full 50-character nickname — no truncation |

Post Conditions:
The following should be true after test completion:
• The maximum boundary (50 characters) is accepted without error
• The full 50-character nickname is stored and displayed intact

---

## Negative / Error Cases

---

TEST CASE 6 [PASS]
Title: Verify that a nickname of fewer than 3 characters is rejected with an inline error in the in-flow nickname field

Tags: Saved Payee, Remittances, Mobile, Nickname Validation, Negative, Validation

Pre Conditions:
The following should be true before proceeding:
• User is KYC Tier 1 with a non-expired ID
• User is in the WU Outbound recipient details screen with the save toggle ON
• A valid recipient has been entered

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Proceed to the nickname field | Nickname field is displayed |
| 2. | Enter a nickname that is exactly 2 characters long (e.g. "Jo") | Counter shows 2 / 50 |
| 3. | Attempt to proceed to the next step or submit the transaction | Inline error displayed indicating the nickname is below the 3-character minimum; progression is blocked |

Post Conditions:
The following should be true after test completion:
• No payee is saved
• User remains on the nickname screen with the inline error visible and actionable
• The transaction cannot complete until the nickname meets the minimum length

---

TEST CASE 7 [PASS]
Title: Verify that a nickname exceeding 50 characters cannot be saved in the in-flow nickname field

Tags: Saved Payee, Remittances, Mobile, Nickname Validation, Negative, Validation

Pre Conditions:
The following should be true before proceeding:
• User is KYC Tier 1 with a non-expired ID
• User is in the WU Outbound recipient details screen with the save toggle ON
• A valid recipient has been entered

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Proceed to the nickname field | Nickname field is displayed; counter shows 0 / 50 |
| 2. | Attempt to type or paste a string of 51 valid characters | Either: (a) field stops accepting input at 50 characters — the 51st character is not entered, or (b) the 51st character is accepted and an inline error is immediately displayed [VERIFY: confirm whether the field hard-caps at 50 or allows over-limit entry with an error] |
| 3. | If an inline error is shown: attempt to proceed | Progression blocked until the nickname is reduced to 50 characters or fewer |

Post Conditions:
The following should be true after test completion:
• A nickname of more than 50 characters cannot be saved
• The user is clearly informed of the limit — either by the field blocking input or by an inline error

---

TEST CASE 8 [PASS]
Title: Verify that a nickname containing disallowed characters is rejected in the in-flow nickname field

Tags: Saved Payee, Remittances, Mobile, Nickname Validation, Negative, Validation

Pre Conditions:
The following should be true before proceeding:
• User is KYC Tier 1 with a non-expired ID
• User is in the WU Outbound recipient details screen with the save toggle ON
• A valid recipient has been entered

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Proceed to the nickname field | Nickname field is displayed |
| 2. | Type a disallowed character (e.g. `@`) directly into the field | The character is either not accepted by the field (silently filtered) or an inline error is shown [VERIFY: confirm whether disallowed characters are silently filtered or trigger an error message] |
| 3. | Paste a string containing disallowed characters (e.g. `John@Smith!`) into the field | Same rejection behaviour as step 2; all disallowed characters are either filtered or the input is flagged |
| 4. | Repeat with an emoji character | Emoji is rejected — not accepted by the field |
| 5. | Attempt to proceed with a nickname that includes any disallowed character | Progression is blocked |

Post Conditions:
The following should be true after test completion:
• Only alphabetic, numeric, space, hyphen, and apostrophe are accepted
• Disallowed characters do not appear in the saved nickname

---

## Edge Cases

---

TEST CASE 9 [PASS]
Title: Verify that the Receiver's Name is used as the nickname when the in-flow nickname field is left empty and the name is between 3 and 50 characters

Tags: Saved Payee, Remittances, Mobile, Nickname Validation, Fallback

Pre Conditions:
The following should be true before proceeding:
• User is KYC Tier 1 with a non-expired ID
• User is in the WU Outbound recipient details screen with the save toggle ON
• Receiver's full name (first + last) is between 3 and 50 characters (e.g. "Maria Santos")

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Proceed to the nickname field | Nickname field is displayed |
| 2. | Leave the nickname field empty and proceed with the transaction | No inline error for the empty field; system does not block progression |
| 3. | Complete and submit the transaction | Transaction completes; toast confirms payee was saved |
| 4. | Check the Saved Payee widget | The payee nickname matches the Receiver's Name exactly (e.g. "Maria Santos") — not an empty string, not a system-generated code |

Post Conditions:
The following should be true after test completion:
• Receiver's Name is used verbatim as the nickname when the field is left empty
• Nickname is within the valid range and requires no further truncation or augmentation

---

TEST CASE 10 *Not a thing. BE validation err will prevent this from succeeding*
Title: Verify that the Receiver's Name is truncated to 50 characters when it exceeds the limit and no nickname is entered in the in-flow field

Tags: Saved Payee, Remittances, Mobile, Nickname Validation, Fallback, Edge Case

Pre Conditions:
The following should be true before proceeding:
• User is KYC Tier 1 with a non-expired ID
• User is in the WU Outbound recipient details screen with the save toggle ON
• Receiver's full name (first + last) exceeds 50 characters (e.g. a first name of 10 chars and a last name of 45 chars)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Proceed to the nickname field | Nickname field is displayed |
| 2. | Leave the nickname field empty and proceed with the transaction | No inline error; system does not block progression |
| 3. | Complete and submit the transaction | Transaction completes; payee saved |
| 4. | Check the Saved Payee widget | The payee nickname is 50 characters or fewer; the last name has been truncated; the first name is preserved and intact |

Post Conditions:
The following should be true after test completion:
• Stored nickname is ≤ 50 characters
• Truncation is applied to the last name — first name is not cut
• Nickname is not an empty string

Note: Verify how mid-word truncation is handled — does the system cut at exactly 50 characters regardless of word boundaries, or does it trim to the nearest complete word? [VERIFY with dev]

---

TEST CASE 11 *Not a thing. BE WU validation err will prevent this from succeeding*
Title: Verify that the Payment Method is appended to the Receiver's Name when the name is fewer than 3 characters and no nickname is entered in the in-flow field

Tags: Saved Payee, Remittances, Mobile, Nickname Validation, Fallback, Edge Case

Pre Conditions:
The following should be true before proceeding:
• User is KYC Tier 1 with a non-expired ID
• User is in the WU Outbound recipient details screen with the save toggle ON
• Receiver's full name (first + last combined) is fewer than 3 characters (e.g. first name "Jo", no last name)
• Payout method is Cash Pickup

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Proceed to the nickname field | Nickname field is displayed |
| 2. | Leave the nickname field empty and proceed with the transaction | No inline error; system does not block progression |
| 3. | Complete and submit the transaction | Transaction completes; payee saved |
| 4. | Check the Saved Payee widget | The payee nickname includes the Receiver's Name with the Payment Method label appended (e.g. "Jo CASH"); the combined nickname is at least 3 characters [UNCERTAIN: confirm exact format — separator character, capitalisation, and label per payout method] |

Post Conditions:
The following should be true after test completion:
• Nickname is at least 3 characters — the Payment Method brings it above the minimum
• Payment Method label is user-readable and correctly corresponds to the payout method used

Note: Repeat this test using Direct to Bank and Direct to Wallet payout methods to confirm the correct label is appended for each (e.g. `Jo BANK`, `Jo WALLET` — labels unconfirmed, mark [UNCERTAIN] until verified with dev).

---

TEST CASE 12 [PASS]
Title: Verify that the character counter is visible on the nickname field and updates in real time as the user types

Tags: Saved Payee, Remittances, Mobile, Nickname Validation

Pre Conditions:
The following should be true before proceeding:
• User is KYC Tier 1 with a non-expired ID
• User is in the WU Outbound recipient details screen with the save toggle ON
• Nickname field is visible

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Observe the nickname field before typing | A character counter is visible (e.g. "0 / 50" or "0 of 50 characters" or similar) |
| 2. | Type a single character | Counter updates immediately to reflect 1 character used |
| 3. | Type further characters to reach 25 | Counter accurately shows the current count at each keypress |
| 4. | Type characters up to exactly 50 | Counter shows 50 / 50 (or equivalent); no error at this point |
| 5. | Attempt to enter a 51st character | Either: the field blocks input and the counter remains at 50, or the counter shows 51 and an inline error is triggered [VERIFY: consistent with TC7 behaviour] |

Post Conditions:
The following should be true after test completion:
• The character counter is visible throughout the nickname input experience
• Counter reflects the accurate character count in real time at every step
• Counter reaches and correctly shows the maximum (50) without disappearing or miscounting

---

TEST CASE 13
Title: Verify that clearing the nickname field entirely in the edit widget produces a defined outcome

Tags: Saved Payee, Remittances, Mobile, Nickname Validation, Edit, Edge Case

Pre Conditions:
The following should be true before proceeding:
• User has at least one saved payee with an existing nickname
• User has opened the edit nickname field in the Saved Payee widget
• The current nickname is pre-populated in the field

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Clear the existing nickname from the edit field completely | Field is empty; counter shows 0 / 50 |
| 2. | Attempt to confirm and save with the field empty | [UNCERTAIN: confirm expected behaviour — is an inline error shown (min 3 chars required)? Is save blocked? Does the system revert to the Receiver's Name as a fallback? Or is the field not saveable when empty?] |

Post Conditions:
The following should be true after test completion:
• [UNCERTAIN: confirm with dev whether clearing the edit field reverts to Receiver's Name, blocks the save with a min-length error, or has another defined behaviour]

---

## Context applied

- domain-knowledge.md: Nickname management section (validation rules, fallback rules, both entry points), non-obvious behaviour
- edge-cases.md: Receiver's Name truncation, Receiver's Name < 3 chars, disallowed characters, boundary cases, leading/trailing spaces (TC not generated for spaces — flagged as [UNCERTAIN] in edge-cases.md)
- test-patterns.md: Nickname validation test angles (all), fallback test angles, standard preconditions
- Primary source: Saved Payee Nickname Validation story AC (2026-06-25)
- Markers leaned on: [UNCERTAIN] on payment method label format (TC11) and hard-cap vs soft-limit behaviour (TC7, TC12) — verify with dev before running TC7, TC11, TC12, TC13

---

**Total: 13 cases**
- Happy path: 2 (TC1 in-flow, TC2 edit)
- Alternate valid: 3 (TC3 all allowed chars, TC4 min boundary, TC5 max boundary)
- Negative / error: 3 (TC6 below min, TC7 above max, TC8 disallowed chars)
- Edge cases: 5 (TC9–11 fallback scenarios, TC12 counter display, TC13 cleared edit field)

Want me to add cases for any specific scenario, or adjust the Pre/Post Conditions on any of these?
