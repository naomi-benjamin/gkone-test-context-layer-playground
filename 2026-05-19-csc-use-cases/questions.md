# CSC Optimisation — Questions for Devs / PO / Architects

Generated 2026-05-19 from SDD review + use case analysis.

---

## Identity Verification

1. **Non-Jamaica jurisdictions:** Which specific jurisdictions are in scope at launch? What are the policy-defined identifiers for each? The SDD says "to be defined by GraceKennedy" — is this defined yet?
2. **National ID vs TRN:** Can a Jamaica customer verify with National ID alone, or is TRN the primary? The use cases only show TRN, but the SDD lists all three as accepted.
3. **Partial name matches:** How strict is the name confirmation? Exact match only, or does it allow for nicknames, middle name omission, spelling variants (e.g., "Ann-Marie" vs "Ann Marie")?
4. **Verification attempt limits:** The SDD says 2 clarification attempts for intent — but what about identity verification? How many failed identifier attempts before escalation? Is there a lockout?
5. **Pre-authenticated webchat:** What session data is passed from the portal to Cognigy? Just a customer ID, or full profile? What happens if the portal session expires mid-conversation?

## Intent Routing

6. **What are the 25 intents?** Is there a defined list? The SDD mentions up to 25 but doesn't enumerate them. Needed for test coverage planning.
7. **Confidence threshold:** What's the confidence score threshold for intent detection? Is it configurable? Different per intent?
8. **Multi-intent utterances:** What happens if a customer says something that maps to 2+ intents? (e.g., "I want to check my D2B status and also ask about my card")
9. **Mid-flow intent change:** Can a customer change their mind mid-flow? (e.g., starts D2B inquiry then says "actually I want to know about my card") How does the AI handle this?

## CMS Integration

10. **CMS response time SLA:** What's the expected latency for CMS lookups? What's the timeout threshold before the AI escalates?
11. **CMS data freshness:** When a customer registers for D2B, how quickly does CMS reflect the new status? Could a customer register and immediately call, only to be told they're not registered?
12. **Multiple profiles:** Can a TRN return multiple profiles in CMS? What happens if it does?
13. **CMS field availability:** Does CMS always have bank name populated for registered D2B customers, or can it be null/blank?

## Transaxis / GK One

14. **Card status values:** Are Active, Closed, and Expired the only possible statuses? What about Pending, Suspended, Blocked, etc.?
15. **Multiple cards:** Can a customer have multiple GK One cards? If so, which one does Transaxis return?
16. **Transaxis lookup method (chat):** How does the portal session identifier map to a GK One profile in Transaxis? Same TRN, or a different key?

## Ticketing

17. **Ticketing system confirmation:** The SDD says "ticketing system" generically; the use cases reference Freshdesk. Is the Cognigy integration targeting Freshdesk specifically, or is it Creatio, or something else?
18. **Ticket creation timing:** Does the AI create the ticket at the start of the interaction (like CSRs do) or at the end after resolution?
19. **Ticket for escalated calls:** When AI escalates to a live agent, does it create the ticket before handover, or does the CSR create it?
20. **Ticket field values:** The use case shows "Creating ticket for = Customer" — does the AI always set this, or does it vary by use case?

## Escalation / Handover

21. **Warm transfer availability:** What happens if no live agents are available when AI needs to escalate? Queue? Callback offer? Drop?
22. **Structured summary format:** What's the actual format of the "structured conversational summary" passed to the agent? JSON payload? Screen pop fields? Free text?
23. **Escalation for out-of-scope use cases:** The name change and failed send use cases are complex. When a customer calls about these, does the AI just immediately route to a live agent, or does it attempt identity verification first?
24. **Agent queue routing:** Different use cases route to different queues (D2B Queue, GK-ONE Queue, Bahamas Queue). Does the AI know which queue to route to based on intent?

## Voice-Specific

25. **Accent/dialect handling:** Jamaica has distinct speech patterns. How well does Deepgram STT handle Jamaican English / Patois? Has this been tested?
26. **DTMF fallback:** If the customer presses keypad digits instead of speaking, does the AI handle DTMF input? Or is there a "press 1 for..." fallback?
27. **Hold/mute behaviour:** In the CSR flow, customers are placed on hold during lookups. Does the AI have a "please wait" pattern while API calls execute? What's the timeout before it says something?
28. **Call drop handling:** If the customer hangs up mid-flow, does the AI still create/update the ticket?

## Chat-Specific

29. **Session timeout:** How long before an idle webchat session times out? What message does the customer see?
30. **Rich content:** Can the AI send links, buttons, or cards in webchat? (e.g., "Click here to register for D2B") Or is it text-only?
31. **File/screenshot handling:** In the failed send use case, CSRs request screenshots via WhatsApp. Can the webchat accept file uploads? If a customer tries to send an image in chat, what happens?

## Business Logic

32. **"Pickup can be redirected to bank":** Who actually performs this redirection? The SDD says AI informs the customer it's possible — but can the AI trigger it, or must the customer call back and speak to a CSR?
33. **Registration guidance:** When a customer isn't registered for D2B, the AI provides "high-level registration guidance." What exactly should this say? Is there approved copy?
34. **Service education content:** Is the D2B explanation (bank name, branch, account number, account type, 1-7 days) approved static content, or will the AI generate it dynamically?
35. **GK One card replacement via app:** Does the AI provide a deep link to the app, or just tell the customer to open it?

## Capacity & Performance

36. **105 session limit:** What's the expected concurrent usage during peak hours? Is 105 sufficient? What monitoring is in place to alert when approaching capacity?
37. **Graceful degradation:** When session limit is reached, what does the caller experience? Busy signal? Queue? Voicemail? Direct-to-agent?
38. **API latency under load:** Have CMS and Transaxis been load-tested for the expected volume (17,000 voice + 19,500 chat per month)?

## Go-Live & Testing

39. **Test environment:** Is there a non-production CMS and Transaxis environment with realistic test data for EUT?
40. **Static test data:** What test TRNs, customer profiles, and card statuses will be available? Do they need to be provisioned?
41. **Regression scope:** When Chat go-live happens after Voice, is there regression testing of Voice included, or is that a separate change request?
42. **Hypercare success criteria:** What metrics define "successful" hypercare completion? Containment rate? Escalation rate? CSAT?
