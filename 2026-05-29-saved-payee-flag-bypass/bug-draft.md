# Bug Draft: Payee Saved Despite Feature Flag Off (Outbound V2)

## Title

Outbound payee saved and success toast shown when saved payee feature flag is disabled

## Severity

High — feature flag bypass; data is being written (PII) when the feature is supposed to be fully disabled; user-facing toast confirms an action that should not be happening

## Area / Feature

Saved Payee / WU Outbound V2 / Feature Flags

## Environment

[TODO: specify environment]

## Preconditions

- Saved payee feature flag is **OFF** (disabled)
- User initiates an Outbound V2 transaction

## Steps to Reproduce

1. Ensure the saved payee feature flag is disabled
2. Log in and start a new Outbound (V2) transaction flow
3. Proceed through the recipient details screen — observe that the "Save Payee" toggle is **not visible** (expected)
4. Observe that Saved Payee management (widget, list) is **not visible** (expected)
5. Complete the transaction successfully
6. Observe the final confirmation screen

## Expected Result

- Save payee toggle: not visible ✓
- Saved payee management UI: not visible ✓
- No payee save operation occurs (feature is disabled)
- No save-related toast on the final screen
- No new entry in saved payees storage

## Actual Result

- Save payee toggle: not visible ✓
- Saved payee management UI: not visible ✓
- **Payee IS saved** despite feature being disabled ✗
- **Success toast appears** on the final screen confirming payee was saved ✗
- New entry written to saved payees storage ✗

## Impact

- **Feature flag bypass:** The UI is correctly hidden but the backend save operation still executes. The feature flag only gates the UI layer, not the underlying save logic.
- **Unintended PII storage:** Recipient data (name, address, bank/wallet details) is being persisted when the feature is supposed to be off. This may have data retention/privacy implications.
- **User confusion:** Users see a toast confirming a payee was saved, but have no way to access, manage, or delete that saved payee (management UI is hidden). They cannot use the saved payee on future transactions either.
- **Limit consumption:** Saved payees likely count toward the 5-payee limit. Users may silently hit the limit without knowing, which will cause issues when the feature flag is later enabled.

## Root Cause Hypothesis

[UNCERTAIN] The feature flag appears to gate only the UI components (toggle visibility, saved payee widget/management screens) but not the underlying save operation that fires on successful transaction completion. The save logic likely runs unconditionally as part of the outbound transaction success handler, with the toggle state defaulting to ON (the documented default) when the flag hides the toggle — meaning the system behaves as if the toggle is ON because no explicit OFF state is set.

## Notes

- The toggle defaulting to ON (per domain-knowledge.md) combined with the flag only hiding the UI element likely means the save fires with the default ON state because the user never had the chance to turn it off.
- This also means that every successful outbound transaction while the flag is off is silently saving payees and consuming limit slots.

## Attachments

[TODO: screenshot of final screen toast showing payee saved; confirmation that management UI is not accessible]

---

**Context applied:** saved-payee/domain-knowledge.md (toggle defaults to ON, 5-payee limit, notification outcomes table — toast on successful save); saved-payee/edge-cases.md (limit-related scenarios); saved-payee/integration-points.md (outbound triggers save on success).
