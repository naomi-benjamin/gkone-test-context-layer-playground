# CSC Optimisation — Current CSR Use Cases

Context for Cognigy AI implementation: these are the existing manual CSR workflows that the AI agent will automate or assist with. Source: UC documents provided 2026-05-19.

---

## UC-DTB-001: Direct to Bank Customer Inquiry & Account Verification

**Summary:** CSR handles customer inquiries about Direct to Bank service — verifies registration, confirms bank account info, explains service usage, provides GK One card pickup/replacement guidance.

### Actors
- **Primary:** CSR
- **Secondary:** Customer (calling D2B queue)
- **Systems:** CMS, Transaxis/GK One, Ticketing (Freshdesk)

### Main Flow
1. CSR receives call (queue: "Direct to Bank")
2. Customer states issue (registration confusion, bank details, card pickup)
3. CSR clarifies request — explains D2B and GK One card are **two separate services**
4. CSR verifies customer in CMS using TRN → asks to confirm full name
5. CSR confirms registration status in CMS:
   - Whether registered for D2B
   - Bank details on file
   - GK One card status
   - Asks customer to confirm bank name
6. CSR educates customer on D2B usage:
   - Sender needs: bank name, branch, account number, account type
   - Transfers take 1–7 business days
   - Pickup transactions can be redirected to bank by calling in
7. CSR creates ticket (Subject: "Direct to Bank Registration – <Name>", TRN, name, inquiry)
8. If customer asks about card pickup:
   - Must pick up at location selected during registration
   - If can't visit that location → replace card through GK One app → choose new location
   - CSR checks Transaxis for card status (Active/Closed/Expired)
   - Closed/Expired → must replace before pickup
   - Locations not visible in app = no card inventory
9. End call
10. Update ticket properties: Country, Parish, Type=Direct to Bank, Issue Category=D2B Digital Registration, Issue Type=General Issue, Status=Resolved, Group=D2B Queue

### Business Rules
1. TRN required to verify identity
2. Must verify identity before sharing account details
3. D2B transfers: 1–7 business days depending on bank
4. GK One card must be Active before pickup
5. Closed cards require replacement via GK One app
6. Location not visible in app = no cards available
7. All interactions must be documented in a ticket
8. CSR must not provide card availability beyond what system shows

### SLA / Resolution
- General inquiry: resolved during call
- Registration support requiring escalation: 1–2 business days
- Card replacement: customer-dependent (immediate via app)
- D2B transfers: 1–7 business days depending on bank

---

## UC-WU-NAME-CHANGE-001: Name Modification Request Handling

**Summary:** CSR handles name modification requests from FLAs (Front Line Associates) calling on behalf of customers. Involves identity verification, WUPOS system lookup, name change processing, and ticket creation.

**Who initiates:** The **sending agent (FLA)** requests the change. The **receiver's name** is what gets modified on the transaction (e.g., sender misspelled receiver's name at time of send). Sender identity is verified, but the correction applies to receiver information.

### Actors
- **Primary:** CSR
- **Secondary:** Requesting FLA (agent at a WU location)
- **Systems:** CMS (CAMS), WUPOS, Freshdesk

