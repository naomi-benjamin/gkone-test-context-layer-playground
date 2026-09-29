# Transaction state model — draft for PO review

Built from the scratchPad notes, plus what the prototype does (design reference only, see `prototype-review.md`). Everything below needs PO confirmation.

## Two separate states per transaction

**Payment status:** Pending · Success (Completed in the stories) · Failed · Refund
**Settlement status:** Not cleared · Awaiting payout · Settled · Not settled

In the prototype, settlement status is **derived**. The merchant never sets it:

| Payment status | In a payout batch? | Settlement status shown | Prototype helper text |
|---|---|---|---|
| Pending | — | Not cleared | "Not cleared yet. Once it clears it joins your next payout." |
| Success | No | Awaiting payout | "Not yet settled — it will be included in your next payout." |
| Success | Yes | Settled | "Included in payout GKPB-STL-xxxx · <payout status>" |
| Failed | — | Not settled | "Not settled." |
| Refund | No | Not settled | "Not settled." |
| Refund | **Yes** | **Settled** | ⚠ see Q-S4 |

So "marked for settlement" isn't a merchant action. A Success transaction is put into the next payout automatically.

## Payment status transitions

| From → To | Allowed? | Notes |
|---|---|---|
| Pending → Success | Expected yes | Payment clears |
| Pending → Failed | Expected yes | Declined, or times out (Q29) |
| Success → Refund | Yes in prototype | Merchant action. Allowed **before and after settlement**. If already settled, the amount is taken out of the next payout |
| Success → Failed | ? | Reversal or chargeback? (Q52) |
| Pending → Refund | Should be **no** | Nothing has been collected yet |
| Failed → anything | Should be **no** | A retry should be a new transaction (Q53) |
| Refund → anything | **No** | Prototype: "Refunds cannot be undone." |

## Questions for PO

- **Q-S1: What do the settlement statuses mean?** Confirm the four labels and definitions above, especially where "cleared" ends and "awaiting payout" begins.
- **Q-S2: Settled while the payout itself is Scheduled or Failed.** Payout batches have their own status: Scheduled, Completed or Failed. The prototype shows a transaction as "Settled" as soon as it's in any batch, **even when that payout is Scheduled or Failed.** Should a transaction only count as Settled once its payout is Completed? What does the merchant see when a payout fails?
- **Q-S3: Refund after settlement.** Is it allowed? The prototype says yes, deducted from the next payout. What if there's no next payout, or the next payout is smaller than the refund?
- **Q-S4: A transaction can show Refund + Settled.** A refunded payment that was already paid out keeps "Settled". Is that correct, or should it show a separate state such as "Refund deducted from payout X"?
- **Q-S5: Refund while a dispute is open.** In the prototype, "Raise a dispute" disappears once a transaction is disputed, but "Refund this payment" stays. Can a merchant refund a disputed payment? A refund plus a lost chargeback would pay the customer twice.
- **Q-S6: Partial refunds.** The prototype only offers a full refund. Is that intended?
- **Q-S7: Can a disputed transaction still be settled?** Or is it held back from payout until the dispute is resolved?

## Dashboard totals (scratchPad: "Whats total collected?")

Prototype tooltip: **"Total collected: sum of every successful payment in the selected period, before fees are deducted."**

- That means Success only, **gross** (before fees), and it includes both settled and awaiting-payout payments. Pending, Failed and Refund are left out.
- **Q-T1:** A payment refunded *after* the period closes leaves that period's total, so last month's number changes. Is that acceptable?
- **Q-T2:** "Pending Settlement" is described as "funds collected but not yet paid out". Does it count Success + Awaiting payout only, or Pending (Not cleared) too? The tooltip and the settlement page's "Total balance" ("including payments still clearing") read differently.
- **Q-T3:** Do Total collected, Pending Settlement and Settled This Month add up for the same period? If they should, that's a good reconciliation test.
