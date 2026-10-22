# Bug Draft — Duplicate "Other" Field Match Records

TITLE
CMS "Other" Field Match Is Recorded Many Times in CmsOtherFieldNameMatches for a Single Customer Match

REPRO STEPS
1. Set up a customer in a non-JM market who is registered on GK One with KYC Status 0. Their ID number must exist in CMS only in the "Other" field, on a single CMS record that passes all CMS checks (full name, DOB, not blocked, Proof of Address).
2. Log in to the GK One app as that customer.
3. Start the eKYC flow and complete Ondato verification by scanning the ID document.
4. Allow the CMS check to complete. The customer is matched via the "Other" field, reaches KYC Status 1 and proceeds to the eKYC completion screen.
5. In Azure Cosmos DB Data Explorer, open the `Users` database > `CmsOtherFieldNameMatches` container.
6. Run: `SELECT * FROM c WHERE c.UserId = '<customer's UserId>' ORDER BY c._ts DESC`
7. Observe the number of records returned for the customer.

NB: Screenshot attached showing the container contents.

EXPECTED BEHAVIOUR
One record is written to `CmsOtherFieldNameMatches` per accepted "Other" field match. It holds the customer identifier, the ID number used, MatchSource = "Other" and the match date and time (UTC). A single onboarding that matches via the "Other" field should produce exactly one record for that customer.

ACTUAL BEHAVIOUR / DESCRIPTION OF DEFECT
- `CmsOtherFieldNameMatches` holds many records (25+ visible in the attached screenshot, list continues) for the same customer, UserId `bc7970a4-0eda-41b2-8ef2-e6d9a566e7f0`.
- Each record has a different `id`, so these are separate documents, not one document shown repeatedly.
- Sample record (most recent):
  - DocumentNumber: `54254778552`
  - GkoNumber: `DT2024102387A607CFCCEA124609`
  - MatchSource: `Other`
  - CmsCustomerId: `3709628`
  - TenantId: `f377f641-d18a-4338-bdaa-40ebfabb11e5`
  - MatchedAtUtc: `2026-10-20T19:08:00.3649134Z`
- Impact: the "Other" match exception report is built from these records, so it will over-count "Other" field matches. The audit trail no longer reflects how many matches actually occurred.
  - Note: if `MatchedAtUtc` differs across the duplicate records, the record may be written each time some later step runs (e.g. on each KYC status check or app launch) rather than once at the match. The timestamp pattern will help the devs narrow down the trigger.

SYSTEM INFO
- Environment: N/A — to fill in (e.g. QA / UAT)
- Market / tenant: N/A — to fill in (TenantId `f377f641-d18a-4338-bdaa-40ebfabb11e5`)
- App build version: N/A — to fill in
- Device / OS: N/A — to fill in
- Data store: Azure Cosmos DB, `Users` database, `CmsOtherFieldNameMatches` container

SEVERITY: Major
JUSTIFICATION: Classified as Major. Onboarding still completes for the customer, but the "Other" match audit records, and the exception report built from them, are compliance-relevant and are now inaccurate for every customer matched via the "Other" field.

---

## Context applied

- `notes.md` (this folder), Answers → Audit and Reporting: expected one record per accepted match, record fields, UTC timestamps, exception report built from these records.
- `squads/platform/features/ekyc/domain-knowledge.md` → CMS check → Secondary lookup ("Other" field), Audit line.
- `squads/platform/squad.md` → Cross-cutting notes: audit logging is compliance-relevant (severity justification).
- `test-cases-draft.md` TCs 1 and 2: expect exactly one audit record after an "Other" match; this defect fails both.
- `squads/platform/features/ekyc/known-issues.md`: no existing entry for this.
