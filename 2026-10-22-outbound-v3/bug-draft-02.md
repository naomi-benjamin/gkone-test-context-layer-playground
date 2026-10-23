# Bug report: TC 61 retest, empty receive amount

Source: Test Tracker, suite `test-cases-from-ado.md`, TC 61 (#38755), run "Init" (QA, build 2.5.0 (3461)).

> **Overlaps with BUG 38756** (`bug-draft.md`): a zero receive amount shows a full screen generic error instead of the inline error.
> This draft adds one thing 38756 doesn't cover: with the receive amount left **empty**, the Get a quote button is enabled.
> Either add this to 38756 as a comment, or raise it as a separate bug and link the two. See the note under Actual behaviour.

---

TITLE
Get a Quote Button Is Enabled When the Receive Amount Is Empty, and Tapping It Shows a Full Screen Generic Error

REPRO STEPS
1. Log in to the GKOne application as a KYC Tier 1 user with a non-expired ID in the JM or KY market (outbound enabled for the tenant in Firebase and Cosmos).
2. Tap the "Send Money" icon on the home screen.
3. On the Request a quote screen, select the destination country, state, city and payout method for a corridor that accepts receive amount input (not an intra-corridor selection).
4. Fill in every other required field on the quote screen.
5. Switch to the receive amount field and leave it empty.
6. Accept the WU Terms of Service and the declaration.
7. Observe the Get a quote button.
8. Tap "Get a quote".

NB: [Attach a screenshot of the enabled button with the empty amount field, a screenshot or recording of the full screen error, and the quote request/response if captured.]

EXPECTED BEHAVIOUR
- With the receive amount empty, the Get a quote button stays disabled, because the amount is a required field.
- If the app lets the request through, an inline error is shown next to the receive amount field (not the send amount field), explaining in user-friendly language that an amount is needed.
- No quote is returned, and the user stays on the Request a quote screen and can enter an amount.

ACTUAL BEHAVIOUR / DESCRIPTION OF DEFECT
- With the receive amount left empty and every other required field completed (T&Cs accepted), the Get a quote button became enabled.
- Tapping Get a quote showed a full screen generic error instead of an inline error on the receive amount field.
  - Note: the full screen error is the same behaviour as BUG 38756 (receive amount of "0"). An empty amount appears to go through the same path. This could be a separate issue from the enabled button, and is likely to be fixed along with 38756.
- Note: the enabled button with no amount could be a separate issue from the error itself. It lets the user submit a quote request that can't succeed.

SYSTEM INFO
- Environment: QA
- App version: 2.5.0 (3461)
- Device / OS: N/A [fill in]
- Market and corridor used: N/A [fill in]

SEVERITY: Minor
JUSTIFICATION: Classified as Minor under the Defect Spectrum. The user still can't get a quote without an amount, so there's no financial or compliance risk and the flow completes once an amount is entered. But the enabled button and the full screen generic error cause friction and don't tell the user what to fix.
