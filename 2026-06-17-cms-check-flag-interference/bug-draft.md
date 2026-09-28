# Bug Draft — CMS Check Interference (EnableIdentityConflictResolution)

TITLE
CMS Check Fails Silently for Non-JM Users on Reattempt When EnableIdentityConflictResolution Flag is Enabled

REPRO STEPS
1. Ensure EnableIdentityConflictResolution is enabled on the BE.
2. Log in as a user on a non-JM tenant.
3. Complete the Ondato ID verification flow.
4. Allow the CMS check to run and fail on the first attempt.
5. Trigger the CMS check reattempt.

NB: Confirm whether a recording or session log is available to attach.

EXPECTED BEHAVIOUR
For non-JM tenant users, the identity conflict resolution / duplicate TRN check should not fire. The CMS check should run on reattempt and surface failures as normal — identity validation failures should be logged and the user should receive the standard failure notification email.

ACTUAL BEHAVIOUR
- The CMS check either does not execute or fails entirely without surfacing the failure through the expected channels.
- The user remains in their current state with no progression or resolution.
- No identity validation failures are logged.
- No notification email is sent to the user.
- Note: The silent failure means no audit trail entry exists for the check attempt — this could be a separate compliance logging issue.
- Note: Behaviour is only observed when EnableIdentityConflictResolution is enabled; disabling the flag restores expected CMS check behaviour, confirming the flag as the isolating variable.

SYSTEM INFO
N/A — please add environment, app build version, and device/OS before raising.

SEVERITY: Critical
JUSTIFICATION: Classified as Critical — when the flag is enabled, a compliance check (CMS) is silently bypassed for non-JM users on reattempt, with no failure logged and no user notification sent. This represents both a compliance rules gap and an audit trail failure. A workaround exists (disable the flag), but this gates the entire JM identity conflict resolution feature.
