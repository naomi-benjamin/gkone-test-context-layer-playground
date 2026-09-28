TITLE
Standalone Suspend and Reset KYC Actions Are Non-functional From the Search Users Three-Dot Menu

REPRO STEPS
1. Log in to the admin portal with the appropriate admin permissions
2. Navigate to User Management → Search Users
3. Search for a user by TRN, name, email, phone number, or Gwyn
4. Locate the user in the search results and expand the three-dot menu on their entry
5. Select "Suspend user"
6. Observe the result — note any error messages, loading states, or silent failures
7. Return to the same user's three-dot menu and select "Reset user's KYC"
8. Observe the result
9. For comparison: select "Kick active session" from the same three-dot menu and observe

NB: Note any error messages, network responses (4xx/5xx), or console output when attempting the failing actions. Record whether the actions fail immediately on selection, fail after submission, or appear to succeed but produce no effect.

EXPECTED BEHAVIOUR
All three actions in the Search Users three-dot menu are standalone — they do not require an active conflict and do not go through the maker/checker approval flow. Each should execute immediately:
• "Suspend user" — locks the account; the user cannot sign in
• "Reset user's KYC" — resets the user's KYC status to 0; user must re-verify via Ondato
• "Kick active session" — invalidates the user's current active session immediately

ACTUAL BEHAVIOUR / DESCRIPTION OF DEFECT
• "Suspend user" via the Search Users three-dot menu does not work — the action fails or produces no effect
• "Reset user's KYC" via the Search Users three-dot menu does not work — the action fails or produces no effect
• "Kick active session" via the same three-dot menu works correctly
• Only the session kick is operational; both state-change actions (Suspend and Reset KYC) are non-functional

Note: The pattern of Suspend and Reset KYC both failing while Kick Active Session succeeds suggests a shared root cause affecting the two write-type / account-state-change operations. Possible causes include a missing or misconfigured permission scope, unimplemented API endpoints for standalone suspend/reset, or a feature flag issue specific to those two actions.

SYSTEM INFO
N/A — please fill in before raising: environment (staging/prod), browser, admin portal build version, and any error messages or network responses observed when the actions fail.

SEVERITY: Major
JUSTIFICATION: Classified as Major — two of the three standalone admin actions in Search Users are non-functional. These are the only available path for suspending a user or resetting KYC outside of the Identity Conflicts flow, which requires an active conflict to exist. Admins are blocked from performing either action on users without an active conflict, with no available workaround for the standalone path.
