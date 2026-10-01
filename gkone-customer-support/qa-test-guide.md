# Feature 37403: Filter Transaction Summaries (QA Test Guide)

**Branch:** `feature/37403-add-filter-transactions-summary-endpoint` · **Feature:** #37403 · **Story:** #37436

## 1. What this feature does

Customer Support can already search a customer's transactions with `POST /transactions/filter`. That endpoint
returns **one row per step**. A single outbound remittance can produce several rows: a quote, a Create Order
attempt, a card charge and the confirm. The agent then has to work out which rows belong together and whether the
customer's money actually moved.

The new endpoint returns **one row per customer action**, called a **journey**. Each row has:

- one **rolled-up status** for the whole journey, such as `SETTLED`, `FAILED` or `PARTIALLY_COMPLETED`;
- the error and remediation of the step that decided that status;
- a `journey` block that lists every step's record `id`. Any step can be opened with the existing
  `GET /transactions/{id}`.

```
POST /api/v1/users/{userId}/transactions/summaries/filter
```

It uses the same auth policy (Customer Support), `ProblemDetails` errors and audit logging as `/filter`.

## 2. How it works

1. **Seed scan:** reads the customer's records in the requested date window that match the filters, up to 400.
2. **Completion scan:** finds linked "sibling" steps up to **7 days either side** of the window, so a journey
   isn't split when a step falls just outside the range or doesn't match the searched phone number or email.
3. **Linking:** steps are grouped into one journey when they share a **link token**: `correlationId`,
   `referenceNumber`, or a `references[]` value under `orderId`/`PaymentOrderId`, `quoteId`/`QuoteId`, `mtcn` or
   `paymentId`. Linking is transitive, so quote → order → card charge forms one journey. Values shorter than
   6 characters never link. Values that are reused across purchases (`paymentMethodId`, biller codes and so on)
   never link.
4. **Journey type:** each journey is labelled with a type, such as `remittance.outbound` or `bill-payment`. Card
   `payment.*` steps take the type of the journey they're linked into. A step with no `productType` becomes its own
   journey of type `unknown`.
5. **Status rollup:** rules R1–R9 are applied in order (section 5).
6. **Filter, sort and page:** `statuses` and `journeyTypes` filter on the **rolled-up** values. Journeys are sorted
   by `journey.lastActivityUtc` descending, then `journeyKey` ascending, and paging counts journeys, not steps.

## 3. Configuration

### Feature flag

| Flag | Where | Off (default / missing) | On |
|---|---|---|---|
| `EnableTransactionSummaries` | Azure App Configuration, label `Orders` | Route returns `404` | Endpoint is live |

- A toggle takes effect within the App Configuration refresh interval (about 30 s). No restart is needed.
- Authentication runs **before** the flag check, so a bad or missing token gets `401`/`403` even when the flag is off.

### `TransactionSummary` settings (`appsettings.json`)

| Setting | Default | Meaning |
|---|---|---|
| `MaximumDocumentsScanned` | `400` (max 500) | Records a scan may read before returning `422` |
| `CompletionLookaroundInSeconds` | `604800` (7 days) | How far either side of the window to look for siblings. `0` turns this off |
| `MaximumLinkTokensPerQuery` | `500` | Tokens per completion query (internal chunking) |
| `MaximumRequestDurationInSeconds` | `60` (1–90) | Time budget per request before returning `504` |
| `LinkReferenceKeys` | `orderId`, `quoteId`, `mtcn`, `paymentId` groups | Which `references[]` keys link steps |
| `ExcludedLinkReferenceNames` | `[]` | Groups to switch off without a redeploy, e.g. `paymentId` |
| `MinimumLinkTokenLength` | `6` | Shorter values never link |
| `MaximumStepsPerJourney` | `50` | Steps listed per journey. The latest are kept and `stepsTruncated` is set |
| `DefaultLimit` / `MaximumLimit` | `20` / `30` | Paging |

Invalid values stop the service at startup. Examples: a duration above 90, a scan cap above 500, an unknown name in
`ExcludedLinkReferenceNames`, or `LinkReferenceKeys` in the old flat-list shape.

**Environment prerequisites before enabling:**

