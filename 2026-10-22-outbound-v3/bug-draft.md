# Regression Summary

The Remittances regression for Outbound V3 was completed on build 2.5.0 (3461). Of 61 test cases, 56 passed, 1 failed, 1 was blocked, and 3 were not applicable. Overall, Outbound V3's core functionality proved stable.

The failed test uncovered BUG 38756: entering a receiver amount of zero displays a full-screen generic error instead of the inline validation message. The user is prevented from requesting a quote with an invalid amount, so there is no financial or compliance risk; however, the error creates friction and does not explain how to correct the input.

**Recommendation:** Proceed with UAT, and resolve BUG 38756 before release.

---

# Bug report: BUG 38756

Source: Test Tracker, suite `test-cases-from-ado.md`, TC 61, run "Init" (QA, build 2.5.0 (3461)).

---

TITLE
Outbound Quote Screen Shows a Full Screen Generic Error Instead of an Inline Error When the Receive Amount Is Zero

REPRO STEPS
1. Log in to the GKOne application as a KYC Tier 1 user with a non-expired ID in the JM or KY market (outbound enabled for the tenant).
2. Tap the "Send Money" icon on the home screen.
3. On the Request a quote screen, select the destination country, state, city, and payout method for a corridor that accepts receive amount input (not an intra-corridor selection).
4. Switch to the receive amount field and enter "0".
5. Tap "Get a quote".

NB: [Attach a screenshot or recording of the full-screen error, and the quote request/response showing the 400.]

EXPECTED BEHAVIOUR
- No quote is returned.
- An inline error is displayed adjacent to the receive amount field (not the send amount field), explaining in user-friendly language that the amount is invalid.
- The user stays on the Request a quote screen and can correct the amount.

This is the same pattern the quote screen already uses for other non-transactable amounts on both the send and receive sides.

ACTUAL BEHAVIOUR / DESCRIPTION OF DEFECT
- After tapping "Get a quote", the user is shown a full screen generic error instead of an inline error on the receive amount field.
- The quote request is sent with a payout (receive) amount of 0 and returns HTTP 400. The app does not handle this response as an amount validation error, and falls back to the full screen generic error.
- Comparison from the same run (QA, build 2.5.0 (3461)):
  - A zero **send** amount shows the expected inline error (TC 60 passed).
  - A **receive** amount below the corridor minimum shows the expected inline error on the receive field (TC 9, #34059, passed).
  - So the defect appears to be specific to a zero value in the receive amount field.

SYSTEM INFO
- Environment: QA
- App version: 2.5.0 (3461)
- Device / OS: N/A [fill in]
- Market and corridor used: N/A [fill in]

SEVERITY: Minor
JUSTIFICATION: Classified as Minor. The user is still stopped from requesting a quote with an invalid amount, so there's no financial or compliance risk. But the full screen generic error replaces the inline validation the quote screen is meant to show, which causes friction and doesn't tell the user what to fix.
