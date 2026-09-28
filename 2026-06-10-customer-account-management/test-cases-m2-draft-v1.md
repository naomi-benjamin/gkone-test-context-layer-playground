# Customer Account Management — Milestone 2 Test Cases

**Milestone 2:** Admin maker — account recovery approval (+ Search Users standalone actions)

Generated: 2026-06-19
Source: domain-knowledge.md (Admin maker approval, Search Users, Conflict resolution decision tree, Merge flow, Archive flow, Checker approval/reject, Non-obvious behaviour), test-patterns.md, M1 archive (A1, A2 — deferred notification cases)

---

## Capability Coverage

| M2 Capability | Test Cases |
|---------------|------------|
| Review duplicate account reports | TC 1, 2, 3 |
| Propose action — Merge | TC 4, 5, 6 |
| Propose action — Reset KYC | TC 7 |
| Propose action — Suspend | TC 9, 10 |
| Propose action — Archive | TC 11, 12 |
| Resubmit action | TC 13, 14 |
| View audit trail | TC 15, 16 |
| Invalidate user's session (standalone) | TC 17, 18 |
| Resilient error and failure handling | TC 19, 20, 21 |
| Email notifications to users (admin actions) | TC 22, 23, 24, 25, 26 |

---

## Happy Path — Review & Propose

---

TEST CASE 1 [KEEP]
Title: Verify that a maker can view a new conflict report showing side-by-side account comparison

Tags: Customer Account Management, Milestone 2, Admin, Maker, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• A conflict exists in the system (Target filed a MergeRequested or NotMyAccount report)
• Maker user is logged into the admin panel with maker permissions
• The conflict is in the "New" tab

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Navigate to User Management → Identity Conflicts | Identity Conflicts page loads with tabs: New, Waiting for Approval, Finished |
| 2. | Select the "New" tab | List of unactioned conflicts displayed |
| 3. | Open the conflict detail | Side-by-side comparison displayed showing: conflicted user vs existing user |
| 4. | Verify fields displayed for both accounts | Name, Email, TRN, Country, and Status are shown for each account |

Post Conditions:
The following should be true after test completion:
• Maker can identify both accounts involved in the conflict
• Conflict remains in "New" tab (no action taken)

---

TEST CASE 2 [KEEP]
Title: Verify that a maker can see the conflict resolution decision tree with Edit User and Merge options

Tags: Customer Account Management, Milestone 2, Admin, Maker, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• A conflict exists in the "New" tab
• Maker is viewing the conflict detail

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Open a conflict from the "New" tab | Conflict detail view displayed with resolution options |
| 2. | Observe available resolution paths | Two options are available: "Edit a user" and "Merge accounts" |
| 3. | Select "Edit a user" | Maker is prompted to select which account to act on (conflicted user or existing user) and which action (Reset KYC, Suspend, Archive) |

Post Conditions:
The following should be true after test completion:
• Both resolution paths are accessible from the conflict detail view
• No operation created until maker completes the flow

---

TEST CASE 3 [KEEP]
Title: Verify that a maker can view conflicts under all three tabs (New, Waiting for Approval, Finished)

Tags: Customer Account Management, Milestone 2, Admin, Maker, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• At least one conflict exists in each tab state (New, Waiting for Approval, Finished)
• Maker is logged into admin panel

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Navigate to User Management → Identity Conflicts | Page loads |
| 2. | Select "New" tab | Conflicts with no operations submitted are listed |
| 3. | Select "Waiting for Approval" tab | Conflicts with a PENDING operation are listed |
| 4. | Select "Finished" tab | Conflicts that have been resolved (approved/completed or rejected) are listed |

Post Conditions:
The following should be true after test completion:
• All three tabs are functional and display conflicts in the appropriate state

---

## Happy Path — Merge

---

TEST CASE 4 [KEEP]
Title: Verify that a maker can successfully propose a merge operation when the pre-flight check passes

