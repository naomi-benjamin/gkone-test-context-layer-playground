# Prototype review — /transactions

Source: https://gk-pay-biz.vercel.app/transactions, reviewed 2026-09-28 by reading the client JS bundle (`index-EXe_1hck.js`). Not clicked through. All data is client-side mock data, so nothing here says anything about the real backend, live updates or timing.

Treat this as a design reference, not a spec. Where it differs from a story, that's a question for the PO, not automatically a bug.

## What the page has

### List
- Status tabs: **All transactions · Successful · Pending · Refunded · Failed**
- Columns: Date · Customer (with unit/account underneath) · Reference · Status · Amount · Settlement · Channel · Action
- Default sort is newest first. Date, customer and amount are sortable.
- **Page size is 5.**
- Date column shows "Apr 24", with no year and no time.
- Failed rows show a **negative** amount (e.g. `-J$1,250.00`).
- Can switch between list view and card view.

### Filters
- Search: customer, channel, amount, date, reference
- Channel: options are built from the channels present in the data, not from the merchant's active channels
- Source: manual / QR / payment link
- Amount bands: `Under J$1,000` · `J$1,000 – J$10,000` · `J$10,000 – J$50,000` · `Over J$50,000`. Each band includes its lower bound and excludes its upper bound, and the amount is compared as an absolute value.
- Date range presets: All time · Last 7 days · Last 30 days · Last 90 days · This month · Custom. Custom runs from 00:00 on the start date to 23:59:59 on the end date, both included, in browser local time.
- All filters combine with AND. There is a clear-all action, and each facet can also be cleared on its own.

### Channels (7)
Payment Links · QR Codes · Website and Mobile Payment Plug-In · Physical Terminal POS (FGB) · Mobile Soft POS · **Bill Express Retail Locations** · **Billexpress.com**

### Transaction details (side panel opened by clicking a row, not an inline expand)
- Amount, status badge, date and time
- Reference (transaction reference, generated from the ID)
- Customer
- Unit / account (optional, and its label can be customised)
- Channel
- Source, with a link to the QR code or payment link it came from
- Fee (2.00%) and Net to you, **Success only**
- Settlement box: "Included in payout X" / "Not yet settled — it will be included in your next payout" / "Not cleared yet" / "Not settled"
- Dispute box, if the transaction has been disputed
- Footer, Success only: **Raise a dispute** (hidden once disputed) and **Refund this payment** (depends on permission). Refunding a settled payment is taken out of the next payout.

### Export (transactions page)
- One **Export** button that downloads **CSV only**: `transactions-YYYY-MM-DD.csv`
- Exports every filtered row, not just the current page.
- Header row: Date, Customer, Unit / account, Status, Amount, Fee, Net, Settlement, Channel
- UTF-8 with BOM. Quotes, commas and line breaks are escaped. **Formula-injection characters are not escaped.**
- PDF exists only on the separate Reports page ("Transaction statement" and others).

## Compared with the stories

| Story / AC | Prototype | Gap |
|---|---|---|
| 37333 AC1: customer name, **payment method**, reference ID, channel | Name, reference, channel shown | **No payment method field anywhere** (neither card vs GK One Balance nor card brand/last 4) |
| 37333 AC1: "details expand" | Side panel | Wording only; confirm which is intended |
| 37333 AC2: customer details in export | Customer name exported | No transaction reference ID in the export (see the export bug below) |
| 32622 AC2: "Pending" until completed | Pending tab and badge | — |
| 37332: Pending / **Completed** / Failed | **Success** / Pending / **Refund** / Failed | Label mismatch (Completed vs Success). Refund is a fourth status |
| 37332 AC2: failure reason on failed transactions | Nothing shown for Failed | **Failure reason missing** |
| 37331 AC1: CSV **or PDF** | CSV only on the transactions page | **No PDF export from the transactions page** |
| 37331 AC2: only filtered rows exported | Exports all filtered rows | — |
| 37325: date / channel / amount filters | All present, plus source and search | Amount is fixed bands, not a free range |
| 37325 AC2: clear filters | Clear-all present | — |

## Design points to raise

The prototype is design-only, so these are questions about the design, not defects.

1. **Two different things are both called "Reference".** In the list, the Reference column shows the customer's unit/account. In the detail panel, "Reference" is the transaction reference. Which one does 37333 mean, and which one goes in the export? Reconciliation needs the transaction reference.
2. **The date column has no year or time** ("Apr 24"). Is the export date format specified separately? Reconciling across a year boundary needs the full date.
3. **Amount band labels overlap.** "J$1,000 – J$10,000" and "J$10,000 – J$50,000" both mention 10,000. Which band does exactly J$10,000 belong to?
4. **Failed payments show negative amounts.** A payment that failed never brought money in. Is the minus sign intended?
5. **The fee is shown as 2% on every transaction.** The fee schedule page lists different rates for some channels: POS is 2% + J$15, international cards 3.25%. Should the detail panel follow the schedule?

## Test in the real build (risks the prototype hints at)

- Export column alignment. Every header should match its data, especially the optional unit/account column.
- The export filename date should use Jamaica local time, not UTC. An export after 7 pm local shouldn't carry tomorrow's date.
- Amount band boundaries: J$999.99 / 1,000 / 9,999.99 / 10,000 / 49,999.99 / 50,000.
- The amount filter applied to Failed or Refund rows. Does it use the absolute value?
- CSV formula injection (Q21).

## Answers the prototype suggests (confirm with the PO; the prototype isn't the spec)

- Q25 (mark for settlement): **no manual action**. Settlement is automatic, and Success rows join the next payout.
- Q41 (how filters combine): **AND**.
- Q42 (amount filter type): **fixed bands**.
- Q43 (date filter): presets plus custom, both ends included, browser local time.
- Q44 (channel filter options): built from channels in the data, not the merchant's active channels.
- Q45 (search by reference/name): **search exists** and covers reference and customer name.
- Q47 (clearing filters): clear-all plus individual facets.
- Q49 (other statuses): Refund is its own status. A dispute appears as an extra box on the transaction, not as a status.
- Q32 (sort and paging): newest first, 5 per page.

## New questions from the prototype

- **Bill Express Retail and Billexpress.com are channels.** Our docs list 5 channels. Are these 2 in scope for the merchant portal?
- **"Refund this payment" is a merchant action.** No story covers it. Is it in scope, and which roles can use it?
- **The payment method field is missing.** Is that a prototype gap, or has the field been dropped from 37333?
- **Is "Success" or "Completed" the final label?**