- Create the flag (off) in every environment.
- Apply the `TransactionsV2` indexing policy (see [indexing-policy-completion-query.md](indexing-policy-completion-query.md)).
- The producer link-token fixes (story #37455) should be in place, or some steps won't link (section 7).

## 4. Request

```json
{
  "gkoNumber": "GK1234567",
  "taxIdentificationNumber": null,
  "emailAddress": null,
  "phoneNumber": null,
  "references": [ { "key": "orderId", "value": "O-123456" } ],
  "journeyTypes": [ "remittance.outbound" ],
  "statuses": [ "FAILED" ],
  "dateFrom": "2026-09-01T00:00:00Z",
  "dateTo": "2026-09-30T23:59:59Z",
  "limit": 20,
  "offset": 0
}
```

| Field | Rules |
|---|---|
| `dateFrom`, `dateTo` | **Required.** ISO 8601 UTC (`Z`). `dateFrom` ≤ `dateTo`. Range ≤ 90 days. `dateFrom` ≥ 2020-01-01. `dateTo` ≤ now + 1 day |
| `gkoNumber`, `taxIdentificationNumber`, `emailAddress`, `phoneNumber`, `references` | Optional. Same validation as `/filter`. A journey matches if **any** of its steps matches |
| `statuses` | Optional, max 25. Trimmed and uppercased. Compared with the **rolled-up** status |
| `journeyTypes` | Optional, max 25. Trimmed and lowercased, product-type format. Compared with the journey type |
| `limit` / `offset` | Default 20, max 30 / default 0 |
| Anything else | **Rejected with `400`**. This includes the `/filter`-only fields `productTypes` and `activityKinds` |

## 5. Response and status rollup

Each row has the same shape as a `/filter` row (`id`, `classifications`, `amounts`, `status`, `remediation`,
`references`, `parties`, `tags`, `audit`) plus a `journey` block:

| `journey` field | Meaning |
|---|---|
| `journeyKey` | Display key, e.g. `orderId:O-123456`. **Not a stable id**, because it can change when more steps arrive |
| `journeyType` | e.g. `remittance.outbound`, `bill-payment`, `unknown` |
| `firstActivityUtc` / `lastActivityUtc` | Earliest and latest step `status.lastUpdatedUtc` |
| `stepCount` / `failedStepCount` | Full counts, even when the step list is truncated |
| `stepsTruncated` | `true` when more than 50 steps exist |
| `lastFailure` | Latest failed, cancelled or voided step, **kept even if the journey later succeeded** |
| `steps[]` | `id`, `activityKind`, `productType`, `transactionType`, `status`, reason codes, `lastUpdatedUtc`, oldest first |

The top-level `id` is the **representative step**: the latest headline step, otherwise the deciding step. The
top-level error fields (`failureReasonCode`, `providerReasonCode`, `statusDescription`) are populated only when the
rolled-up status is a failure (`FAILED`, `FAILED_COMPLIANCE`, `CANCELLED`, `VOIDED` or `PARTIALLY_COMPLETED`).

**Status rules** are applied top to bottom, and the first match wins. A *headline* step is the step that moves the
money (for example the remittance confirm, `TRANSACTION`).

| Rule | When | Rolled-up status |
|---|---|---|
| R1 | Any step is `FAILED_COMPLIANCE` | `FAILED_COMPLIANCE` (sticky, a later retry doesn't hide it) |
| R2 | A headline step is `SUBMITTED`/`PROCESSING` | `PROCESSING` |
| R3 | All headline steps succeeded | `SETTLED` if any settled, else `COMPLETED` |
| R4 | All headline steps failed | Latest headline's status |
| R5 | Headline steps are a mix of success and failure | `PARTIALLY_COMPLETED` (**new value**) |
| R6 | No headline step and the latest step failed | That step's status |
| R7 | Every step is `REQUESTED` | `REQUESTED` |
| R8 | No headline step, otherwise | `PROCESSING` |
| R9 | Only `LIFECYCLE`/`NOTIFICATION` steps | Latest step's status |

## 6. Test scenarios and acceptance criteria

### Feature flag and access

| # | Given | Expect |
|---|---|---|
| F1 | Flag off or missing, valid token | `404` |
| F2 | Flag on, valid Customer Support token | `200` |
| F3 | No or invalid token (flag on or off) | `401`/`403` |
| F4 | Toggle the flag | Behaviour changes within about 30 s, with no restart |

### Journey rollup (use records like design section 12)

| # | Steps for one customer action | Expect one row with |
|---|---|---|
| A | Quote → Create Order → card charge `FAILED` (`PAYMENT_TRANSACTION_DECLINED`), no confirm | `FAILED`, type `remittance.outbound`, decline reason and remediation |
| B | As A, then card charge `COMPLETED` + confirm `SETTLED` | `SETTLED`, error fields `null`, `lastFailure` shows the decline |
| C | Confirm is `FAILED_COMPLIANCE` (`COMPLIANCE_BLOCK`) | `FAILED_COMPLIANCE`, escalation remediation |
| D | Quote only (`REQUESTED`) | `REQUESTED`, type `remittance.outbound` |
| E | Bill payment: 2 billers, one `SETTLED`, one `FAILED` | `PARTIALLY_COMPLETED`, reason from the failed biller |
| F | Create Order + card charge completed, no confirm yet | `PROCESSING` |
| G | Lone card verification `FAILED` | `FAILED`, type `payment.card-verification` |
| H | Lone card charge `FAILED` then `SETTLED` (same `orderId`) | `SETTLED`, `lastFailure` shows the decline |
| I | Remittance using PascalCase `QuoteId`/`PaymentOrderId` references | One journey, not three |
| J | Record with no `productType` | Its own row, type `unknown`. The rest of the search still returns `200` |

### Window, completion and filters

| # | Given | Expect |
|---|---|---|
| W1 | Quote on the 30th, confirm on the 1st; search ends on the 30th | One journey containing both steps (completion phase) |
| W2 | Search by `phoneNumber`; the card charge step has no phone number | Card charge still included in the journey |
| W3 | `statuses: ["FAILED"]` | Only journeys whose **rolled-up** status is `FAILED` (not a `SETTLED` journey with an earlier decline) |
| W4 | `journeyTypes: ["bill-payment"]` | Only bill-payment journeys |
| W5 | Several journeys | Sorted newest `lastActivityUtc` first |
| W6 | 45 journeys, `limit=20, offset=30` | 15 rows, `pagination.totalRecords` = 45 (journeys), `hasMore=false` |
| W7 | Journey with more than 50 steps | 50 latest steps, `stepsTruncated=true`, `stepCount` = full count |
| W8 | Values under 6 characters shared by unrelated records | Not linked |
| W9 | `GET /transactions/{id}` with any `steps[].id` | Returns that step |

### Validation and errors

| # | Given | Expect |
|---|---|---|
| V1 | Missing `dateFrom` or `dateTo`, non-UTC date, or `dateFrom` > `dateTo` | `400` |
| V2 | Range over 90 days, or `dateFrom` before 2020-01-01 | `400` |
| V3 | `dateTo` more than 1 day in the future | `400` ("dateTo must not be more than 86400 seconds after the current UTC time.") |
| V4 | Body contains `productTypes`, `activityKinds` or any unknown field | `400` |
| V5 | More than 25 `statuses`/`journeyTypes`, bad format, or `limit` > 30 | `400` |
| V6 | Window holds more than 400 records | `422`, type `summary-scan-limit-exceeded`, "narrow the date range" |
| V7 | Window is small but the linked siblings exceed 400 | `422`, same type, message suggests an identity filter |
| V8 | Request exceeds the time budget (60 s by default; lower it in a test env to force this) | `504`, type `summary-time-budget-exceeded`, no partial list |
| V9 | Client disconnects mid-request | Logged as `499`, not a `500` |

All errors are `ProblemDetails` (RFC 7807) with no stack traces.

### Regression on `/transactions/filter`

| # | Check |
|---|---|
| R1 | Existing `/filter` tests and results are unchanged (the filter rules are now shared) |
| R2 | **Behaviour change:** `/filter` now also returns `400` for a `dateTo` more than 1 day in the future |
| R3 | **Fix:** `pagination.hasMore` is now `false` on the last page when `offset` isn't a multiple of `limit` |

## 7. Known limitations (not defects)

- **Producer gaps:** until gkone-payment and gkone-remittances publish the missing `orderId`/`quoteId` references
  (story #37455), some steps won't link. For example, a declined card may show as its own row. This is why the flag
  ships off.
- **One hop:** the completion phase looks one step outside the window. A chain that crosses the window edge twice
  can still appear split.
- **`journeyKey` is not stable:** a quote-only journey is re-keyed once its order arrives. Use the step `id`s to refer
  to a journey's steps.
- **Remediation degrades:** if the error catalog is unavailable, rows still return with an "unavailable" remediation
  placeholder, the same as `/filter`.
- **Logs contain no party data:** one `Information` log per request records counts and elapsed time only.
