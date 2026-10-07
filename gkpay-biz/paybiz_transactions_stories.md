# PayBiz Transactions Stories

Readable version of `paybiz_transactions_stories.csv`. All five stories share **Parent 32611** — this maps to **Workstream 5: Merchant View Transactions** in `paybiz_release_1_scope.md` (merchant-facing transaction list + balance view).

All stories are `State: New`, unassigned, no tags, unless noted otherwise.

---

## Parent 32611 — Merchant View Transactions

| ID | Title |
|---|---|
| 32622 | Real-Time Transaction Dashboard |
| 37325 | Transaction Filtering |
| 37331 | Transaction Export |
| 37332 | Transaction Status Tracking |
| 37333 | Customer Payment Details |

### 32622 — Real-Time Transaction Dashboard
- **As a:** merchant
- **I want to:** view all incoming transactions in real time
- **So that:** I can monitor cash flow independently
- **AC:**
  - Given a customer makes a payment, when I refresh or open the Transactions page, then the transaction should appear instantly.
  - Given a transaction is pending, when I view the dashboard, then its status should show as "Pending" until completed.

### 37325 — Transaction Filtering
- **As a:** merchant
- **I want to:** filter transactions by date, payment channel, or amount
- **So that:** I can analyze specific sets of payments
- **AC:**
  - Given I select a filter (e.g. date range, channel, amount), when I apply it, then only matching transactions should display.
  - Given I clear filters, when results reload, then all transactions should be visible again.

### 37331 — Transaction Export
- **As a:** merchant
- **I want to:** export transaction history reports
- **So that:** I can reconcile my records externally
- **AC:**
  - Given I click "Export," when I select CSV or PDF, then the file should download with all transaction details.
  - Given I export filtered results, when the file downloads, then only the filtered transactions should be included.

### 37332 — Transaction Status Tracking
- **As a:** merchant
- **I want to:** see the status of each transaction (pending, completed, failed)
- **So that:** I can confirm payment outcomes
- **AC:**
  - Given a transaction is processed, when I view its entry, then the status should reflect its current state (Pending, Completed, Failed).
  - Given a failed transaction, when I click details, then I should see error information or reason for failure.

### 37333 — Customer Payment Details
- **As a:** merchant
- **I want to:** see which customer made a payment and relevant payment details
- **So that:** I can confirm and reconcile transactions
- **AC:**
  - Given I open a transaction entry, when details expand, then I should see customer name, payment method, reference ID, and payment channel.
  - Given I download/export, when I open the file, then customer details should be included in the report.

---

## Cross-story observations

- **Conflicts with the current Release 1 scope doc:** `paybiz_release_1_scope.md` (Workstream 5) currently scopes merchant transaction view as **read-only — list + balance only**, explicitly calling out "no exports/filters/actions mentioned" as out of scope. These stories (37325 Filtering, 37331 Export) directly contradict that read — either the scope doc is stale/too conservative, or these two stories are not actually part of Release 1 and belong to a later release. **Flag to the user/PO before test planning.**
- **Status taxonomy:** 37332 defines three transaction states — Pending, Completed, Failed. Worth checking this is consistent with the status terminology used elsewhere (e.g. 32622 only mentions "Pending").
- **No balance-view story here:** the scope doc's Workstream 5 mentions a balance view alongside the transaction list, but no story in this set covers it directly — may be covered by 32622's dashboard, or may be a documentation gap.
- **Export formats:** 37331 specifies CSV and PDF only — no mention of other formats (e.g. Excel).
- [UNCERTAIN] None of these stories mention pagination, sorting, or performance expectations for merchants with high transaction volume — worth raising as a gap if real-time + filtering + export are all in scope.

---

*Source: `paybiz_transactions_stories.csv` (same folder). This file is scratch/playground content — not authoritative feature documentation.*