Tags: Customer Account Management, Milestone 2, Admin, Maker, Merge, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• A conflict exists in the "New" tab
• Neither account has wallet or transaction history on the existing account (pre-flight check will pass)
• Maker is logged into admin panel with maker permissions

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Open the conflict detail and select "Merge accounts" | Merge flow initiated — maker is prompted to select the winner |
| 2. | Select the winner account (account to keep) | Pre-flight check runs automatically |
| 3. | Observe pre-flight check result | Check passes — no error 1005. Maker can proceed to review and submit |
| 4. | Enter resolution notes (minimum 5 characters, e.g. "TRN verified — merging accounts") | Notes accepted |
| 5. | Submit the merge proposal | Operation created with type: `id-conflict-resolution-merge-user`, status: PENDING, priority: HIGH |
| 6. | Navigate to "Waiting for Approval" tab | The conflict now appears under "Waiting for Approval" |

Post Conditions:
The following should be true after test completion:
• A PENDING operation exists with payload containing reportId, resolvedInFavorOfUserId (winner), and losingUserId (loser)
• Conflict has moved from "New" to "Waiting for Approval"
• No merge has executed yet — awaiting checker approval

---

TEST CASE 5 [KEEP]
Title: Verify that a maker is blocked from proposing a merge when pre-flight error 1005 is triggered

Tags: Customer Account Management, Milestone 2, Admin, Maker, Merge, Negative, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• A conflict exists in the "New" tab
• The **existing** account has wallet AND transaction history (triggers error 1005)
• Maker is logged into admin panel

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Open the conflict detail and select "Merge accounts" | Merge flow initiated |
| 2. | Select the winner account | Pre-flight check runs automatically |
| 3. | Observe pre-flight check result | Error 1005 displayed — merge is blocked. Remediation guidance shown: suggest archiving the loser instead |
| 4. | Attempt to proceed with merge submission | Submission is blocked — cannot create a merge operation |

Post Conditions:
The following should be true after test completion:
• No merge operation created
• Conflict remains in "New" tab
• Maker is guided to consider an alternative action (archive)

---

TEST CASE 6 [KEEP]
Title: Verify that a merge is permissible even when the new/target account has transaction history and the existing account does not

Tags: Customer Account Management, Milestone 2, Admin, Maker, Merge, Edge Case, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• A conflict exists in the "New" tab
• The **new/conflicted** account has wallet and transaction history
• The **existing** account does NOT have wallet or transaction history
• Maker is logged into admin panel

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Open the conflict detail and select "Merge accounts" | Merge flow initiated |
| 2. | Select the winner account | Pre-flight check runs automatically |
| 3. | Observe pre-flight check result | Check passes — error 1005 is NOT triggered (only fires for existing account with history) |
| 4. | Enter resolution notes and submit | Merge operation created successfully |

Post Conditions:
The following should be true after test completion:
• PENDING merge operation created — pre-flight check only evaluates the existing account, not the target
• Conflict moves to "Waiting for Approval"

---

## Happy Path — Edit User Actions

---

TEST CASE 7 [KEEP]
Title: Verify that a maker can propose a Reset KYC action on a selected account with a reason

Tags: Customer Account Management, Milestone 2, Admin, Maker, Reset KYC, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• A conflict exists in the "New" tab
• Maker is logged into admin panel with maker permissions

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Open the conflict detail and select "Edit a user" | Maker is prompted to select which account to act on |
| 2. | Select the account to act on (e.g. the conflicted/target user) | Action options displayed: Reset KYC, Suspend, Archive |
| 3. | Select "Reset KYC" | Reason input field displayed |
| 4. | Enter a reason for the action | Reason accepted |
| 5. | Submit the operation | Operation submitted and awaits checker approval (status: PENDING) |

Post Conditions:
The following should be true after test completion:
• PENDING Reset KYC operation created on the selected account
• Conflict moves to "Waiting for Approval" tab
• No KYC reset has executed yet — awaiting checker approval
• Once approved: user's KYC status resets to 0 (KycStatus zero) — user must re-enter the Ondato KYC flow

---

TEST CASE 7b [KEEP]
Title: Verify that a maker cannot propose a Reset KYC action without providing a reason

Tags: Customer Account Management, Milestone 2, Admin, Maker, Reset KYC, Negative, Validation, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• A conflict exists in the "New" tab
• Maker is logged into admin panel with maker permissions

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Open the conflict detail and select "Edit a user" | Maker is prompted to select which account to act on |
| 2. | Select the account to act on | Action options displayed: Reset KYC, Suspend, Archive |
| 3. | Select "Reset KYC" | Reason input field displayed |
| 4. | Leave the reason field empty and attempt to submit | Submission blocked — reason is required |

