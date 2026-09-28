# GKOne UAT Test Data Package v1.0

## Purpose

This package supports a third party integrating with a set of GKOne APIs to build a system that answers user inquiries about transactions. It gives that team a self-contained set of UAT test data, example requests, and test scenarios so they can test their integration against the GKOne UAT environment without needing access to GKOne's internal systems or live customer data.

This is a **test data package**, not documentation of record. If anything here conflicts with the live API's actual behavior, the live API wins -- flag the discrepancy back to your GKOne contact (see below).

## Environment

- **Environment:** UAT
- **Base URL:** `<UAT_BASE_URL>` -- your GKOne contact will provide the actual value.
- **Data validity period:** this data was pulled from UAT on 2026-09-24. UAT is periodically refreshed/reset, which can invalidate specific transaction IDs, MTCNs, or customer records below. **Refresh schedule:** `<REFRESH_SCHEDULE>` -- confirm with your GKOne contact before relying on this data for a long-running test cycle.

## Getting credentials

Credentials (access token / client secret, however your integration authenticates) are **not** included in this package and are sent separately, through `<CREDENTIAL_PROCESS>`. Do not request or exchange credentials through the same channel this package was delivered on unless your GKOne contact confirms that channel is appropriate.

## Endpoints in scope

| Method | Endpoint | Notes |
|---|---|---|
| POST | `/api/v1/customers/filter` | One `lookupType` per request (GKO_NUMBER, TRN, ID_DOCUMENT, EMAIL). Returns `200` with an empty result on no match -- not `404`. |
| POST | `/api/v1/users/{userId}/Transactions/Filter` | `userId` is a required path parameter. `dateFrom`/`dateTo` required in the body; `limit`/`offset` optional. |
| GET | `/api/v1/users/{userId}/Transactions/{transactionId}` | Returns `404` ("Record does not exist") if the pair doesn't match, or if either id is unknown -- including a transactionId that belongs to a *different* user. Returns `400` if either id fails GUID validation. |
| POST | `/api/v1/remittances/{mtcn}/validation` | Validates an inbound remittance by MTCN plus a customer identifier (one lookupType, matching `/customers/filter`'s discriminator pattern) plus `purposeOfTransaction`/`relationship`. |
| PATCH | `/api/v1/remittances/{mtcn}/receiver/name` | **A valid, well-formed request currently returns `501 Not Implemented`. This is expected, documented behavior -- please do not log it as a defect.** The endpoint exists and validates its input correctly (see `scenarios/test-scenarios.csv` for its negative-case behavior, which is fully implemented); only the successful-update path is not yet built. |

## MTCN validation note

Calling `POST /remittances/{mtcn}/validation` may not be a side-effect-free read. This package's transaction data shows real evidence of a validation attempt against the same MTCN, made twice in quick succession with the same (incorrect) identity, where the second attempt returned a different failure (`record locked to another terminal`) than the first (`receiver name matching failed`). Treat repeated validation calls against the same MTCN with caution during your own test runs -- don't assume it's safe to replay the exact same call back-to-back. See `data/mtcns.csv` for the reusability note on each MTCN, and treat any marked `unknown` as unconfirmed rather than safe.

## Data files

- **`data/customers.json`** -- 12 customer profiles. Each has `id` (this is the `userId` used in the transaction endpoints), name, contact info, address, KYC tier/status, and identifiers usable with `/customers/filter` (`GkoNumber`, `Trn`, `DocumentId`). Internal-only fields (password hashes, card tokens, detailed KYC/compliance metadata, database plumbing) have been stripped -- this package only carries what's relevant to the 5 in-scope endpoints.
- **`data/transactions.json`** -- 77 transaction records. Each has `userId` (links back to `customers.json`'s `id`), `id` (the `transactionId` used in the GET-by-id endpoint), `classifications.productType`/`status.current` (useful for filter testing), and `references` (an array of key/value pairs -- this is where each transaction's MTCN, quote id, order id, etc. live; look for `{"key": "MTCN", "value": "..."}`).
- **`data/mtcns.csv`** -- MTCNs referenced in this package's transaction data, with the userId/transactionId they trace back to, their expected validation outcome, and whether repeat-validating them is known to be safe (mostly `unknown` -- see the MTCN validation note above). Two rows are flagged as coverage gaps (`cancelled`, `expired`) with no matching data in this pull.

**How the files link together:** a customer in `customers.json` (`id`) owns zero or more transactions in `transactions.json` (`userId`). A transaction may carry an MTCN in its `references` array, which is cross-referenced in `mtcns.csv` alongside its known validation behavior.

## Test scenarios

`scenarios/test-scenarios.csv` covers positive cases for all 5 endpoints plus the required negative cases: non-existent userId/transactionId, a transactionId belonging to a different user (access control), malformed request bodies, invalid/unknown MTCN, missing/expired auth token, and the PATCH 501 case. Rows marked `TBC` or `[UNCERTAIN]`/`[OPEN QUESTION]` have an expected status/behavior that isn't confirmed against live UAT -- see the open questions list your GKOne contact will share alongside this package.

## Postman collection

`api/postman_collection.json` has one request per endpoint with example bodies drawn from this package's data. `api/postman_environment_TEMPLATE.json` is a placeholder-only environment -- **it contains no real credentials**. Import both, then fill in `base_url` and `access_token` in your own environment (do not commit real values back into the template).

Variables used: `{{base_url}}`, `{{access_token}}`, `{{userId}}`, `{{transactionId}}`, `{{mtcn}}`.

## This is test data

All customer and transaction data in this package is synthetic or masked test data created and maintained by GKOne QA for integration testing. It does not represent real GKOne customers or real financial activity.

## Known limits

- **Rate limits:** `<RATE_LIMIT_DETAILS>`
- **IP allowlisting:** `<IP_ALLOWLIST_PROCESS>`
- **VPN/network access:** `<VPN_REQUIREMENTS>`

## Contact and issue reporting

- **Contact:** `<CONTACT_PERSON>`
- **Issue reporting:** `<ISSUE_REPORTING_PROCESS>`
