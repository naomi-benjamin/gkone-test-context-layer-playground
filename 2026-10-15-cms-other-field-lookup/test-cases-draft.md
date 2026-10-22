# CMS "Other" Field Secondary Lookup — Test Cases (Draft)

Generated: 2026-10-15. Skill: Test Case Generator. Input: `notes.md` in this folder.

**Scope:** eKYC CMS check, non-JM markets (KY, VG, GY, TT). Secondary lookup of the scanned ID number against the CMS "Other" field when the primary (ID Type + ID Number) search returns no record.

**Test data conventions used below**
- "Primary ID field": the structured CMS ID fields (Passport, Driver's Licence, National ID Card).
- "Other field": the CMS free-text "Other" field.
- [ID] is the document number Ondato extracts from the test document scanned during the case.
- DB checks:
  - KYC Status: the customer's KYC Status in the user profile.
  - Failure reason: `Profiles.IdentityValidationFailures`.
  - Audit row: `Users.CmsOtherFieldNameMatches`.

---

## Happy path

TEST CASE 1
Title: Verify that a customer whose ID number is stored only in the CMS "Other" field is matched and passes the CMS check when all CMS checks succeed

Tags: KYC, Onboarding, CMS, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Customer is registered and signed in to GK One in a non-JM market (KY), KYC Status 0
• A CMS record exists in KY with [ID] in the "Other" field and not in any primary ID field
• No other CMS record in KY holds [ID] in a primary ID field or the "Other" field
• The CMS record's full name and DOB match the name and DOB on the test document
• The CMS record is not blocked and has Proof of Address
• The CMS record's GKONumber is not linked to any other GK One user

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start the eKYC flow from the GK One app | Ondato identity verification opens |
| 2. | Complete Ondato verification by scanning the test document containing [ID] | Ondato verification passes; the CMS check starts automatically with no user action |
| 3. | Wait for the CMS check to complete | The customer proceeds to the eKYC completion screen; no "We couldn't confirm your identity" banner is shown |
| 4. | Query the customer's KYC Status | KYC Status is 1 |
| 5. | Query `Profiles.IdentityValidationFailures` for the customer | No failure row exists for this CMS check |
| 6. | Query `Users.CmsOtherFieldNameMatches` for the customer | Exactly one row exists for the customer |

Post Conditions:
The following should be true after test completion:
• The customer is matched to the CMS record via the "Other" field
• The customer can continue the eKYC flow as for a primary match

---

TEST CASE 2
Title: Verify that the system records the GK One user ID, GKONumber, CMS customer number, ID number, match source and UTC timestamp when a customer is matched via the CMS "Other" field

Tags: KYC, Onboarding, CMS, Audit, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Same data setup as Test Case 1 (single CMS record in KY with [ID] in the "Other" field; all checks pass)
• The tester has noted the CMS customer number and GKONumber of the target CMS record
• The tester has read access to `Users.CmsOtherFieldNameMatches`

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Note the current UTC time | |
| 2. | Complete the eKYC flow through Ondato verification by scanning the test document containing [ID] | CMS check passes; KYC Status is 1 |
| 3. | Note the current UTC time | |
| 4. | Query `Users.CmsOtherFieldNameMatches` for the customer | One row exists |
| 5. | Inspect the identifier columns on the row | The row holds the customer's GK One user ID, the GKONumber and the CMS customer number of the matched CMS record |
| 6. | Inspect the ID number column | The value equals [ID] exactly |
| 7. | Inspect the match source column | The value indicates the "Other" field |
| 8. | Inspect the date/time column | The timestamp is in UTC and falls between the times noted in steps 1 and 3 |

Post Conditions:
The following should be true after test completion:
• The audit row contains all fields required by the story for an "Other" field match

---

TEST CASE 3
Title: Verify that the eKYC completion screen prefills read-only CMS-sourced fields from the CMS record matched via the "Other" field

Tags: KYC, Onboarding, CMS, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Same data setup as Test Case 1
• The tester has noted the address, nationality and country of birth on the target CMS record, and these differ from any default values

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete the eKYC flow through Ondato verification by scanning the test document containing [ID] | CMS check passes; the eKYC completion screen is displayed |
| 2. | Review the Country, State/Parish, Address Line 1 and Address Line 2 fields | Values match the address on the "Other"-matched CMS record |
| 3. | Review the Nationality and Country of Birth fields | Values match the "Other"-matched CMS record |
| 4. | Attempt to edit each of the fields reviewed in steps 2–3 | The fields are read-only and cannot be edited |

Post Conditions:
The following should be true after test completion:
• CMS-sourced data behaves the same for an "Other" match as for a primary match

---

## Alternate valid paths

TEST CASE 4
Title: Verify that a customer whose ID number is in a primary CMS ID field is matched by the primary search and no "Other" field match is recorded

Tags: KYC, Onboarding, CMS, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Customer is registered and signed in to GK One in a non-JM market, KYC Status 0
• A CMS record in that market holds [ID] in the primary ID field matching the scanned document type
• The CMS record passes all CMS checks (not blocked, name, DOB, Proof of Address)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete the eKYC flow through Ondato verification by scanning the test document containing [ID] | CMS check passes; the customer proceeds to the eKYC completion screen |
| 2. | Query the customer's KYC Status | KYC Status is 1 |
| 3. | Query `Users.CmsOtherFieldNameMatches` for the customer | No row exists |

Post Conditions:
The following should be true after test completion:
• Existing primary-match behaviour is unchanged

---

TEST CASE 5
Title: Verify that the "Other" field lookup matches on ID number regardless of the scanned document's ID type

Tags: KYC, Onboarding, CMS, Mobile

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Customer is registered and signed in to GK One in KY, KYC Status 0
• The test document is a Passport containing [ID]
• A CMS record in KY holds [ID] in the "Other" field, and its primary ID fields hold a Driver's Licence or National ID Card with a different number
• No CMS record in KY holds [ID] in a Passport field
• The CMS record passes all CMS checks (not blocked, name, DOB, Proof of Address)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete the eKYC flow through Ondato verification by scanning the Passport | The primary search finds no record; the secondary search matches the CMS record via the "Other" field |
| 2. | Query the customer's KYC Status | KYC Status is 1 |
| 3. | Query `Users.CmsOtherFieldNameMatches` for the customer | One row exists with match source "Other" and ID number [ID] |

Post Conditions:
The following should be true after test completion:
• ID Type plays no part in the "Other" field match

---

TEST CASE 6
Title: Verify that the "Other" field lookup succeeds when the scanned document is a Driver's Licence or a National ID Card

Tags: KYC, Onboarding, CMS, Mobile

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Customer is registered and signed in to GK One in a non-JM market, KYC Status 0
• Two test documents are available: a Driver's Licence and a National ID Card, each with its own ID number
• For each document, a separate CMS record in the market holds that document's number in the "Other" field only and passes all CMS checks
• Run once per document type with a fresh customer account

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete the eKYC flow through Ondato verification by scanning the Driver's Licence | CMS check passes via the "Other" field; KYC Status is 1 |
| 2. | Query `Users.CmsOtherFieldNameMatches` for the customer | One row exists with match source "Other" |
| 3. | With a second fresh customer, repeat steps 1–2 by scanning the National ID Card | CMS check passes via the "Other" field; KYC Status is 1; one audit row exists |

Post Conditions:
The following should be true after test completion:
• The secondary lookup works for every approved ID type (Passport covered in Test Cases 1 and 5)

---

TEST CASE 7
Title: Verify that a customer in the Cayman Islands (KY) whose ID number is stored only in the CMS "Other" field is matched and passes the CMS check

Tags: KYC, Onboarding, CMS, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Customer is registered and signed in to GK One in KY, KYC Status 0
• A CMS record in KY holds [ID] in the "Other" field and not in any primary ID field
• No other CMS record in KY holds [ID] in a primary ID field or the "Other" field
• The CMS record's full name and DOB match the test document; the record is not blocked and has Proof of Address
• The CMS record's GKONumber is not linked to any other GK One user

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start the eKYC flow from the GK One app | Ondato identity verification opens |
| 2. | Complete Ondato verification by scanning the test document containing [ID] | Ondato verification passes; the CMS check starts automatically with no user action |
| 3. | Wait for the CMS check to complete | The customer proceeds to the eKYC completion screen |
| 4. | Query the customer's KYC Status | KYC Status is 1 |
| 5. | Query `Profiles.IdentityValidationFailures` for the customer | No failure row exists for this CMS check |
| 6. | Query `Users.CmsOtherFieldNameMatches` for the customer | One row exists with match source "Other", ID number [ID] and the KY CMS record's customer number |

Post Conditions:
The following should be true after test completion:
• The secondary lookup is active in KY

---

TEST CASE 8
Title: Verify that a customer in Guyana (GY) whose ID number is stored only in the CMS "Other" field is matched and passes the CMS check

Tags: KYC, Onboarding, CMS, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Customer is registered and signed in to GK One in GY, KYC Status 0
• A CMS record in GY holds [ID] in the "Other" field and not in any primary ID field
• No other CMS record in GY holds [ID] in a primary ID field or the "Other" field
• The CMS record's full name and DOB match the test document; the record is not blocked and has Proof of Address
• The CMS record's GKONumber is not linked to any other GK One user

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start the eKYC flow from the GK One app | Ondato identity verification opens |
| 2. | Complete Ondato verification by scanning the test document containing [ID] | Ondato verification passes; the CMS check starts automatically with no user action |
| 3. | Wait for the CMS check to complete | The customer proceeds to the eKYC completion screen |
| 4. | Query the customer's KYC Status | KYC Status is 1 |
| 5. | Query `Profiles.IdentityValidationFailures` for the customer | No failure row exists for this CMS check |
| 6. | Query `Users.CmsOtherFieldNameMatches` for the customer | One row exists with match source "Other", ID number [ID] and the GY CMS record's customer number |

Post Conditions:
The following should be true after test completion:
• The secondary lookup is active in GY

---

TEST CASE 9
Title: Verify that a customer in Trinidad and Tobago (TT) whose ID number is stored only in the CMS "Other" field is matched and passes the CMS check

Tags: KYC, Onboarding, CMS, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Customer is registered and signed in to GK One in TT, KYC Status 0
• A CMS record in TT holds [ID] in the "Other" field and not in any primary ID field
• No other CMS record in TT holds [ID] in a primary ID field or the "Other" field
• The CMS record's full name and DOB match the test document; the record is not blocked and has Proof of Address
• The CMS record's GKONumber is not linked to any other GK One user

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start the eKYC flow from the GK One app | Ondato identity verification opens |
| 2. | Complete Ondato verification by scanning the test document containing [ID] | Ondato verification passes; the CMS check starts automatically with no user action |
| 3. | Wait for the CMS check to complete | The customer proceeds to the eKYC completion screen |
| 4. | Query the customer's KYC Status | KYC Status is 1 |
| 5. | Query `Profiles.IdentityValidationFailures` for the customer | No failure row exists for this CMS check |
| 6. | Query `Users.CmsOtherFieldNameMatches` for the customer | One row exists with match source "Other", ID number [ID] and the TT CMS record's customer number |

Post Conditions:
The following should be true after test completion:
• The secondary lookup is active in TT

---

TEST CASE 10
Title: Verify that a customer in the British Virgin Islands (VG) whose ID number is stored only in the CMS "Other" field is matched and passes the CMS check

Tags: KYC, Onboarding, CMS, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Customer is registered and signed in to GK One in VG, KYC Status 0
• A CMS record in VG holds [ID] in the "Other" field only and passes all CMS checks

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete the eKYC flow through Ondato verification by scanning the test document containing [ID] | CMS check passes via the "Other" field; KYC Status is 1; one audit row with match source "Other" |

Post Conditions:
The following should be true after test completion:
• The secondary lookup is active in VG

---

TEST CASE 11
Title: Verify that a customer matched via the "Other" field passes the full name check when the names differ only in case or extra whitespace

Tags: KYC, Onboarding, CMS, Mobile

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Same data setup as Test Case 1, except the CMS full name differs from the test document's name only in letter case and extra internal spaces (e.g. "JOHN  SMITH" vs "John Smith")
• DOB matches

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete the eKYC flow through Ondato verification by scanning the test document containing [ID] | CMS check passes; KYC Status is 1 |
| 2. | Query `Profiles.IdentityValidationFailures` for the customer | No `ID_DOCUMENT_FULL_NAME_MISMATCH` row exists |

Post Conditions:
The following should be true after test completion:
• Full name normalisation applies to "Other" field matches as it does to primary matches

---

## Negative / error cases

TEST CASE 12
Title: Verify that a customer matched via the "Other" field is not accepted when the full name does not match CMS

Tags: KYC, Onboarding, CMS, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Customer is registered and signed in to GK One in a non-JM market, KYC Status 0
• A single CMS record in the market holds [ID] in the "Other" field only
• The CMS record's full name is a different person's name; DOB matches

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete the eKYC flow through Ondato verification by scanning the test document containing [ID] | CMS check fails; the Home screen shows the "We couldn't confirm your identity." banner |
| 2. | Query the customer's KYC Status | KYC Status is 8 |
| 3. | Query `Profiles.IdentityValidationFailures` for the customer | A row exists with reason `ID_DOCUMENT_FULL_NAME_MISMATCH` |
| 4. | Query `Users.CmsOtherFieldNameMatches` for the customer | No row exists |

Post Conditions:
The following should be true after test completion:
• An "Other" field hit is not accepted without a full name match

---

TEST CASE 13
Title: Verify that a customer matched via the "Other" field is not accepted when the date of birth does not match CMS

Tags: KYC, Onboarding, CMS, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Customer is registered and signed in to GK One in a non-JM market, KYC Status 0
• A single CMS record in the market holds [ID] in the "Other" field only
• The CMS record's full name matches; DOB differs from the test document

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete the eKYC flow through Ondato verification by scanning the test document containing [ID] | CMS check fails; the "We couldn't confirm your identity." banner is shown |
| 2. | Query the customer's KYC Status | KYC Status is 8 |
| 3. | Query `Profiles.IdentityValidationFailures` for the customer | A row exists with reason `ID_DOCUMENT_DATE_OF_BIRTH_MISMATCH` |
| 4. | Query `Users.CmsOtherFieldNameMatches` for the customer | No row exists |

Post Conditions:
The following should be true after test completion:
• An "Other" field hit is not accepted without a DOB match

---

TEST CASE 14
Title: Verify that a customer matched via the "Other" field is rejected when the CMS record is blocked

Tags: KYC, Onboarding, CMS, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Same data setup as Test Case 1, except the CMS record is blocked

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete the eKYC flow through Ondato verification by scanning the test document containing [ID] | CMS check fails; the "We couldn't confirm your identity." banner is shown |
| 2. | Query the customer's KYC Status | KYC Status is 8 |
| 3. | Query `Profiles.IdentityValidationFailures` for the customer | A row exists with reason `CUSTOMER_IS_BLOCKED` |
| 4. | Query `Users.CmsOtherFieldNameMatches` for the customer | No row exists |

Post Conditions:
The following should be true after test completion:
• The blocked check applies to "Other" field matches

---

TEST CASE 15
Title: Verify that a customer matched via the "Other" field is rejected when the CMS record has no Proof of Address

Tags: KYC, Onboarding, CMS, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Same data setup as Test Case 1, except the CMS record has no Proof of Address

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete the eKYC flow through Ondato verification by scanning the test document containing [ID] | CMS check fails; the "We couldn't confirm your identity." banner is shown |
| 2. | Query the customer's KYC Status | KYC Status is 8 |
| 3. | Query `Profiles.IdentityValidationFailures` for the customer | A row exists with reason `PROOF_OF_ADDRESS_NOT_FOUND` |
| 4. | Query `Users.CmsOtherFieldNameMatches` for the customer | No row exists |

Post Conditions:
The following should be true after test completion:
• The Proof of Address check applies to "Other" field matches

---

TEST CASE 16
Title: Verify that a customer fails the CMS check with RECORD_NOT_FOUND when their ID number is in neither a primary ID field nor the "Other" field

Tags: KYC, Onboarding, CMS, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Customer is registered and signed in to GK One in a non-JM market, KYC Status 0
• No CMS record in the market holds [ID] in any primary ID field or the "Other" field

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete the eKYC flow through Ondato verification by scanning the test document containing [ID] | CMS check fails; the "We couldn't confirm your identity." banner is shown |
| 2. | Query the customer's KYC Status | KYC Status is 8 |
| 3. | Query `Profiles.IdentityValidationFailures` for the customer | A row exists with reason `RECORD_NOT_FOUND` |
| 4. | Query `Users.CmsOtherFieldNameMatches` for the customer | No row exists |

Post Conditions:
The following should be true after test completion:
• A genuinely new customer still fails as before the change

---

TEST CASE 17
Title: Verify that a customer fails the CMS check with MULTIPLE_RECORDS_FOUND when their ID number is in the "Other" field of more than one CMS record

Tags: KYC, Onboarding, CMS, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Customer is registered and signed in to GK One in a non-JM market, KYC Status 0
• Two CMS records in the market hold [ID] in the "Other" field; no record holds it in a primary ID field
• Record A passes all CMS checks for the test document (name, DOB, not blocked, Proof of Address); record B has a different name and DOB

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete the eKYC flow through Ondato verification by scanning the test document containing [ID] | CMS check fails; the "We couldn't confirm your identity." banner is shown |
| 2. | Query the customer's KYC Status | KYC Status is 8 |
| 3. | Query `Profiles.IdentityValidationFailures` for the customer | A row exists with reason `MULTIPLE_RECORDS_FOUND` |
| 4. | Query `Users.CmsOtherFieldNameMatches` for the customer | No row exists |

Post Conditions:
The following should be true after test completion:
• The customer is not matched to record A, even though record A alone would pass all checks

---

TEST CASE 18
Title: Verify that the "Other" field lookup does not match when the stored value is only a formatted or partial form of the ID number

Tags: KYC, Onboarding, CMS, Mobile

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Four fresh customer accounts in a non-JM market, KYC Status 0, each with a test document containing a different ID number
• For each customer, one CMS record holds a variant of their ID number in the "Other" field, and no record holds the exact number anywhere:
  – Variant A: separators added (e.g. [ID] with dashes or internal spaces)
  – Variant B: prefixed (e.g. "PP: [ID]")
  – Variant C: embedded in longer text (e.g. "Passport [ID] exp 2030")
  – Variant D: truncated ([ID] missing its last character)
• Each record would otherwise pass all CMS checks

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | As the Variant A customer, complete the eKYC flow through Ondato verification | CMS check fails; KYC Status 8; reason `RECORD_NOT_FOUND`; no audit row |
| 2. | Repeat step 1 for the Variant B customer | CMS check fails; KYC Status 8; reason `RECORD_NOT_FOUND`; no audit row |
| 3. | Repeat step 1 for the Variant C customer | CMS check fails; KYC Status 8; reason `RECORD_NOT_FOUND`; no audit row |
| 4. | Repeat step 1 for the Variant D customer | CMS check fails; KYC Status 8; reason `RECORD_NOT_FOUND`; no audit row |

Post Conditions:
The following should be true after test completion:
• Only an exact value match in the "Other" field counts as a hit

---

TEST CASE 19
Title: Verify that the "Other" field lookup does not match when the stored value differs from the ID number only by surrounding whitespace or letter case

Tags: KYC, Onboarding, CMS, Mobile

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Two fresh customer accounts in a non-JM market, KYC Status 0, each with a test document containing an alphanumeric ID number (e.g. a passport number with letters)
• For customer 1, a CMS record's "Other" field holds their ID number with a leading and a trailing space
• For customer 2, a CMS record's "Other" field holds their ID number with the letters in the opposite case
• No record holds either exact number anywhere; each record would otherwise pass all CMS checks

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | As customer 1, complete the eKYC flow through Ondato verification | CMS check fails; KYC Status 8; reason `RECORD_NOT_FOUND`; no audit row |
| 2. | As customer 2, complete the eKYC flow through Ondato verification | CMS check fails; KYC Status 8; reason `RECORD_NOT_FOUND`; no audit row |

Post Conditions:
The following should be true after test completion:
• The "Other" field comparison is not trimmed and is case-sensitive

---

TEST CASE 20
Title: Verify that the "Other" field lookup does not match a CMS record that belongs to a different market

Tags: KYC, Onboarding, CMS, Mobile

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Customer is registered and signed in to GK One in KY, KYC Status 0
• A CMS record in a different non-JM market (e.g. TT) holds [ID] in the "Other" field and would pass all checks
• No CMS record in KY holds [ID] anywhere

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete the eKYC flow through Ondato verification by scanning the test document containing [ID] | CMS check fails; the "We couldn't confirm your identity." banner is shown |
| 2. | Query the customer's KYC Status | KYC Status is 8 |
| 3. | Query `Profiles.IdentityValidationFailures` for the customer | A row exists with reason `RECORD_NOT_FOUND` |
| 4. | Query `Users.CmsOtherFieldNameMatches` for the customer | No row exists |

Post Conditions:
The following should be true after test completion:
• The secondary lookup is limited to the customer's own market

---

TEST CASE 21
Title: Verify that the system does not fall back to the "Other" field when the primary search finds a record that fails the name check

Tags: KYC, Onboarding, CMS, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Customer is registered and signed in to GK One in a non-JM market, KYC Status 0
• CMS record A in the market holds [ID] in the primary ID field matching the scanned document type; its full name does not match the test document
• CMS record B in the market holds [ID] in the "Other" field and would pass all CMS checks

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete the eKYC flow through Ondato verification by scanning the test document containing [ID] | CMS check fails; the "We couldn't confirm your identity." banner is shown |
| 2. | Query the customer's KYC Status | KYC Status is 8 |
| 3. | Query `Profiles.IdentityValidationFailures` for the customer | A row exists with reason `ID_DOCUMENT_FULL_NAME_MISMATCH` |
| 4. | Query `Users.CmsOtherFieldNameMatches` for the customer | No row exists |

Post Conditions:
The following should be true after test completion:
• The customer is not matched to record B; the secondary lookup runs only when the primary search returns no record

---

TEST CASE 22
Title: Verify that the CMS check fails with CMS_SERVICE_UNAVAILABLE and does not run the "Other" field lookup when CMS is unavailable during the primary search

Tags: KYC, Onboarding, CMS, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Customer is registered and signed in to GK One in a non-JM market, KYC Status 0
• A CMS record in the market holds [ID] in the "Other" field and would pass all checks
• CMS is made unavailable (error or timeout) for the primary search

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete the eKYC flow through Ondato verification by scanning the test document containing [ID] | CMS check fails; the "We couldn't confirm your identity." banner is shown |
| 2. | Query the customer's KYC Status | KYC Status is 8 |
| 3. | Query `Profiles.IdentityValidationFailures` for the customer | A row exists with reason `CMS_SERVICE_UNAVAILABLE` |
| 4. | Query `Users.CmsOtherFieldNameMatches` for the customer | No row exists |

Post Conditions:
The following should be true after test completion:
• A CMS outage is not treated as "no record found" and does not trigger the secondary lookup

---

TEST CASE 23
Title: Verify that the CMS check fails with CMS_SERVICE_UNAVAILABLE when CMS becomes unavailable during the "Other" field lookup

Tags: KYC, Onboarding, CMS, Mobile

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Customer is registered and signed in to GK One in a non-JM market, KYC Status 0
• No CMS record in the market holds [ID] in a primary ID field, so the primary search returns no record
• CMS is made unavailable (error or timeout) for the "Other" field search only

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete the eKYC flow through Ondato verification by scanning the test document containing [ID] | CMS check fails; the "We couldn't confirm your identity." banner is shown |
| 2. | Query the customer's KYC Status | KYC Status is 8 |
| 3. | Query `Profiles.IdentityValidationFailures` for the customer | A row exists with reason `CMS_SERVICE_UNAVAILABLE`, not `RECORD_NOT_FOUND` |
| 4. | Query `Users.CmsOtherFieldNameMatches` for the customer | No row exists |

Post Conditions:
The following should be true after test completion:
• A secondary lookup outage is reported as an outage, not as "no record found"

---

## Edge cases

TEST CASE 24
Title: Verify that a customer matched via the "Other" field is rejected with KYC Status 5 when the CMS record's GKONumber already belongs to another GK One user

Tags: KYC, Onboarding, CMS, Mobile

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Same data setup as Test Case 1
• The CMS record's GKONumber is already linked to a different, existing GK One user

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete the eKYC flow through Ondato verification by scanning the test document containing [ID] | The customer does not proceed to the eKYC completion screen |
| 2. | Query the customer's KYC Status | KYC Status is 5 (Rejected) |
| 3. | Query the existing GK One user linked to the GKONumber | That user's KYC Status and GKONumber are unchanged |

Post Conditions:
The following should be true after test completion:
• The GKONumber conflict rule applies to "Other" field matches

---

TEST CASE 25
Title: Verify that an existing KYC Status 8 customer whose ID is in the "Other" field is matched only after they retry ID verification

Tags: KYC, Onboarding, CMS, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Customer in a non-JM market failed the CMS check before the release with reason `RECORD_NOT_FOUND`, KYC Status 8
• A CMS record in the market holds the customer's ID number in the "Other" field only and passes all CMS checks
• The release containing the "Other" field lookup is deployed

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Without any customer action, query the customer's KYC Status after the release | KYC Status is still 8; no row in `Users.CmsOtherFieldNameMatches` |
| 2. | Sign in to the GK One app as the customer | The Home screen shows the "We couldn't confirm your identity." banner with the "Visit Retail Location" CTA |
| 3. | Tap "Visit Retail Location" | The Documents Required screen opens with the "Retry ID Verification" option |
| 4. | Tap "Retry ID Verification" | The "Action Needed" confirmation modal appears |
| 5. | Tap "Yes, I have" | The CMS check re-runs; Ondato is not re-launched |
| 6. | Wait for the CMS check to complete | CMS check passes; the customer proceeds to the eKYC completion screen |
| 7. | Query the customer's KYC Status | KYC Status is 1 |
| 8. | Query `Users.CmsOtherFieldNameMatches` for the customer | One row exists with match source "Other" and a UTC timestamp from the retry, not from the original attempt |

Post Conditions:
The following should be true after test completion:
• Existing Status 8 customers are not re-processed automatically
• The retry path runs the secondary lookup

---

TEST CASE 26
Title: Verify that a customer retrying ID verification is not matched via the "Other" field when the full name or date of birth does not match CMS

Tags: KYC, Onboarding, CMS, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is enabled for the tenant
• Customer in a non-JM market is at KYC Status 8 and on the Documents Required screen
• A single CMS record in the market holds the customer's ID number in the "Other" field only
• The CMS record's DOB differs from the customer's document (name matches)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Tap "Retry ID Verification" | The "Action Needed" confirmation modal appears |
| 2. | Tap "Yes, I have" | The CMS check re-runs; Ondato is not re-launched |
| 3. | Wait for the CMS check to complete | CMS check fails; the "We couldn't confirm your identity." banner is shown again |
| 4. | Query the customer's KYC Status | KYC Status is 8 |
| 5. | Query `Profiles.IdentityValidationFailures` for the customer | A new row exists for the retry with reason `ID_DOCUMENT_DATE_OF_BIRTH_MISMATCH` |
| 6. | Query `Users.CmsOtherFieldNameMatches` for the customer | No row exists |

Post Conditions:
The following should be true after test completion:
• The name and DOB validation applies to "Other" field matches on retry

---

TEST CASE 27
Title: Verify that a JM customer's onboarding does not run the CMS "Other" field lookup

Tags: KYC, Onboarding, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• Customer is registered and signed in to GK One in JM, KYC Status 0

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete the eKYC flow through Ondato verification | The customer proceeds to the eKYC completion screen; no CMS check runs |
| 2. | Query `Profiles.IdentityValidationFailures` and `Users.CmsOtherFieldNameMatches` for the customer | No rows exist in either table |

Post Conditions:
The following should be true after test completion:
• The JM eKYC flow is unchanged

---

## Context applied

**Primary context (eKYC feature):**
- `squads/platform/features/ekyc/domain-knowledge.md`:
  - CMS check: Lookup mechanism, Secondary lookup ("Other" field), Checks performed, Outcomes, Failure reasons, Failure recovery. Used for all cases.
  - KYC status reference: Status 1/5/8. Used for TCs 1, 7–10, 12–26.
  - Field source by market (CMS-sourced, read-only fields): TC 3.
- `squads/platform/features/ekyc/integration-points.md` CMS section: non-JM only and automatic trigger (all cases), `CMS_SERVICE_UNAVAILABLE` (TCs 22–23).
- `squads/platform/features/ekyc/test-patterns.md`: fresh account per run (preconditions).
- `squads/platform/squad.md`, `overview.md`, `edge-cases.md`, `known-issues.md` (no known issues logged; nothing excluded).
- `_global/domain-gloassary.md`: KYC Status vs KYC Tier. `_global/cross-cutting-concerns.md`: `EnableCmsOtherFieldSecondaryLookup` is not listed there yet. The flag name comes from `notes.md` (Open questions → Scope).

**Playground input:**
- `notes.md` in this folder (AC, Answers 2026-10-15, test angles). All cases trace to it.

**Related context (playground, lower trust):**
- `playground/2026-05-12-ekyc-cms-retry/test-cases-draft.md` UI flow reference: the "We couldn't confirm your identity." banner, Documents Required, Retry ID Verification, the Action Needed modal and "Yes, I have". Used in TCs 12–23 (banner) and TCs 25–26 (retry steps). This is playground content and not authoritative; check the wording against the current build.


**Flag assumptions:** TCs 1–26 now have "flag enabled" as a precondition. TC 27 (JM) doesn't, because no CMS check runs there. Flag-on/flag-off cases are in `test-cases-draft-02.md`.

**Marked content leaned on:**
- `[TODO: Full list of checks to be confirmed]` in Checks performed: TCs 14–15 assume the documented list is complete for "Other" matches.
- `[VERIFY: test environment support for simulating CMS failure scenarios]` in `integration-points.md`: TCs 12–24 depend on seeding CMS records and simulating outages in QA.
- `overview.md` `[UNCERTAIN]` on the eKYC entry point: steps say "Start the eKYC flow" generically.
