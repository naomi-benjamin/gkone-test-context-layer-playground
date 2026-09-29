# PO conversation — Transaction Visibility (MVP)

Stories: 37333 customer & payment details · 32622 real-time list · 37331 export · 37325 filters · 37332 status
Goal: close the gaps that stop us writing expected results. Refs in brackets map back to `questions.md` / `state-model.md`.

---

## 1. Must-ask (blocks testing)

### Payment details (37333)
1. **Payment method.** The story asks for it, but the design doesn't show it yet. We know it's card vs GK One Balance. For card payments, should the merchant see the card brand and last 4 digits? *(Q4)*
2. **Which "reference"?** The design uses "Reference" for two things: the transaction reference, and the customer's unit/account number. Which one does the story mean? Is it the same reference the customer sees on their receipt? *(Q5)*
3. **Payers who aren't GKOne users** (payment links, website plug-in, POS). Where does the customer name come from? What should show when there's no name? *(Q1, Q2, Q12)*
4. **Personal data.** Should customer names be shown in full or partly masked, on screen and in the export? *(Q3)*

### Status (37332)
5. **Status names.** The story says Pending / Completed / Failed. The design shows Pending / **Success** / Failed / **Refund**. Which is final? *(Q49)*
6. **Failure reason.** The story asks for one, but the design doesn't show one yet. What wording should merchants see? Are there reasons we shouldn't show them, such as fraud-related declines? *(Q50, Q51)*

### Export (37331)
7. **PDF.** The story says CSV or PDF from the transactions page. The design has CSV there, and PDF only on Reports. Which is intended? *(Q15)*
8. **What's in the file?** Which columns? Are Pending and Failed rows included? Does it include the transaction reference and the full date, including the year? *(Q34, Q35)*

### Real time (32622)
9. **"Real time" vs "on refresh."** Does a new payment need to appear without the merchant refreshing? What delay counts as "instantly"? *(Q26, Q27)*

### Settlement & refunds (see `state-model.md`)
10. **Settlement labels.** The design shows **Not cleared / Awaiting payout / Settled / Not settled**. Can you confirm what each one means? *(Q-S1)*
11. **When does a payment count as "Settled"?** Once it's scheduled into a payout, or only once the payout has actually reached the bank? What does the merchant see if a payout fails? *(Q-S2)*
12. **Refunds.** The design lets merchants refund. Is that in scope for MVP? *(prototype review)* If it is:
    - Can a payment be refunded after it has settled? *(Q-S3)*
    - Can a payment with an open dispute be refunded? That risks paying the customer twice. *(Q-S5)*

### Access
13. **Who sees what.** Can every team member see customer details, export, and refund, or does it depend on role? Can we add an explicit AC that merchants never see another merchant's transactions? *(Q11, Q22, Q40)*

---

## 2. Quick confirms (the design already suggests an answer)

- There's no manual "mark for settlement". Successful payments join the next payout automatically. *(Q25)*
- **Total collected** = successful payments before fees, excluding pending, failed and refunded. If a payment is refunded later, does last month's total change? *(Q-T1)*
- Filters combine with AND. Amount is fixed bands, not a free range. *(Q41, Q42)*
- Which band does exactly **J$10,000** fall in? Both "J$1,000 – J$10,000" and "J$10,000 – J$50,000" include it in their labels.
- Search by customer name and reference is included, even though no story mentions it. *(Q45)*
- **Bill Express Retail Locations** and **Billexpress.com** appear as payment channels. Are they in scope? *(prototype review)*
- Failed payments are shown as negative amounts. Is that intentional?

---

## 3. If there's time

- Can a transaction sit in Pending indefinitely, or does it time out to Failed? *(Q29)*
- If a customer retries after a failure, is that a new transaction or an update to the failed one? *(Q53)*
- Partial refunds: are they needed, or is it full refunds only? *(Q-S6)*
- Is a disputed payment held back from payout until the dispute is resolved? *(Q-S7)*
- Do filters stay applied after a refresh or after navigating away? *(Q46)*
- Which time zone are dates shown in? *(Q33)*
- Should the fee shown follow the fee schedule by channel, or is it a flat 2%? *(prototype review)*
- Do the reports module and the emailed reconciliation reports also need customer details? *(Q13)*

---

## Not for the PO (take to dev)

- CSV escaping: special characters, formula injection, encoding *(Q20, Q21)*
- Whether the export filename date uses local time or UTC
- When a Pending row is created: at checkout start, or on submit *(Q28)*
- Which system the reference ID comes from: GKPS, Bill Express or GK Web Pay *(Q5, technical half)*
- Whether customer-data views and exports are audit-logged *(Q23; also compliance)*
- Whether a customer's name is saved at the time of payment or read live *(Q10)*

---

## Answers

<!-- Capture during the call. Durable answers get proposed into the feature docs afterwards. -->
