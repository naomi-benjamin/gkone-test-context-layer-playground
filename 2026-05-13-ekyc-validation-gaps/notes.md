# eKYC Validation Gaps — Notes

**Source:** Internal eKYC validation reference docs (BE, FE, FE/BE diff, business gap summary)
**Date extracted:** 2026-05-13
**Scope:** Fields collected during `POST /api/v2/Kyc/completeInfo` (V2 active; V1 retired)

---

## Active Endpoint

`POST /api/v2/Kyc/completeInfo` — validator: `CompleteKycValidatorV2`

V1 (`/api/Kyc/completeInfo`) is retired. V1 details retained for historical reference only in source docs.

---

## eKYC Flow Stages (FE)

| Stage | Screen | Key fields |
|-------|--------|------------|
| 1 | Ondato SDK | ID front/back, selfie, extracted name/DOB/doc number — never in app state, sent SDK→webhook |
| 2 | Review Personal Data | First Name, Last Name, DOB, Phone, Email (all read-only); TRN (typed, JM only) |
| 3 | Permanent Address | Country, State, City (pickers); Street Line 1 (typed); Line 2 (optional typed) |
| 3b | Mailing Address | Optional; same rules as permanent address |
| 4 | Occupation & Personal Data | Nationality (read-only); Country of Birth (picker — editable JM only); Occupation (picker); Employment Status (non-JM only); Mother's Maiden Name (typed) |
| 5 | Employer Information | Only shown for non-JM when `EmploymentStatus.RequiresEmploymentStatusDetails == true` |
| 6 | Transaction Frequency | Picker — tap auto-advances |
| 7 | Transaction Amount Range | Picker — tap auto-advances |
| 8 | Source of Wealth | Picker — tap triggers final submission |

---

## Key Conditional Logic (JM vs non-JM)

| Logic | Jamaica | Non-Jamaica |
|-------|---------|-------------|
| Employment Status field | Not shown | Required — must select |
| Employer Info screen | Never shown | Shown when `RequiresEmploymentStatusDetails == true` |
| Country of Birth | User editable | Read-only (CMS-sourced) |
| TRN | Required (9 digits) | Not collected |
| Address Line 2 (V2) | Validated when not blank | Validated when country = GY OR not blank |
| Address State (V2) | Conditional on country | Skipped for GY |
| Address update persisted | Yes | No (V1 behaviour — address from V1 request not applied to user profile for non-JM) |

---

## Field Validation Reference (V2 BE — active rules)

| Field | Required (V2) | Rule |
|-------|---------------|------|
| Address.Street | Yes | `^[a-zA-Z\d ,.'-()/]+$` |
| Address.Line2 | Conditional | `^[a-zA-Z\d ,.'-()]*$` (allows empty; no `/`) |
| Address.City | Yes | `^[a-zA-Z .'/ -]+$` — no digits, no commas, no parentheses |
| Address.State | Conditional (not GY) | `^[a-zA-Z\d ,.'-()/]+$` |
| Address.ZipCode | Yes | `^[a-zA-Z\d -]+$` |
| Address.Country | Yes | `NotEmpty` + `Length(2,3)` |
| MotherName | Yes | `^[a-zA-Z .'-]+$` — ASCII only, no digits |
| BirthCountry | Yes | `NotEmpty` + `^[a-zA-Z .'-]+$` (accepts full name or ISO code) |
| Nationality | Yes | `^[a-zA-Z .'-]+$` |
| Trn | JM only | `NotEmpty` only — no format check in V2 |
| Occupation | Yes | `NotEmpty` + `^[a-zA-Z ,\\/-]+$` |
| RemittanceFrequency | Yes | `NotEmpty` only |
| RemittanceAmount | Yes | `NotEmpty` only |
| SourceOfWealth | No | Not validated |
| UserEmploymentInfo.* | Conditional | `NotEmpty`/`NotNull` only — no regex on any employer field |

**Employment info trigger:** `UserEmploymentInfo` block only validated when: (1) tenant is not JM AND (2) `EmploymentStatus.RequiresEmploymentStatusDetails == true`

---

## FE/BE Validation Gaps — Test Angles

These are mismatches between what the Flutter app enforces and what the backend V2 actually validates. Each is a test angle.

### Critical

