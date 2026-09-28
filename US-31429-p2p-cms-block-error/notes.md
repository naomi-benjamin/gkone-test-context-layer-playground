# US-31429 — P2P Error Handling: Receiver or Sender Blocked in CMS

Sprint: Remittances S34. State: Active (Implementation started). Risk: High (1). Story Points: 3.

## Story summary

P2P v2 improvement. When a P2P transaction is attempted and either the sender or receiver is blocked/flagged in CMS, a clear error screen must be displayed preventing the transaction from completing.

## Acceptance criteria

1. Given a user is attempting a P2P transaction, when the **receiver** is blocked/flagged in CMS, then a clear and specific error message is displayed on screen, preventing the user from sending to that receiver.
2. Given a user is attempting a P2P transaction, when the **sender** is blocked/flagged in CMS, then a clear and specific error message is displayed on screen, preventing the user from conducting a P2P transaction.

## Error screen (from mockup)

- Dev label: "Customer or Receiver is Blocked on CMS"
- Icon: red X
- Title: **"Unable to Process Payment"**
- Body: **"Unfortunately, this transaction cannot be sent at this time."**
- Primary CTA: **"Contact Support"** (red button)
- Secondary CTA: **"Back to Home"** (link)

The message is identical regardless of whether it is the sender or receiver who is blocked. The user is not told which party is blocked or why — this is intentional (avoids exposing CMS block details to end users). Resolution path is via Support only.

## Key context

- CMS block allows the flow to START but prevents COMPLETION — the error surfaces at the transaction processing stage, not at entry.
- This is a V2-only improvement. V1 did not reliably surface this error state.
- Both sender-blocked and receiver-blocked cases show the same screen.