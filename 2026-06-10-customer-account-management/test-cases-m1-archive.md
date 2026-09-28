# Customer Account Management — Milestone 1 Archived Test Cases

Archived: 2026-06-12
Reason: Deferred — these test cases depend on admin actions (M2/M3) or have insufficient detail to execute in M1 scope.

---

TEST CASE A1
Title: Verify that the Target user receives progress notification when their report status changes (admin action taken)

Tags: Customer Account Management, Milestone 1, Notifications, Progress

Pre Conditions:
The following should be true before proceeding:
• Target user has submitted a conflict report (MergeRequested or NotMyAccount)
• Admin takes an action on the conflict (e.g. merge approved, rejected, or other resolution)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Admin approves/rejects the conflict operation | Action completes on admin panel |
| 2. | Check Target user's notification channel (email and/or push) | Progress notification delivered indicating status change |
| 3. | Verify notification content is appropriate to the action taken | For approval: notification about merge/resolution in progress or completed. For rejection: notification that the request was rejected |

Post Conditions:
The following should be true after test completion:
• User is informed of progress on their report
• Notification is delivered via appropriate channel (email/push)

---

TEST CASE A2
Title: Verify that the Existing account holder receives notification when conflict resolution is complete

Tags: Customer Account Management, Milestone 1, Notifications, Progress, Existing User

Pre Conditions:
The following should be true before proceeding:
• A conflict exists between Target and Existing accounts
• Admin has completed resolution (merge completed, conflict rejected, or conflict archived)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Merge saga completes (or other resolution finalised) | Resolution reaches terminal state |
| 2. | Check Existing account holder's notification channel | Notification delivered about the resolution outcome |
| 3. | Verify notification content | If their account survived: notification confirms account is back to normal. If their account was the loser: notification about account suspension/merge |

Post Conditions:
The following should be true after test completion:
• Existing account holder is not left in the dark after resolution
• Appropriate notification delivered based on outcome

---

Note: Both archived cases require admin resolution actions (M2/M3 dependency) to trigger notifications. Consider testing as part of M2/M3 integration or moving back to M1 once admin flows are available.