**Mother's Maiden Name — FE/BE character set mismatch**
- FE: non-empty after trim only; accepts any characters including accented (é, ñ) and digits
- BE: `^[a-zA-Z .'-]+$` — rejects digits, special symbols, and all non-ASCII letters
- **Impact:** User enters "María" or "Mary2" → FE passes → BE rejects at submission with no clear in-app error
- **Why intentional on BE:** Western Union downstream does not accept accented/non-ASCII characters
- **Test:** Enter mother's name with accented char (e.g. "Marié"), digits ("Mary2"), symbols ("Mary!") → expect submission failure at BE if FE not fixed

### High — FE blocks valid input (BE is more permissive)

**Employer Name too restrictive on FE**
- FE: `^[a-zA-Z0-9 ]+$` + max 50 chars — blocks `.`, `-`, `,`, `&`
- BE: `NotEmpty()` only — no character or length limit
- **Impact:** Real employer names ("Smith & Sons", "Acme Co. Ltd.", "GK One - Cayman") rejected by FE
- **Test:** Enter employer name with `&`, `.`, `-` → FE should block even though BE would accept

**Employer Address field lengths — FE-only limits**
- FE max lengths: Line 1 = 40, City = 20, State = 24, Postal Code = 9
- BE: `NotEmpty()` only — no length limit
- **Test:** Submit directly to BE with fields exceeding FE limits → BE accepts; FE blocks

### High — BE accepts what FE blocks (bypass risk)

**TRN format — only enforced on FE**
- FE: exactly 9 numeric digits + server uniqueness check
- BE V2: `NotEmpty()` only — "abc", "1", "123" all accepted
- **Test:** Direct API call with non-numeric or wrong-length TRN → BE accepts it
- Remediation planned: restore `(?<!\d)\d{9}(?!\d)` to `CompleteKycValidatorV2`

**PO Box / CSO Box — only blocked on FE**
- FE: rejects patterns like "P.O. Box 123", "Post Office Box", "CSO Box" on submit
- BE: `AddressRegEx` only — no PO/CSO Box check
- **Test:** Direct API call with PO Box address → BE accepts and persists
- Remediation planned: add PO Box + CSO Box checks to `CompleteKycValidatorV2`

**Address Line 2 — forward slash accepted by FE, rejected by BE V2**
- FE: inherits Line 1 filter (allows `/`)
- BE V2: `Address2RegEx` does not allow `/`
- **Test:** Enter "Apt 3/4" in Line 2 → FE passes → BE rejects

### Medium

**City — FE uses picker (API list), BE uses regex**
- BE rejects digits and commas in city names (`^[a-zA-Z .'/ -]+$`)
- If cities API ever returns values with digits (e.g. "District 7") BE will reject
- **Test:** Confirm cities API never returns values failing `AddressCityRegEx`

**Source of Wealth — no BE validation**
- FE enforces selection; BE performs zero validation
- **Test:** Direct API call omitting SourceOfWealth → BE accepts and persists blank value
- Remediation planned: add `NotEmpty()` to `CompleteKycValidatorV2`

**Occupation — FE uses API list, BE uses regex**
- If occupations API returns value with digits or symbols, BE will reject
- **Test:** Confirm occupations API list contains only values matching `^[a-zA-Z ,\\/-]+$`

---

## Regex Quick Reference (from `GeneralConstants.cs`)

| Constant | Pattern | Notes |
|----------|---------|-------|
| `AddressRegEx` | `^[a-zA-Z\d ,.'-()/]+$` | Letters, digits, space, `,.'-()/` — min 1 char |
| `Address2RegEx` | `^[a-zA-Z\d ,.'-()]*$` | Same but no `/`; allows empty |
| `AddressCityRegEx` | `^[a-zA-Z .'/ -]+$` | No digits, no comma, no parentheses |
| `AddressStateRegEx` | `^[a-zA-Z\d ,.'-()/]+$` | Same as `AddressRegEx` |
| `AlphanumericRegEx` | `^[a-zA-Z\d -]+$` | Letters, digits, space, dash |
| `ProperNounRegEx` | `^[a-zA-Z .'-]+$` | Letters, space, `.'-` — no digits |

---

## Graduation Candidates

- FE/BE gaps table → `squads/platform/features/ekyc/edge-cases.md` (Mother's Name critical gap is highest priority)
- Conditional logic summary (JM vs non-JM) → `squads/platform/features/ekyc/domain-knowledge.md`
- Employer Info trigger condition (`RequiresEmploymentStatusDetails`) → `domain-knowledge.md` employment section
- V2 endpoint + DTO structure → `squads/platform/features/ekyc/integration-points.md` (KYC submit endpoint)
