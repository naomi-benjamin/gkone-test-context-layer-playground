# CMS "Other" Field — Secondary Identity Lookup

Story: US-36589 — Incorporate the CMS "Other" field into onboarding identity searches to improve customer match rates.

Primary feature: `squads/platform/features/ekyc/` (CMS check, non-JM markets only: KY, VG, GY, TT).

## Background

- During onboarding, GK One checks the customer's identity against CMS using the ID Type and ID Number returned by Ondato. CMS is the system of record because these markets have no central government identity database.
- Today the search uses only the structured ID fields for the approved ID types: Passport, Driver's Licence, National ID Card. These match Western Union's approved ID types.
- Some legitimate customers' ID numbers were historically stored in the CMS **"Other"** field instead. Those customers fail onboarding with "Record Not Found" (KYC Status 8) even though they exist in CMS.
- "Record Not Found" currently covers two cases:
  1. The customer exists in CMS, but their ID number is in "Other".
  2. The customer is new to CMS and is onboarding through GK One for the first time.
- Impact: 13 of 41 CMS Check failures in Cayman in 2026.

## Acceptance criteria (distilled)

1. **Primary search first.** The CMS check searches by ID Type + ID Number against the existing structured fields.
2. **Secondary search on no result.** If the primary search finds nothing, search the customer's ID number against the CMS "Other" field.
3. **Validate the secondary match.** On an "Other" match, confirm Full Name and DOB between GK One and CMS before treating it as a match (same framework as the primary check).
4. **No automatic acceptance.** "Other" can hold values that aren't valid IDs, so a secondary match is accepted only if the Name and DOB checks pass.
5. **Retry path.** A customer retrying ID verification whose ID is in "Other" also gets the Name + DOB check before matching.
6. **Audit record.** For an "Other" match, record: customer identifier, ID number used, match source = "Other" field, date and time.
7. **Exception report.** Reporting must produce an exception report of "Other" matches listing: customer, ID number, CMS record, match date and time.

## How this lines up with the current eKYC docs

- `ekyc/domain-knowledge.md` (CMS check → Lookup mechanism) says the lookup uses the **document ID + the tenant's ISO 2 country code**. The story says **ID Type + ID Number**. Is ID Type a new search parameter, or was it always there and the docs leave it out?
- The known check list (`domain-knowledge.md`) is broader than Name + DOB: user is not blocked, first name, last name, DOB, Proof of Address present. **Confirmed 2026-10-15:** the full list applies to secondary matches too.
- The CMS retry flow (Status 8 → CSC/retail fixes the profile → only the CMS step re-runs) is probably what AC 5 means by "Retrying Their ID Verification". See `playground/2026-05-12-ekyc-cms-retry/`.
- Status 5 (GKONumber conflict) still applies if the "Other" match resolves to a CMS record whose GKONumber is already linked to another GK One user.

## Answers (2026-10-15)

### Scope
- All non-JM markets (KY, VG, GY, TT), not just Cayman, even though the failure data comes from Cayman. JM is out of scope.

### Search behaviour
- The secondary search runs only when the primary search returns **no record**. A primary match that fails Name/DOB does **not** fall through to "Other".
- The secondary search is limited to the tenant's market, like the primary search.
- The secondary search ignores ID Type and matches on the ID number only. Follow-on risk: a Passport number could match a CMS record whose "Other" holds the same digits for a different document. Name + DOB validation is the only guard.
- Matching against "Other" is **exact**: no partial or contains match, no trimming of leading/trailing spaces, and case-sensitive.
- Multiple matches fail with **Status 8** and failure reason `MULTIPLE_RECORDS_FOUND`, the same as multiple matches in the primary search. This applies even if only one of the matches would pass Name + DOB.
- If CMS errors or times out, the check fails the same way it does today: there's no fall-through to "Other", the user gets Status 8, and the failure reason is `CMS_SERVICE_UNAVAILABLE`.

### Validation and prefill
- After an "Other" match, everything else works as for a primary match. The full CMS check list applies (not blocked, full name, DOB, Proof of Address present), not just Name + DOB.
- Name is compared as a **full name** (not first and last separately), with normalisation applied before comparing.
- Failure reasons for an "Other" match are the same codes as for a primary match (e.g. `ID_DOCUMENT_FULL_NAME_MISMATCH`, `ID_DOCUMENT_DATE_OF_BIRTH_MISMATCH`). Nothing in the failure record distinguishes an "Other" candidate.
- CMS-sourced fields (address, nationality, country of birth) are prefilled from the "Other"-matched record and are read-only, as for a primary match.

### Failure reasons
- CMS check failure reasons are stored in `Profiles.IdentityValidationFailures`, the same table as for the existing CMS check. Known codes:
  - `RECORD_NOT_FOUND`: "No customer record(s) found in CMS with specified document number."
  - `ID_DOCUMENT_NOT_FOUND`: "No ID document(s) were found with the specified document number and type."
  - `ID_DOCUMENT_FULL_NAME_MISMATCH`
  - `ID_DOCUMENT_DATE_OF_BIRTH_MISMATCH`
  - `MULTIPLE_RECORDS_FOUND`
  - `CMS_SERVICE_UNAVAILABLE`
  - `CUSTOMER_IS_BLOCKED`
  - `PROOF_OF_ADDRESS_NOT_FOUND`
- No match from either search → `RECORD_NOT_FOUND`. There's no separate code for a primary miss vs an "Other" miss.

### Audit
- Stored in the DB table `Users.CmsOtherFieldNameMatches`.
- Each row holds the GK One user ID, the GKONumber and the CMS customer number.
- Timestamps are UTC.
- Rows are written **only for accepted matches**. An "Other" hit that fails Name/DOB writes no row.
- The report's "CMS record" is **not** the same thing as the audit's "customer identifier".

