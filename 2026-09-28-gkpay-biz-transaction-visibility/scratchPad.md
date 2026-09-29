# Transaction Visibility & Tracking (MVP) 

Merchants need a clear, real-time view of all payment activities across their account. This empowers them to monitor cash flow independently without relying on GKPS staff for updates. 
- View all incoming transactions in real time 
- Filter transactions by date, payment channel, or amount 
- Download or export transaction history reports 
- View transaction status (pending, completed, failed) 
- Which customer made payment & relevant payment details. 

### Notes

- what does marked for settlement mean again?
  - Nothing explicittly states pending or refunded payments should not be "marked for settlement"
    - Can a refund be applied for something thats already been settled?
  - __This is all basically about legal/illegal state transitions__
- Preventing a user/merchant from seeing transactions that are not associated with them
- What are the different settlement states
  - Seeing "Awaiting payout", "Not cleared", "Not settled". What do these mean?
- Reference is what ID? 
  - Is it any of these: the GKPS transaction ID, the Bill Express reference, the GK Web Pay reference, or a merchant invoice/order reference. 
  - For reconciliation, is it the same ID the customer sees on their receipt email?
- Where do we get the name of the payer from with the Physical Terminals?
  - Seethes a bit into the guest question from [questions]
- Whats total collected?
  - is this the total amount that has been paid less refunds, failures & pending but including settlements?
- 