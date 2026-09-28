TITLE
Identity Conflict Moves to Finished Instead of Waiting for Approval When a Proposed Action is Rejected

REPRO STEPS
1. Log in to the admin portal as a user with maker permissions
2. Navigate to User Management → Identity Conflicts
3. Open a conflict from the "New" tab
4. Propose an action (e.g. Merge accounts, Reset KYC, Suspend, or Archive) — provide resolution notes/reason and submit
5. Log in (or switch) to a user with checker permissions
6. Navigate to Pending Operations and open the pending operation
7. Reject the operation, providing a rejection comment
8. Observe which tab the conflict moves to

NB: Note any screen recording or screenshots of the incorrect tab transition.

EXPECTED BEHAVIOUR
When a checker rejects a proposed action, the conflict should move back to "Waiting for Approval" so the maker can review the rejection and propose a new action. The rejected operation should remain visible for context.

ACTUAL BEHAVIOUR / DESCRIPTION OF DEFECT
• After the checker rejects the operation, the conflict moves to the "Finished" tab instead of back to "Waiting for Approval"
• "Finished" is a terminal state — no further actions are possible from this state
• As a result, the maker has no path to propose a new action on the conflict
• The conflict is left permanently stuck with no resolution, leaving affected customer accounts in TRN_DUPLICATED status indefinitely

SYSTEM INFO
N/A — please fill in before raising: environment (staging/prod), browser, admin portal build version.

SEVERITY: Major
JUSTIFICATION: Classified as Major — the incorrect state transition blocks the entire rejection-and-resubmit flow. Affected identity conflicts become irresolvable, leaving customer accounts in TRN_DUPLICATED status with KYC-gated actions permanently blocked until a workaround is found.
