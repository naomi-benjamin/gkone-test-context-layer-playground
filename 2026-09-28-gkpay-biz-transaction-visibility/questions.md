# Open questions — GK PayBiz transaction visibility stories

Grouped by story. Blocking = the expected result for a test case can't be written without the answer.
Stories: 37333 (customer details), 32622 (real-time list), 37331 (export), 37325 (filters), 37332 (status).

## Answered by the other stories
- ~~Which export formats?~~ → CSV and PDF (37331 AC1).
- ~~Does export respect active filters?~~ → Yes, only filtered transactions (37331 AC2).
- ~~Which export does 37333 AC2 mean?~~ → Presumably the 37331 transaction-history export. Still open: do the reports module (capability 5) and emailed reconciliation reports also need customer details? (Q13)
- ~~Do failed transactions show extra detail?~~ → Yes, the failure reason (37332 AC2). What is shown for Pending is still open (Q8).

---

## 37333 — Customer & payment details

### Blocking
3. **Is the name shown in full or masked?** The same question applies to any other personal data. Customer names are personal data under the Jamaica Data Protection Act. Who: PO / compliance
4. **How much card detail does "payment method" show?** Answered 2026-09-28: method means card vs GK One Balance/wallet, and channel means QR, payment link, SDK/plugin, POS or Soft POS. Still open: does the card method show the card brand and last 4 digits? Is the full card number (PAN) guaranteed never to appear, in the UI or the export? For GK One Balance, is any account identifier shown? Who: dev
5. **Which reference ID is shown?** Candidates: the GKPS transaction ID, the Bill Express reference, the GK Web Pay reference, or a merchant invoice/order reference. For reconciliation, is it the same ID the customer sees on their receipt email? Who: dev
6. **Is the field list complete?** The narrative says "relevant payment details", but the AC names only 4 fields. Are amount, date/time, status and fees also in the expanded view, or are those already on the collapsed row? Who: PO
7. **"Payment Channels" is plural.** Is that a typo, or can one transaction have more than one channel? Who: PO

### Behaviour by state
8. **What does the expanded view show for a Pending transaction?** Is there a reference ID and a confirmed customer yet? Who: dev
9. **How do refunded, voided and disputed transactions appear in the detail view?** Is any dispute indicator shown? Who: PO
10. **Is the customer name a snapshot taken at payment time, or is it read live?** If a GKOne user changes their name later, do old transactions change? Snapshot is expected for reconciliation. Who: dev

### Access
11. **Can every merchant team member role see customer details, or only some?** Multi-user support is in scope for the portal. Who: PO

### Guest / non-GKOne payers
1. **Where does the customer name come from for each channel?** QR (Scan to Pay) payers are GKOne users, so a profile name exists. Payment link, website/app plugin (SDK), POS and Soft POS payers may be guests or card-only. Is the name taken from the GKOne profile, the name entered at checkout, or the cardholder name? Who: PO / dev
2. **What shows when no customer name is available?** Options: blank, "N/A", "Guest", or the field hidden. The UI and the export should behave the same way. Who: PO
12. **Do POS (Tier 4) transactions appear in the portal at all?** POS is handled through bank partners (FGB/NCB). If they do appear, what customer data comes back from the bank side? Who: PO / dev

### Export (AC2)
13. **Do other exports need customer details too?** Does the reports module (capability 5) include them? Do the emailed automated reconciliation reports? Who: PO
14. **Does "customer details" mean the same 4 fields as AC1, or more or less?** What are the column names and their order? Who: PO
17. **Is masking the same in the export as in the UI?** Who: PO / compliance

---

## 32622 — Real-time transaction list

### Blocking
26. **"Real time" or "on refresh"?** The narrative says real time. The AC says "when I refresh or open the Transactions page". Is a manual refresh or page load enough? Or should new transactions and status changes appear on an open page without refreshing (polling or push)? Who: PO / dev
27. **"Instantly" can't be tested as written.** What is the target delay between the customer's payment and the row appearing? For example, ≤ N seconds after the payment is authorised. This also answers the scan-to-pay VERIFY on the same delay. Who: dev
28. **When is a Pending row created?** When checkout starts, or once the payment is submitted to GK Web Pay? Does an abandoned checkout ever show up as a row? Who: dev
29. **How long can a transaction stay Pending?** Is there a timeout that moves it to Failed, or can a Pending row sit indefinitely? Who: dev

### Scope
30. **"Transactions page" (AC1) vs "dashboard" (AC2).** Are these the same screen? If not, must status be consistent on both? Who: PO
31. **What does "all incoming" cover?** Are refunds or reversals listed as separate rows or shown on the original? Who: PO
32. **What are the default sort order and pagination?** Newest first? What is the page size? Who: PO
33. **Which time zone are timestamps shown in?** Jamaica local time (UTC-5, no daylight saving)? This matters again for Phase 2 markets. Who: dev

