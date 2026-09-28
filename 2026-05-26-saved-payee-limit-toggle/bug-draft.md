# Bug Draft: Save Payee Toggle Enables Despite Limit Reached (Outbound V2)

## Title

Save payee toggle enables and proceeds despite max payee limit — no failure toast at flow end

## Severity

Medium — functional defect with misleading UI state; no data loss but user is misled about outcome

## Area / Feature

Saved Payee / WU Outbound V2

## Environment

[TODO: specify environment — ask user]

## Preconditions

- User account has **5 saved payees** (maximum limit reached)
- User initiates an Outbound V2 transaction

## Steps to Reproduce

1. Log in with an account that has 5 saved payees (the configured limit)
2. Start a new Outbound (V2) transaction flow
3. Proceed to the recipient details screen (name, nickname, etc.)
4. Observe the "Save Payee" toggle — it is **OFF** by default (expected when at limit)
5. Tap the toggle to enable it
6. Observe: an error toast appears (expected) — **but the toggle also enables** (not expected)
7. Continue through the flow and complete the transaction successfully
8. Observe the final confirmation screen

## Expected Result

**Step 5–6:**
- Error toast appears informing the user they are at the saved payee limit ✓
- Toggle remains OFF / reverts to OFF after the error ✗

**Step 8 (if toggle incorrectly remained ON):**
- A toast should appear on the final screen stating the payee was not saved (per the notification matrix: transaction success + save failed = toast warning)

**Post-flow:**
- Saved payees list should remain at 5 (no new entry) ✓

## Actual Result

**Step 5–6:**
- Error toast appears ✓
- Toggle **enables and stays enabled** despite the error ✗

**Step 8:**
- **No toast appears** on the final screen about the payee save failure ✗
- The payee was not saved (does not appear in saved payees list) — correct outcome, but communicated silently

**Post-flow:**
- Saved payees list remains at 5 ✓ (payee was not actually saved)

## Impact

Two distinct issues:

1. **Toggle state inconsistency:** The toggle enables despite the limit being reached. This misleads the user into believing the payee will be saved on transaction completion. The error toast contradicts the toggle state — confusing UX.

2. **Missing failure toast at end of flow:** Per the notification matrix in the domain knowledge, a successful transaction with a failed payee save should show a warning toast on the final screen. This toast is absent, meaning the user has no confirmation of the failure at the point they'd expect it.

Combined effect: the user sees a contradictory error toast mid-flow but the toggle stays on, giving mixed signals. At the end of the flow, there is no follow-up notification. The user may or may not trust the initial error toast, and has no final-screen signal to confirm the save didn't happen. They only discover the payee wasn't saved when they next check the Saved Payee widget.

## Root Cause Hypothesis

[UNCERTAIN] Likely the toggle's error handling fires the toast but does not prevent the state change (race condition or missing `preventDefault` / state revert logic). The end-of-flow save attempt may be short-circuited by the backend (limit enforced server-side), but the frontend isn't interpreting the failure response to show the expected toast.

## Related Context

- Domain knowledge confirms max 5 saved payees per account (configurable)
- Edge case "Saved payee limit reached — 6th save attempted" (edge-cases.md) already notes this scenario as a known test gap — specifically asking whether the toggle is "hidden, disabled, or still visible but non-functional"
- Notification matrix (domain-knowledge.md) specifies: transaction success + save failed = toast warning on final screen

## Attachments

[TODO: screenshots of toggle enabled with error toast visible, and final screen without toast]

---

**Context applied:** saved-payee/domain-knowledge.md (toggle default, 5-payee limit, notification outcomes table); saved-payee/edge-cases.md (entry "Saved payee limit reached — 6th save attempted"); saved-payee/integration-points.md (WU Outbound dependency).