### Main Flow
1. CSR receives call, gets FLA name, location, telephone number
2. CSR creates Freshdesk ticket ("Name Change – ")
3. CSR requests Tracking Number → searches in WUPOS (Western Union Customer & Agent Management System)
4. CSR verifies customer identity with FLA:
   - Sender name
   - ID type (passport, driver's license), ID number
   - Date of birth, ID expiration date
   - Transaction source location, date of transaction
   - Reason for name change, source of funds
5. CSR navigates to Receiver Information in WUPOS → gets correct first/last name spelling → confirms with FLA
6. CSR applies change in WUPOS:
   - Updates Receiver first/last name
   - Universal Reasons: Requestor=SENDING AGENT, Reason=CHN – CHANGE NAME, MT subject for refund=NO
   - Comments: "Name change – Processed as requested"
   - Clicks Change → Yes → "Change transaction is successful"
7. CSR confirms with FLA, asks them to verify on their end
8. CSR updates ticket (Subject: Name Change, Reason, Change Request, Principal, CHRG, TAX, TOTAL, MROC, Name Adjusted To)
9. **Repeat steps 3–7 for each additional modification** (separate ticket per modification)
10. CSR verifies in WUPOS using MTCN that changes applied
11. End call
12. Update ticket properties: Country, Parish, Creating ticket for=Agent, FLA Name, Type=CSB, Issue Category=CSB, Issue Type=Agent Query, Issue Sub-Type=Outbound Name, Transfer Type=Outbound, Contact=Location Requested Change, Status=Resolved, Group=Bahamas Queue

### Business Rules
1. Each modification requires a separate ticket
2. Must verify sender and receiver identity for all transactions
3. Reason for change must be documented in ticket
4. System must confirm successful change before ticket closure

### Required Data
- Tracking Number, Sender Name, Sender ID Type & Number, Sender DOB & ID Expiration Date
- Transaction Source Location, Source of Funds, Reason for Name Change
- Correct First and Last Name, Ticket ID

---

## UC-GK1-SEND-FAIL-001: Handling Failed GK One Send Transactions

**Summary:** CSR handles failed GK One Send transactions where customer used a linked bank card in the GK One app, transaction failed, no MTCN generated, but funds were deducted/pending on bank card. Requires escalation to Operations for refund.

### Actors
- **Primary:** CSR
- **Secondary:** Customer, GK One Operations Team, Team Leaders/Supervisors
- **Systems:** Freshdesk, CMS, Transaxis/GK One, Power BI Reports

### Preconditions
- Customer has: GK One account, completed a SEND attempt, linked bank card, valid TRN
- Customer can provide: TRN, amount attempted, bank used, date of attempt, screenshot
- Queue identifies call as: "GK-ONE Queue"

### Main Flow
1. CSR receives call (queue: "GK-ONE Queue")
2. Customer declares: attempted SEND, failed, no MTCN received
3. CSR clarifies and confirms: "you did a SEND in the app, it failed, no MTCN, correct?"
   - Also asks if first time doing GK One Send, and if previous was successful
4. CSR creates Freshdesk ticket ("GK ONE SEND FAIL - ")
5. CSR validates TRN in CMS → asks for full name confirmation → updates ticket
6. CSR verifies in Transaxis (Workplace → Individual Customer → Reference ID = TRN):
   - Asks: "What amount were you trying to send?" / "Which bank card did you use?"
   - Updates ticket with amount and bank
7. CSR places customer on hold (requests permission first)
8. CSR searches Transactions in Transaxis for failed transaction (no MTCN)
9. Applies business rules (see below)
10. Returns to caller: informs escalation to Operations, refund timeline 3–5 business days
11. Requests callback number
12. Requests screenshot via WhatsApp (1876-329-9402)
13. Completes ticket before escalation (TRN, name, amount, bank, date, phone, error description, screenshot placeholders)
14. Receives screenshot via Intelli Assign → searches customer number → retrieves error screenshots
15. Attaches screenshots to Freshdesk ticket
16. Sends escalation email to gkoneoperations@gkco.com (CC: gkrscsc@gkco.com, supervisors)
    - Includes: ticket number, error details, screenshots, customer info, refund request
17. Updates ticket properties: Country, Parish, Type=GK One, Issue Category=GK One Send, Issue Type=Outbound – Rejected, Status=Pending, Group=GK-ONE Queue
18. End call

### Business Rules
- **BR1:** GK One SEND transactions cannot be sent from wallet funds — must use a bank card
- **BR2:** No MTCN = Transaction Failure
- **BR3:** Failed transactions must be escalated to Operations
- **BR4:** Refund SLA = 3–5 business days
- **BR5:** Screenshots are mandatory for escalation

---

## Authentication (NiCE/Cognigy)

Not detailed in the use case documents but a separate feature: the customer must prove their identity to the AI agent before it accesses their data. Three authentication levels are being proposed:

- **Simple** — Email, phone number, TRN, document type, document number
- **Step Up** — OTP sent to phone number or email on file
- **Advanced** — To be proposed (FUTURE)

This maps to the identity verification steps in all three use cases (TRN + name confirmation), but adds structured tiers that the current manual process doesn't explicitly have. Testing implications: each auth level needs happy/unhappy paths, and the transition from Simple → Step Up (or Advanced) needs clear triggers.

---

## Relevance to Cognigy AI Implementation

The CSC Optimisation feature spans **all CSR workflows** — D2B is the first and highest-priority use case, but the Cognigy AI implementation will expand to cover additional use cases over time (name changes, failed sends, etc.).

These use cases represent the **current manual CSR workflows** that Cognigy AI will partially or fully automate:

| Use Case | Cognigy Coverage | Notes |
|----------|-----------------|-------|
| UC-DTB-001 | High — maps directly to SDD Voice/Chat use cases (identity verification, D2B status, service education, card status, ticketing) | Core scope of Cognigy implementation |
| UC-WU-NAME-CHANGE-001 | Low/None — complex multi-system modification requiring FLA interaction and WUPOS write operations | Likely remains human-handled; AI may route intent to live agent |
| UC-GK1-SEND-FAIL-001 | Low — requires screenshot handling, Operations escalation, multi-step investigation | Likely remains human-handled; AI may identify intent and escalate with context |

### Key observations for testing
- The **D2B use case** is almost 1:1 with the Cognigy SDD flows — test cases should validate AI replicates the CSR script accurately
- **Name Change** and **GK One Send Fail** are complex workflows that should trigger escalation — test that Cognigy correctly identifies these intents and routes to live agents with appropriate context
- All three share the same identity verification pattern (TRN → CMS lookup → name confirmation) — Cognigy must handle this consistently
- Ticketing fields and categories differ per use case — if AI creates tickets, it must categorize correctly based on intent
- The WhatsApp screenshot workflow (GK1 Send Fail) is explicitly out of scope for Cognigy — interesting edge case if customer asks about screenshots during AI interaction
