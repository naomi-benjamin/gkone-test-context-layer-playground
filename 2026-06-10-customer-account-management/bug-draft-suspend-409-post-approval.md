TITLE
Admin Receives Misleading 409 Error and Conflict Remains Re-actionable After Approving Suspend Action

REPRO STEPS
1. Log in to the admin portal as a user with maker permissions
2. Navigate to User Management → Identity Conflicts
3. Open a conflict from the "New" tab
4. Select "Edit a user" → Suspend, provide a reason, and submit the proposal
5. Log in (or switch) to a user with checker permissions
6. Navigate to Pending Operations and open the pending Suspend operation
7. Approve the operation
8. Observe the error displayed and the resulting conflict state

NB: Note any screen recordings or screenshots of the 409 error message and the conflict's tab state after approval. Confirm whether the target account is actually suspended (i.e. whether the user can or cannot sign in after the error).

EXPECTED BEHAVIOUR
After checker approval of a Suspend operation:
• The suspend action executes on the target account — user cannot sign in
• The operation status is APPROVED
• The operation is removed from Pending Operations
• The conflict moves to the Finished tab — no further actions can be submitted

ACTUAL BEHAVIOUR / DESCRIPTION OF DEFECT
• A 409 error message is displayed immediately after the checker approves the Suspend operation — the message implies the approval or the suspension itself failed
• Despite the error, the operation is no longer visible in Pending Operations and the operation record shows a status of Approved
• The conflict does not move to the Finished tab — it remains in a state where another action can be submitted
• It is unclear whether the suspend has actually taken effect on the target user's account

Note: The 409 and the stuck conflict state may share a root cause — the approval was recorded (APPROVED) but the post-approval saga failed to complete, leaving the conflict in an inconsistent intermediate state. These may be two separate defects (misleading error UX / saga not completing) and could be split once root cause is confirmed.

SYSTEM INFO
N/A — please fill in before raising: environment (staging/prod), browser, admin portal build version, whether the target account was confirmed suspended or not suspended after the error, and any console or network log output showing the 409 response.

SEVERITY: Major
JUSTIFICATION: Classified as Major — the approval flow records the status change but the post-approval saga fails to complete, leaving the conflict in an irresolvable intermediate state. The 409 error messaging is actively misleading (implies failure when the approval was recorded). Whether the suspend actually took effect on the user's account is unknown, creating potential compliance risk. The stuck conflict has no automatic recovery path.