Post Conditions:
The following should be true after test completion:
• No operation created
• Conflict remains in "New" tab
• Maker must provide a reason before the system accepts the proposal

---

TEST CASE 9 [KEEP]
Title: Verify that a maker can propose a Suspend action on a selected account with a reason

Tags: Customer Account Management, Milestone 2, Admin, Maker, Suspend, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• A conflict exists in the "New" tab
• Maker is logged into admin panel with maker permissions

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Open the conflict detail and select "Edit a user" | Account selection prompt displayed |
| 2. | Select the account to act on | Action options displayed: Reset KYC, Suspend, Archive |
| 3. | Select "Suspend" | Reason input field displayed |
| 4. | Enter a reason for the suspension | Reason accepted |
| 5. | Submit the operation | Operation submitted and awaits checker approval (status: PENDING) |

Post Conditions:
The following should be true after test completion:
• PENDING Suspend operation created on the selected account
• Conflict moves to "Waiting for Approval" tab
• Once approved: user's account is locked — user cannot sign in

---

TEST CASE 9b [KEEP]
Title: Verify that a maker cannot propose a Suspend action without providing a reason

Tags: Customer Account Management, Milestone 2, Admin, Maker, Suspend, Negative, Validation, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• A conflict exists in the "New" tab
• Maker is logged into admin panel with maker permissions

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Open the conflict detail and select "Edit a user" | Account selection prompt displayed |
| 2. | Select the account to act on | Action options displayed: Reset KYC, Suspend, Archive |
| 3. | Select "Suspend" | Reason input field displayed |
| 4. | Leave the reason field empty and attempt to submit | Submission blocked — reason is required |

Post Conditions:
The following should be true after test completion:
• No operation created
• Conflict remains in "New" tab
• Maker must provide a reason before the system accepts the proposal

---

TEST CASE 11 [KEEP]
Title: Verify that a maker can propose an Archive action on a selected account with a reason

Tags: Customer Account Management, Milestone 2, Admin, Maker, Archive, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• A conflict exists in the "New" tab
• Maker is logged into admin panel with maker permissions

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Open the conflict detail and select "Edit a user" | Account selection prompt displayed |
| 2. | Select the account to act on | Action options displayed: Reset KYC, Suspend, Archive |
| 3. | Select "Archive" | Reason input field displayed |
| 4. | Enter a reason for the archive | Reason accepted |
| 5. | Submit the operation | Operation submitted and awaits checker approval (status: PENDING) |

Post Conditions:
The following should be true after test completion:
• PENDING Archive operation created on the selected account
• Conflict moves to "Waiting for Approval" tab
• Once approved: account is soft-deleted — data retained but not accessible to the user; irreversible

---

TEST CASE 11b [KEEP]
Title: Verify that a maker cannot propose an Archive action without providing a reason

Tags: Customer Account Management, Milestone 2, Admin, Maker, Archive, Negative, Validation, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• A conflict exists in the "New" tab
• Maker is logged into admin panel with maker permissions

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Open the conflict detail and select "Edit a user" | Account selection prompt displayed |
| 2. | Select the account to act on | Action options displayed: Reset KYC, Suspend, Archive |
| 3. | Select "Archive" | Reason input field displayed |
| 4. | Leave the reason field empty and attempt to submit | Submission blocked — reason is required |

Post Conditions:
The following should be true after test completion:
• No operation created
• Conflict remains in "New" tab
• Maker must provide a reason before the system accepts the proposal

---

## Resubmit

---

TEST CASE 13 [KEEP]
Title: Verify that a maker can resubmit a new proposal after a checker rejects the original operation

Tags: Customer Account Management, Milestone 2, Admin, Maker, Resubmit, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• A conflict had a PENDING operation that was REJECTED by a checker
• Conflict is in the "Finished" tab
• Maker is logged into admin panel

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Navigate to the "Finished" tab and open the rejected conflict | Conflict detail displayed — previous operation shows REJECTED status with checker's rejection comment |
| 2. | Initiate a new proposal (resubmit) | Maker can select a new action (Edit User or Merge) |
| 3. | Select an action, provide reason/resolution notes, and submit | New PENDING operation created on the same conflict |
| 4. | Verify the conflict's tab location | Conflict moves to "Waiting for Approval" tab [VERIFY — open question #9: may stay in Finished with new operation attached] |

