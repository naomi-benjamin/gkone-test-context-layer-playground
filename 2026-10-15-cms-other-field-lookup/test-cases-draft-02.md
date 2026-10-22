# CMS "Other" Field Secondary Lookup — Feature Flag Test Cases (Draft)

Generated: 2026-10-15. Skill: Test Case Generator. Input: `notes.md` in this folder (Open questions → Scope).

**Scope:** behaviour of the eKYC CMS check in non-JM markets (KY, VG, GY, TT) when `EnableCmsOtherFieldSecondaryLookup` is on or off. The flag-on behaviour itself (TCs 1–27) is in `test-cases-draft.md`. Case numbering continues from that file so the IDs don't clash.

Test data and DB check conventions are the same as `test-cases-draft.md`.

---

TEST CASE 28
Title: Verify that a customer whose ID number is stored only in the CMS "Other" field fails the CMS check with RECORD_NOT_FOUND when EnableCmsOtherFieldSecondaryLookup is disabled

Tags: KYC, Onboarding, CMS, Feature Flag, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is disabled for the tenant
• Customer is registered and signed in to GK One in a non-JM market (KY), KYC Status 0
• Same CMS data setup as Test Case 1: [ID] is in the "Other" field only, and the record would pass all CMS checks

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete the eKYC flow through Ondato verification by scanning the test document containing [ID] | CMS check fails; the "We couldn't confirm your identity." banner is shown |
| 2. | Query the customer's KYC Status | KYC Status is 8 |
| 3. | Query `Profiles.IdentityValidationFailures` for the customer | One row exists with reason `RECORD_NOT_FOUND` |
| 4. | Query `Users.CmsOtherFieldNameMatches` for the customer | No row exists |

Post Conditions:
The following should be true after test completion:
• With the flag disabled, the CMS check searches primary ID fields only, as before the release

---

TEST CASE 29
Title: Verify that a customer whose ID number is in a primary CMS ID field passes the CMS check when EnableCmsOtherFieldSecondaryLookup is disabled

Tags: KYC, Onboarding, CMS, Feature Flag, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is disabled for the tenant
• Customer is registered and signed in to GK One in a non-JM market (KY), KYC Status 0
• A single CMS record in KY holds [ID] in the primary ID field for the document's ID type and passes all CMS checks

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete the eKYC flow through Ondato verification by scanning the test document containing [ID] | The customer proceeds to the eKYC completion screen |
| 2. | Query the customer's KYC Status | KYC Status is 1 |
| 3. | Query `Users.CmsOtherFieldNameMatches` for the customer | No row exists |

Post Conditions:
The following should be true after test completion:
• The primary CMS check is unaffected by the flag being disabled

---

TEST CASE 30
Title: Verify that a KYC Status 8 customer whose ID is in the "Other" field is matched on retry only after EnableCmsOtherFieldSecondaryLookup is enabled

Tags: KYC, Onboarding, CMS, Feature Flag, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` is disabled for the tenant
• Customer in a non-JM market failed the CMS check with reason `RECORD_NOT_FOUND`, KYC Status 8, and is on the Documents Required screen
• A single CMS record in the market holds the customer's ID number in the "Other" field only and passes all CMS checks

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Tap "Retry ID Verification", then tap "Yes, I have" | The CMS check re-runs; Ondato is not re-launched |
| 2. | Wait for the CMS check to complete | CMS check fails; the "We couldn't confirm your identity." banner is shown again |
| 3. | Query `Profiles.IdentityValidationFailures` and `Users.CmsOtherFieldNameMatches` for the customer | A new failure row exists with reason `RECORD_NOT_FOUND`; no `Users.CmsOtherFieldNameMatches` row exists |
| 4. | Enable `EnableCmsOtherFieldSecondaryLookup` for the tenant | |
| 5. | Tap "Visit Retail Location", tap "Retry ID Verification", then tap "Yes, I have" | The CMS check re-runs; Ondato is not re-launched |
| 6. | Wait for the CMS check to complete | CMS check passes; the customer proceeds to the eKYC completion screen |
| 7. | Query the customer's KYC Status | KYC Status is 1 |
| 8. | Query `Users.CmsOtherFieldNameMatches` for the customer | One row exists with match source "Other" and a UTC timestamp from the second retry |

Post Conditions:
The following should be true after test completion:
• The retry uses the flag state at the time of the retry, not at the time of the original failure
• Enabling the flag does not re-run the CMS check for existing Status 8 customers automatically

---

TEST CASE 31
Title: Verify that the "Other" field lookup runs and failures are logged on CMS retry when EnableCmsOtherFieldSecondaryLookup and EnableIdentityConflictResolution are both enabled

Tags: KYC, Onboarding, CMS, Feature Flag, Mobile, Regression

Pre Conditions:
The following should be true before proceeding:
• `EnableCmsOtherFieldSecondaryLookup` and `EnableIdentityConflictResolution` are both enabled
• Customer in a non-JM market is at KYC Status 8 and on the Documents Required screen
• A single CMS record in the market holds the customer's ID number in the "Other" field only
• The CMS record's full name differs from the customer's document (DOB matches)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Tap "Retry ID Verification", then tap "Yes, I have" | The CMS check re-runs; Ondato is not re-launched |
| 2. | Wait for the CMS check to complete | CMS check fails; the "We couldn't confirm your identity." banner is shown again |
| 3. | Query `Profiles.IdentityValidationFailures` for the customer | A new row exists for the retry with reason `ID_DOCUMENT_FULL_NAME_MISMATCH` |
| 4. | Check the customer's email inbox | The standard CMS check failure email is received |
| 5. | Query `Users.CmsOtherFieldNameMatches` for the customer | No row exists |

Post Conditions:
The following should be true after test completion:
• The identity conflict resolution flag does not suppress the "Other" field lookup or its failure logging on retry for non-JM customers

---

## Context applied

- `notes.md` in this folder: flag name (Open questions → Scope), retry and existing-Status-8 answers (TC 30), failure reasons (TCs 28, 30, 31).
- `test-cases-draft.md` TC 1 data setup (TC 28), TCs 25–26 retry steps (TCs 30–31).
- `squads/platform/features/ekyc/domain-knowledge.md` CMS check: Outcomes, Failure reasons, Failure recovery.
- `_global/cross-cutting-concerns.md`: `EnableCmsOtherFieldSecondaryLookup` is not listed there yet.
- Related (playground, lower trust): `playground/2026-06-17-cms-check-flag-interference/bug-draft.md`. `EnableIdentityConflictResolution` silently skipped the CMS check on non-JM reattempt, which is the basis for TC 31. `playground/2026-05-12-ekyc-cms-retry/` provides the retry UI wording for TCs 30–31.

**Flag assumptions (TCs 28–31):**
- Flag scope is assumed to be per tenant. If it's global or per environment, change the preconditions and step 4 of TC 30.
- With the flag disabled, behaviour is assumed to match pre-release behaviour (primary search only). TCs 28–30 depend on this.
- TC 30 assumes the flag is read when each CMS check runs, so it isn't cached at session or app start.