---

## 37331 — Export transaction history

### Blocking
34. **What does "all transaction details" mean?** Which columns are included, and in what order? Does the export include 37333's customer details and 37332's failure reason? Who: PO
35. **Which statuses are exported?** Are Pending and Failed rows included, or only Completed? For reconciliation, Failed rows can clutter the file, but leaving them out hides them. Who: PO
36. **What does an export with no filters contain?** The entire transaction history? Is there a maximum date range? Who: PO / dev

### Behaviour
18. **How is an export with no results handled?** Our test-patterns expect an empty file or a clear message, not an error. Please confirm. Who: dev
37. **What is the file name convention?** Does it include the merchant name or ID and the date range? Who: PO
38. **How are amounts formatted?** Are currency and decimal places shown? Is there a totals row? A totals row helps reconciliation. Who: PO
39. **Does the PDF match the CSV exactly?** Same rows and same fields, or is the PDF a summarised layout? Who: PO
40. **Can every team member role export?** This matters because the file contains customer personal data. Who: PO

### Data handling (likely missed by dev)
20. **Special characters and delimiters.** Are names with accents, apostrophes (O'Brien), commas or line breaks quoted and encoded correctly? Is the CSV UTF-8, and does it open cleanly in Excel? Who: dev
21. **CSV formula injection.** Are cells escaped when a name starts with `=`, `+`, `-` or `@`? Customer names are external input. Who: dev / security

---

## 37325 — Filters

### Blocking
41. **How do filters combine?** The story title says "date, payment channel, **or** amount". When several filters are applied, are they combined with AND? AND is expected. Who: PO
42. **What kind of amount filter is it?** An exact amount, a min/max range, or preset bands? What validation applies: zero, negative, decimals, non-numeric input, min > max? Who: PO / dev
43. **How does the date filter work?** Are both ends of the range included? Which time zone? Is there a maximum range? Can future dates be picked? What happens when from > to? Is the filter on the payment time or the completion time? Who: dev
44. **What options does the channel filter offer?** All channels, or only the ones this merchant has active? Can the merchant pick more than one? Who: PO

### Scope
45. **No status filter, and no search by reference ID or customer name.** For reconciliation, searching by reference ID is the most likely need. Is it deliberately out of scope? Who: PO
46. **Do filters persist?** After a page refresh, or navigating away and back? Who: PO
47. **Does "clear filters" reset everything at once?** Or can each filter be removed on its own? Who: PO
48. **Filters vs live updates.** If a new transaction arrives while filters are applied, does it appear only when it matches them? Who: dev

---

## 37332 — Transaction status

### Blocking
49. **Only three statuses are listed.** Where do Refunded, Voided and Disputed transactions fit? Are they shown as a separate status, or as a label on a Completed transaction? Who: PO
50. **Where do failure reasons come from, and how are they worded?** Is there a mapping table from GK Web Pay decline codes to merchant-facing text? No raw error codes or internal system references should show. Who: dev
51. **Which failure reasons can a merchant see?** Showing some decline reasons to a merchant, such as "insufficient funds" or fraud-related declines, may be restricted by card scheme or privacy rules. Is a generic "Declined by issuer" used for some codes? Who: PO / compliance

### State transitions
52. **Which transitions are allowed?** Expected: Pending → Completed and Pending → Failed only. Can a Completed transaction ever become Failed, for example after a reversal? Who: dev
53. **Customer retries after a failure.** Is the retry a new transaction row, or does the Failed row update? This matters for reconciliation: two rows for one real payment. Who: dev

---

## Cross-cutting / missing ACs
22. **No negative or isolation AC.** Customer details must never appear across merchants. Can this be added as an explicit AC? Who: PO
23. **Audit logging.** Are views and exports of customer personal data logged? Who: dev / compliance
24. **Latency of customer details.** Are customer details available as soon as the transaction row appears, or can they fill in later? This links to Q27. Who: dev
25. **Can merchants mark transactions for settlement?** Current docs describe settlement as view-only: GKPS pays out and the merchant sees scheduled and completed payouts. If a "mark for settlement" action does exist, which transactions are eligible? Expected: Completed only. Pending isn't final yet, and a Failed payment collected no funds. And what happens with Completed transactions that are already settled, in an open dispute, or refunded/voided? Who: PO
54. **Status labels must match everywhere.** The list, the expanded detail, the dashboard and both export formats should all use the same status names. Who: PO
55. **Where does the merchant see fees?** None of the five stories mention fees. The settlement capability covers a per-transaction fee breakdown. Confirm fees are out of scope for these stories. Who: PO
