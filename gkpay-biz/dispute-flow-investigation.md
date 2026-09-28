# GK PayBiz — Dispute Flow Investigation

Session notes: 2026-04-24. Source: verbal walkthrough from user.

---

## Entities

| Entity | Role |
|---|---|
| **Customer** | Consumer who made the original payment via their card (e.g. Visa debit/credit issued by NCB) |
| **NCB** | Customer's issuing bank. Receives the dispute form from the customer. Routes dispute into Visa platform. |
| **Visa** | Card scheme. Mediates the dispute. Makes the binding decision on outcome. |
| **FGB (First Global Bank)** | GK Pay's acquiring bank. A GraceKennedy entity. Receives dispute notification from Visa. Subtracts the disputed amount from GK Pay's bank account when dispute is raised. Emails GK Pay Biz to kick off their response process. |
| **GK Pay Biz** | Merchant-side dispute handler. Collects evidence from the merchant and submits the merchant's case to Visa via FGB. Also manages the merchant wallet impact. |
| **Merchant** | The business that accepted the original payment. Respondent in the dispute — they do not initiate it. Wallet can go negative if dispute exceeds holdings. |

---

## Payment processing flow

Normal transaction — no dispute.

```
Customer presents card
    → GK Pay sends approval request to FGB (acquiring bank)
    → FGB requests authorisation from NCB (issuing bank)
    → NCB authorises and promises settlement
    → GK Pay credits the merchant wallet immediately (pending full settlement)
    → Transactions accumulate in merchant wallet throughout the day
    → End of day: merchant cashes out
        → 10% of payout held back by GK Pay for chargeback protection
        → 90% paid from GK Pay's FGB bank account to the merchant's chosen bank account
```

**Old world (Bill Express / BX):** Settlement goes to a fixed bank account on file. Merchant has no choice of destination.

**New world (GK PayBiz):** Merchant chooses their settlement destination bank account in the portal. This is a key difference.

**Merchant wallet:** A holding ledger inside GK Pay Biz — not a real bank account. Accumulates transaction value intraday. Can go negative (see dispute flow below).

---

## Dispute flow

Customer-initiated chargeback. The merchant is the respondent, not the initiator. The "dispute management" capability in GK PayBiz is about the merchant responding to a chargeback, not raising one.

```
Customer is unhappy with a transaction
    → Customer fills in dispute/chargeback form with NCB (their issuing bank)
    → NCB raises dispute on Visa dispute platform
    → Visa notifies FGB (GK Pay's acquiring bank)
    → FGB operations team subtracts the disputed amount from GK Pay's bank account immediately
    → FGB emails GK Pay Biz to notify them of the dispute
    → GK Pay Biz reflects the dispute against the merchant wallet
        → Merchant wallet is debited by the disputed amount
        → If merchant wallet balance < dispute amount: wallet goes NEGATIVE
    → GK Pay Biz portal: merchant sees dispute appear with status "Under Review"
    → GK Pay Biz contacts merchant to collect evidence (transaction records, receipts, proof of delivery, etc.) if neccessary
    → GK Pay Biz submits merchant's evidence to Visa via FGB

Visa decides:
    → Issuer (customer) wins:
        → Customer is refunded by NCB
        → Merchant wallet remains debited (loss is permanent)
    → Merchant wins:
        → Disputed amount is returned to GK Pay's bank account by FGB
        → Merchant wallet is restored (credited back)
```

**Dispute statuses in portal:** Under Review → Escalated → Resolved / Voided/Refunded / Closed without action

---

## Key implications for testing

- **Dispute is not merchant-initiated.** The merchant cannot "raise" a dispute against a transaction from their own side. The dispute appears in the portal because a customer went to their bank. Any UI that implies merchants initiate disputes needs scrutiny.
- **Merchant wallet can go negative.** This is a real system state, not an error. Tests should cover: wallet at zero balance when dispute arrives, wallet in negative state after dispute, cashout behaviour when wallet is negative.
- **10% chargeback hold is on every settlement.** The hold is not dispute-specific — it's a standing deduction from every payout. The held amount is what provides buffer against disputes. Tests should verify: the hold is shown in fee breakdown, the 90%/10% split is correct per settlement record.
- **Two distinct settlement models exist:** BX (old, fixed bank account) and PayBiz (new, merchant-chosen). Tests should clarify which merchants are on which model — they may coexist during transition.
- **FGB email triggers the GK Pay Biz dispute workflow.** The entry point into GK Pay Biz's dispute process is an inbound email from FGB, not an API call. This has reliability implications — if the email fails or is delayed, the dispute may not surface in the portal on time. Flag for integration testing.
- **Visa is the decision authority.** GK Pay Biz and FGB have no power to override Visa's decision. Portal outcome statuses must map correctly to Visa outcomes.
- **Negative wallet cashout behaviour is unknown.** If a merchant tries to cash out while the wallet is negative, what happens? Does the portal block cashout? Show a warning? Allow partial cashout? Flag as open question.

---

## Open questions

- What is the cashout behaviour when the merchant wallet is negative?
- Is the dispute entry point in the portal automatically created when FGB emails GK Pay Biz, or does someone at GK Pay Biz manually enter it?
- What is the SLA between FGB receiving the Visa notification and GK Pay Biz notifying the merchant?
- How does the merchant submit evidence through the portal — file upload? Text field? Both?
- Can a merchant view disputes that are still in progress at Visa (i.e. before a decision is made), or only completed ones?
- What happens if the merchant wallet goes further negative after a dispute (e.g. multiple concurrent disputes)?
- Is the 10% chargeback hold per-transaction or per-settlement batch?
- Does the portal distinguish between "Voided" and "Refunded" as separate terminal statuses, or is "Voided/Refunded" always shown together?
- Are all merchants (BX model and PayBiz model) visible in the same portal, or are they separated?

---

## Graduation candidates

These look like durable knowledge worth moving to feature docs once confirmed:

1. **Merchant wallet is a holding ledger, not a bank account; can go negative** → `domain-knowledge.md` (terminology / non-obvious behaviour)
2. **10% chargeback hold on every settlement payout; 90% to merchant-chosen bank** → `domain-knowledge.md` (settlement section)
3. **Dispute is customer-initiated chargeback; merchant is respondent, not initiator** → `domain-knowledge.md` (dispute section) and `known-issues.md` if any UI implies otherwise
4. **FGB is GK Pay's acquiring bank; NCB is typical issuing bank; Visa mediates** → `integration-points.md` (entity roles) and `domain-knowledge.md` (terminology)
5. **FGB email is the trigger for dispute entry into GK Pay Biz workflow** → `integration-points.md` (upstream dependencies / FGB)
6. **Old world (BX) uses fixed bank account; new world (PayBiz) merchant chooses settlement destination** → `domain-knowledge.md` (settlement section)
