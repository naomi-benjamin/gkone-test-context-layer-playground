# Bug draft: TC 61 failed

> Raw draft from the Test Tracker. Ask Claude: *"Use the Bug Report Drafter skill on this file."*

## Source
- **Suite:** `playground/2026-10-22-outbound-v3/test-cases-from-ado.md`
- **Test case:** TC 61: Verify that a user cannot submit a zero value for the receive amount when requesting a quote
- **Tags:** Outbound V3, Remittances, Mobile
- **Run:** Init
- **Environment:** QA · build 2.5.0 (3461)
- **Status in run:** fail

## Pre conditions
- User has a KYC Tier 1 account with a non-expired ID
- User is in the JM or KY market
- Outbound is enabled for the user's tenant (Firebase and Cosmos)
- A known stable corridor that accepts receive amount input (not an intra-corridor selection) is confirmed working in the test environment

## Steps to reproduce
1. Log in to the GKOne application
2. Tap the "Send Money" icon on the home screen
3. Select the destination country, state, city, and payout method
4. Switch to the receive amount field and enter "0"
5. Tap "Get a quote"

## Expected result (step 5)
No quote is returned; an inline error is displayed adjacent to the receive amount field, not the send amount field; user is not taken to the quote review screen

## Actual result
I noticed that although I entered no amount (so it was zero) after entering all other required fields for the quote and accepting the T & C's that the continue button became enabled (which shouldnt have happened. should have stayed disabled with an inline err). But when I clicked it Instead of an in-line error the user saw an unexpected full screen generic error which was unexpected.

## Evidence
- [TODO: screenshots, logs, request/response, document IDs]