Post Conditions:
The following should be true after test completion:
• New operation exists on the previously-rejected conflict
• Maker can propose a different action than the one originally rejected
• Audit trail shows both the original rejection and the new proposal

---

TEST CASE 14 [KEEP]
Title: Verify that a maker can resubmit with a different action type than the original rejected proposal

Tags: Customer Account Management, Milestone 2, Admin, Maker, Resubmit, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• A conflict was originally proposed as Merge and was rejected by checker
• Maker is logged into admin panel

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Open the rejected conflict | Previous merge operation visible as REJECTED |
| 2. | Initiate a new proposal | Resolution options displayed (Edit User / Merge) |
| 3. | Select "Edit a user" → Archive (different from original Merge) | Reason field displayed |
| 4. | Enter reason and submit | New PENDING Archive operation created on the same conflict |

Post Conditions:
The following should be true after test completion:
• Resubmit is not limited to the same action type as the original
• Audit trail shows the full history: original merge proposal → rejection → new archive proposal

---

## Audit Trail

---

TEST CASE 15 [KEEP]
Title: Verify that the audit trail shows complete operation history for a conflict with multiple operations

Tags: Customer Account Management, Milestone 2, Admin, Audit Trail, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• A conflict exists that has gone through: proposed → rejected → resubmitted → approved
• Maker and checker are different users
• Admin is logged into the admin panel

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Open the conflict detail and navigate to the audit trail / operation details | Audit trail displayed |
| 2. | Verify the first operation entry | Shows: operation type (original), status (REJECTED), maker name, date, checker name, rejection comment |
| 3. | Verify the second operation entry | Shows: operation type (resubmit), status (APPROVED), maker name, date, checker name |
| 4. | Verify prior operations are listed | Both operations visible as "prior operations on that conflict" |

Post Conditions:
The following should be true after test completion:
• Full operation history is preserved and visible
• Maker and checker identities are recorded for each operation

---

TEST CASE 16 [KEEP]
Title: Verify that the audit trail is visible to admins via operation details

Tags: Customer Account Management, Milestone 2, Admin, Audit Trail, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• A conflict with at least one completed operation exists
• Admin user is logged into the admin panel

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Navigate to the conflict and open operation details | Audit trail visible showing: operation type, status, maker name and date, checker name and comments, prior operations |
| 2. | Verify all fields are populated | No blank fields where data should exist (maker name, dates, operation type all populated) |

Post Conditions:
The following should be true after test completion:
• Audit trail is accessible from operation details
• All required audit fields are captured and displayed

---

TEST CASE 16b [NEW]
Title: Verify that the Pending Operations tab is not accessible to non-admin users

Tags: Customer Account Management, Milestone 2, Admin, Audit Trail, Negative, Access Control, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• At least one pending operation exists in the system
• A non-admin user account is available (a user without admin panel access)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Log in as a non-admin user | Login succeeds |
| 2. | Attempt to navigate to the Pending Operations tab in the admin panel | Access denied — the Pending Operations tab is not accessible to non-admin users |
| 3. | Verify no operation details (operation type, maker name, checker name, comments, audit history) are surfaced anywhere in the customer-facing app | No pending operation or audit trail data is exposed — this information is purely internal to the admin panel |

Post Conditions:
The following should be true after test completion:
• The Pending Operations tab is gated to admin panel access only
• No operation or audit trail data is visible outside the admin panel

---

## Invalidate User's Session (Standalone — Search Users)

---

TEST CASE 17 [KEEP]
Title: Verify that an admin can kick a user's active session via the Search Users three-dot menu

Tags: Customer Account Management, Milestone 2, Admin, Search Users, Session Invalidation

Pre Conditions:
The following should be true before proceeding:
• A user is currently logged in with an active session on mobile
• Admin is logged into the admin panel

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Navigate to User Management → Search Users | Search Users page loads |
| 2. | Search for the target user by TRN, name, email, phone, or Gwyn | User appears in the search results list |
| 3. | Click the three-dot menu on the user's list entry | Menu options displayed: Suspend user, Reset user's KYC, Kick active session |
| 4. | Select "Kick active session" | Confirmation that the session has been invalidated |
| 5. | Verify on the mobile device: user attempts any action in the app | User is force-logged-out — session is no longer valid; user must re-authenticate |