### Reporting
- The exception report is delivered through a dashboard. The PO owns verifying it, so it is outside QA scope for this story.

### Existing Status 8 customers
- They are not re-run automatically. An existing Status 8 customer whose ID is in "Other" is picked up only when they retry the CMS step.

## Open questions

### Scope
- Is there a feature flag for this? (See `playground/2026-06-17-cms-check-flag-interference/` for earlier flag issues around the CMS check.)
  - Yes. Name: EnableCmsOtherFieldSecondaryLookup
  - Follow-ups (unanswered; TCs 29–32 in `test-cases-draft-02.md` assume the defaults shown):
    - Scope: per tenant, global, or per environment? (assumed per tenant)
    - Flag off = exactly the pre-release behaviour (primary search only, `RECORD_NOT_FOUND`)? (assumed yes)
    - Is the flag read on each CMS check run, or cached? This matters for a retry after the flag is toggled. (assumed read per run)
    - Default state per environment, and the planned rollout order across KY/VG/GY/TT.
    - Any interaction with `EnableIdentityConflictResolution` on the retry path? (see the 2026-06-17 bug draft)

## Test angles

- Primary hit: ID in the structured field → matched via primary; no secondary search, no "Other" audit record.
- Primary miss, "Other" hit, Name + DOB match → onboarding succeeds; audit record written with source = "Other"; customer appears in the exception report.
- Primary miss, "Other" hit, Name mismatch → not accepted; Status 8; reason `ID_DOCUMENT_FULL_NAME_MISMATCH`.
- Primary miss, "Other" hit, DOB mismatch → not accepted; Status 8; reason `ID_DOCUMENT_DATE_OF_BIRTH_MISMATCH`.
- Primary miss, "Other" miss → genuinely new customer → Status 8; reason `RECORD_NOT_FOUND`.
- Full name normalisation: "Other" match where the CMS name differs from GK One's only in ways normalisation should absorb (e.g. case, extra spaces) → match. Which variants are normalised isn't documented; confirm before writing cases that depend on hyphens, accents or middle names.
- "Other" holds a non-ID value that collides with the scanned ID number → rejected by Name/DOB.
- Primary match with Name/DOB mismatch → does **not** fall through to "Other"; Status 8 as today. Set up the data so the same ID number also sits in "Other" on a record that *would* pass, to prove there's no fall-through.
- Scanned ID number in "Other" on a CMS record in a **different market** → not found (secondary search is limited to the tenant's market).
- ID Type ignored: customer scans a Passport whose number sits in "Other" on a record that also holds a Driver's Licence or National ID → matches if Name + DOB pass.
- Retry flow: Status 8 customer whose ID is in "Other" retries the CMS step → Name + DOB validation → success or failure.
- "Other" match where the CMS record is blocked → rejected; Status 8; reason `CUSTOMER_IS_BLOCKED`.
- "Other" match where Proof of Address is missing on the CMS record → rejected; Status 8; reason `PROOF_OF_ADDRESS_NOT_FOUND`.
- "Other" match passes all checks → the eKYC completion screen prefills address, nationality and country of birth from the "Other"-matched CMS record, read-only.
- "Other" match where the CMS record's GKONumber is already linked to another GK One user → Status 5.
- Multiple "Other" matches (ID number in "Other" on 2+ records in the market) → Status 8; `Profiles.IdentityValidationFailures` row with reason `MULTIPLE_RECORDS_FOUND`; no `Users.CmsOtherFieldNameMatches` row. Include a variant where only one of the records would pass Name + DOB: still Status 8.
- Exact match: "Other" holds the ID with extra spaces, dashes, a prefix ("PP: …") or surrounding text → **no match**; Status 8. "Other" holds a value that only contains the ID number → no match.
- Exact match: "Other" value has leading/trailing spaces, or differs only in case (e.g. `a1234567` vs `A1234567`) → **no match**; Status 8.
- Each ID type (Passport, Driver's Licence, National ID) → secondary lookup works for all three.
- Each non-JM market in scope; JM is unaffected (no CMS check).
- Audit record: after an "Other" match, query `Users.CmsOtherFieldNameMatches`. Check the GK One user ID, GKONumber and CMS customer number, the ID number used, source = "Other", and a UTC timestamp.
- Primary match → no row in `Users.CmsOtherFieldNameMatches`.
- "Other" hit that fails Name/DOB → **no row** in `Users.CmsOtherFieldNameMatches`.
- Existing Status 8 customer (failed before release, ID in "Other"): no automatic change in status after release; retry the CMS step → match via "Other" → Status 1 and a row written.
- Exception report: out of QA scope (PO-owned dashboard).
- CMS unavailable during the primary search → no fall-through to "Other"; Status 8; `Profiles.IdentityValidationFailures` row with reason `CMS_SERVICE_UNAVAILABLE`.
- CMS unavailable during the secondary search (primary returned no record, then the "Other" search errors or times out) → Status 8 with `CMS_SERVICE_UNAVAILABLE`, assuming the same handling applies.

## Context to load for test case generation

- Primary: `squads/platform/features/ekyc/` (all six files). The CMS check sections of `domain-knowledge.md` and `integration-points.md` are the core.
- `squads/platform/squad.md`.
- Related: `playground/2026-05-12-ekyc-cms-retry/` (retry flow cases, CMS down bug), `playground/2026-06-17-cms-check-flag-interference/`.
- Test data: needs CMS records with the ID number in "Other" (and colliding non-ID values) in the QA CMS. The existing `[VERIFY]` in `ekyc/integration-points.md` on simulating CMS failure scenarios applies here.
