# Bug Report Draft

## TITLE
New Transaction Summaries Endpoint (`/summaries/filter`) Returns Zero Results for the Documented "Quote → Order → Transaction" Linked Journey Example

## REPRO STEPS

1. In QA, identify a customer (`userId: a0b358f3-646a-4889-b2aa-5eb92e1f0aff`, TIN `129299260`) with a completed outbound remittance consisting of **three** linked transaction records, forming exactly the transitive linking chain the feature spec itself uses as its canonical example ("quote → order → card charge forms one journey"):

   | Step | id | `activityKind` | `productType` | `correlationId` | Linking reference | `status.current` | `createdUtc` |
   |---|---|---|---|---|---|---|---|
   | Quote | `7d43be96-9493-cab3-2f18-6fd2475629c7` | `INQUIRY` | `remittance.outbound-quote` | `33114ee4-a9a7-4901-b49e-fc0a833020ab` (self) | `QuoteId: 33114ee4-...` | `COMPLETED` | 2026-09-28T14:38:18Z |
   | Create Order | `3072cf8a-e850-87d2-0e50-b0a8207259e3` | `ATTEMPT` | `remittance.outbound` | `ff86a921-3f71-46f5-9bf2-b23a11cb6c4a` | `QuoteId: 33114ee4-...`, `PaymentOrderId: 5087168a-b142-4eb4-b013-d1012d558674` | `COMPLETED` | 2026-09-28T14:39:06Z |
   | Confirm (headline) | `7175a4ee-b6b9-00e6-defb-080127d672a7` | `TRANSACTION` | `remittance.outbound` | `ff86a921-3f71-46f5-9bf2-b23a11cb6c4a` | `QuoteId: 33114ee4-...`, `PaymentOrderId: 5087168a-b142-4eb4-b013-d1012d558674`, `MTCN: 8233513741` | `SETTLED` | 2026-09-28T14:39:58Z |

   The Quote step links to the Create Order step via the shared `QuoteId` token (`33114ee4-...`), and Create Order links to the Confirm step via shared `correlationId` (`ff86a921-...`) — a two-hop transitive chain explicitly named in the spec: *"Linking is transitive, so quote → order → card charge forms one journey."*

2. Confirm all three records are individually retrievable via `GET /api/v1/users/{userId}/Transactions/{id}` — each returns `200 OK`.

3. Confirm the data is correctly indexed and matchable via the existing, already-live endpoint: `POST /api/v1/users/{userId}/transactions/filter` with `taxIdentificationNumber: 129299260`, `references: [{key: PaymentOrderId, value: 5087168a-b142-4eb4-b013-d1012d558674}]`, `productTypes: [remittance.outbound]`, `statuses: [COMPLETED]`, `dateFrom: 2026-09-01T00:00:00Z`, `dateTo: 2026-09-30T23:59:59Z` → returns `200 OK` with 1 matching record (the Create Order step).

4. `POST /api/v1/users/{userId}/transactions/summaries/filter` with equivalent filters: `taxIdentificationNumber: 129299260`, `references: [{key: PaymentOrderId, value: 5087168a-b142-4eb4-b013-d1012d558674}]`, `journeyTypes: [remittance.outbound]`, same `dateFrom`/`dateTo`, trying each of:
   - `statuses: [COMPLETED]`
   - `statuses` omitted entirely
   - `statuses: [SETTLED]`

   All three variants return `200 OK` with `data: []`, `pagination.totalRecords: 0`.

## EXPECTED BEHAVIOUR

Per rule R3 ("All headline steps succeeded → `SETTLED` if any settled, else `COMPLETED`"), and per the journey-type normalization already documented for quote-only journeys in scenario D (a quote step's `productType: remittance.outbound-quote` rolls up to `journeyType: remittance.outbound`), these three linked steps should resolve to a single journey row with `journeyType: remittance.outbound` and rolled-up `status: SETTLED`, returned when queried with `statuses: [SETTLED]` or no `statuses` filter.

## ACTUAL BEHAVIOUR / DESCRIPTION OF DEFECT

- `/summaries/filter` returns zero results under every `statuses` variation tested, including the correct rolled-up value (`SETTLED`) and no status filter at all.
- The same base filter criteria (TIN, `PaymentOrderId` reference, product type, date window) succeed immediately against the older `/transactions/filter` endpoint against the same underlying data — ruling out a data-presence or indexing problem.
- The linked chain present in this data is not an edge case constructed to find a gap — it is structurally identical to the spec's own named example of transitive linking ("quote → order → card charge"), including the detail that the quote step carries a different `correlationId` from its two siblings and links in only via the shared `QuoteId` reference token. This rules out "journey type mismatch" or "non-transitive linking" as explanations and points at a defect specifically in how the new endpoint's completion/linking scan assembles multi-hop (>1 shared-token) chains, or in how it emits results once assembled.
- Note: this could be a separate contributing issue — `qa-test-guide.md` (section 3) lists a `TransactionsV2` indexing policy as a required environment prerequisite, documented in a file (`indexing-policy-completion-query.md`) that does not exist anywhere in this repo. The successful `/filter` query against the same data makes this an unlikely root cause, but it's worth the dev confirming that prerequisite was applied in QA, since there's no visibility into it from this repo.

## SYSTEM INFO

- Environment: QA (`[QA] Internal` Postman workspace, `{{ordersBaseUrl}}`)
- Endpoint under test: `POST /api/v1/users/{userId}/transactions/summaries/filter`
- Comparison endpoint: `POST /api/v1/users/{userId}/transactions/filter` (existing, shared filter logic)
- Feature: #37403 (Filter Transaction Summaries), branch `feature/37403-add-filter-transactions-summary-endpoint`
- App/service build version: N/A — please fill in before raising

## SEVERITY: Major

**JUSTIFICATION:** Classified as Major rather than Critical — a workaround exists (Customer Support can still use the older `/filter` endpoint and manually correlate steps by reference), so this doesn't meet the Critical bar of "no effective workaround" or a financial/compliance/security breach. However, it is a severe case within the Major tier: the failing scenario is not a constructed edge case but the exact "quote → order → card charge" transitive-linking example the feature specification itself uses to define the feature's core behavior. The endpoint's primary purpose — resolving a cleanly linked journey without manual step correlation — is non-functional for the textbook case it was designed around.

---

*Context applied: [qa-test-guide.md](qa-test-guide.md) sections 2 (linking/transitivity), 3 (environment prerequisites, incl. missing `indexing-policy-completion-query.md`), 5 (rollup rule R3), and 6 (acceptance scenario D, journey-type normalization). Live QA repro data pulled via Postman against `[QA] Internal > gkone-customer-support` collection (`Get Transaction Journey`, `Get User Transaction by ID`, and `NICE-Integration > filter-transactions` requests).*