Post Conditions:
The following should be true after test completion:
• User's active session is immediately terminated
• User must log in again to access the app
• No conflict or maker/checker flow is required — this is a standalone action
• Account state (KYC status, data) is unchanged — only the session was terminated

---

TEST CASE 18 [KEEP]
Title: Verify that standalone Suspend and Reset KYC actions are available from Search Users independently of any conflict

Tags: Customer Account Management, Milestone 2, Admin, Search Users, Standalone Actions

Pre Conditions:
The following should be true before proceeding:
• A user exists who is NOT involved in any active conflict
• Admin is logged into the admin panel

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Navigate to User Management → Search Users | Search Users page loads |
| 2. | Search for the user | User appears in search results |
| 3. | Click the three-dot menu on the user's list entry | Menu options displayed: Suspend user, Reset user's KYC, Kick active session |
| 4. | Select "Suspend user" | User's account is suspended — user cannot sign in [VERIFY: is a reason required for standalone actions, or only within the Identity Conflicts flow?] |
| 5. | Return to Search Users and find the same user | User still appears (not removed from search) |
| 6. | Select "Reset user's KYC" via three-dot menu | User's KYC status reset to 0 — user must re-verify [VERIFY: can this be done while the user is suspended?] |

Post Conditions:
The following should be true after test completion:
• Standalone actions do not require a conflict to exist
• Standalone actions do not go through the maker/checker approval flow
• Actions take effect immediately without checker approval

---

# Summary

**Total Milestone 2 cases: 19**

Breakdown:
- Happy path — review & propose: 3 (TC 1, 2, 3)
- Happy path — merge: 3 (TC 4, 5, 6)
- Happy path — edit user (Reset KYC, Suspend, Archive): 6 (TC 7, 7b, 9, 9b, 11, 11b)
- Resubmit: 2 (TC 13, 14)
- Audit trail: 3 (TC 15, 16, 16b)
- Session invalidation (standalone): 2 (TC 17, 18)

## Assumptions

1. **Resubmit tab behaviour (TC 13):** After checker rejection, the conflict moves back to "Waiting for Approval" — the maker sees the rejection and can propose a new action from there.
2. **Standalone Search Users actions (TC 18):** Whether reason is required and whether Reset KYC can be applied to a suspended account — marked `[VERIFY]`.

## Deferred to M3

15 cases moved to `test-cases-m3-deferred.md` on 2026-06-25:
- TC 10 — Suspended user cannot sign in; suspension is reversible (post-approval state)
- TC 12 — Archive does NOT auto-clear TRN_DUPLICATED on remaining account (post-approval state)
- TC 19 — API failure handling on merge proposal submission
- TC 20 — Pre-flight check service unavailability handling
- TC 21 — Concurrent admin actions on same conflict
- TC 22–26 — Email notifications to users (Target and Existing) on admin actions
- TC 27 — Maker cannot approve own operation (two-person rule)
- TC 28 — Admin bypasses two-person rule
- TC 29 — Maker cannot submit without reason/resolution notes
- TC 30 — Archived account excluded from TRN duplicate detection
- TC M2-A1 — Reset KYC clears TRN_DUPLICATED; user re-enters KYC (requires checker approval)

## Context applied

- domain-knowledge.md: Admin maker approval (full section), Conflict resolution decision tree, Merge flow, Archive flow, Search Users standalone actions, Admin checker approval (approve/reject), Two-person rule, Audit trail, Non-obvious behaviour (admin bypass, error 1005, saga rollback, reject returns conflict to Waiting for Approval, archive irreversible, suspend reversible, race condition, sessions kicked)
- domain-knowledge.md open questions: #5 (session invalidation — resolved via Search Users section), #9 (resubmit tab behaviour — confirmed rejection → Waiting for Approval), #11 (non-merge action state machines — confirmed same flow)
- test-patterns.md: maker self-approval, concurrent actions, negative test angles

---

Want me to add cases for any specific scenario, or adjust the Pre/Post Conditions on any of these?

