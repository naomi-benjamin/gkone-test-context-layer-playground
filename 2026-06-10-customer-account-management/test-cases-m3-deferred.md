# Test Cases Deferred to M3

Archived from test-cases-m2-draft-v1.md on 2026-06-25.
These cases were scoped out of M2. Use as a starting point for M3 planning.

---

## Suspend — Post-Approval Behaviour

TEST CASE 10 [KEEP]
Title: Verify that a suspended user cannot sign in and that suspension is reversible

Tags: Customer Account Management, Milestone 3, Admin, Suspend, State Transition, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• Admin has proposed Suspend on an account and checker has approved
• The suspended user was previously able to log in

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Attempt to log in as the suspended user | Login fails — account is locked, user cannot sign in |
| 2. | Admin reverses the suspension (via Search Users or appropriate admin action) | Suspension lifted |
| 3. | Attempt to log in as the previously suspended user | Login succeeds — account is accessible again |

Post Conditions:
The following should be true after test completion:
• Suspend prevents sign-in (not just KYC-gated actions — full login blocked)
• Suspension is reversible by admin action
• Data and account status are intact after unsuspension

---

## Archive — Post-Approval Behaviour

TEST CASE 12 [KEEP]
Title: Verify that archiving an account does NOT auto-clear TRN_DUPLICATED on the remaining account

Tags: Customer Account Management, Milestone 3, Admin, Archive, Edge Case, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• A conflict exists between Target and Existing accounts (both in TRN_DUPLICATED)
• Maker has proposed Archive on one account and checker has approved
• The remaining (non-archived) account is still in TRN_DUPLICATED state

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Verify the archived account's state after approval | Account is archived (soft-deleted, data retained, not accessible to user) |
| 2. | Verify the remaining account's kycStatus | kycStatus is still TRN_DUPLICATED — archive did NOT auto-resolve the duplicate state |
| 3. | Log in as the remaining account user | Login succeeds but KYC-gated actions still blocked |
| 4. | Admin performs Reset KYC on the remaining account | TRN_DUPLICATED cleared — user can re-enter KYC flow |

Post Conditions:
The following should be true after test completion:
• Archiving one account does not cascade a state change to the other
• Admin must take a separate action (e.g. Reset KYC) to unblock the remaining account
• Archived account is excluded from future TRN duplicate detection

---

## Resilient Error and Failure Handling

TEST CASE 19
Title: Verify that the admin panel handles API failure gracefully when submitting a merge proposal [VERIFY]

Tags: Customer Account Management, Milestone 3, Admin, Error Handling, Merge, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• Maker is submitting a merge proposal
• API will fail (simulate via network interruption, service unavailability, or mock)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Complete the merge proposal form (select winner, enter resolution notes) | Form is valid |
| 2. | Submit the merge proposal (with simulated API failure) | Error message displayed — maker is informed the submission failed [VERIFY: exact error copy and UI behaviour] |
| 3. | Verify that no PENDING operation was created | Conflict remains in "New" tab — no operation attached |
| 4. | Restore service and retry submission | Merge proposal submitted successfully |

Post Conditions:
The following should be true after test completion:
• Failed submission does not create a partial or corrupted operation
• Maker can retry without restarting the entire flow
• Error messaging is clear and actionable

---

TEST CASE 20
Title: Verify that the pre-flight check service unavailability is handled gracefully [VERIFY]

Tags: Customer Account Management, Milestone 3, Admin, Error Handling, Pre-flight, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• Maker is initiating a merge and the pre-flight check service is unavailable
• Maker has selected "Merge accounts" and chosen a winner

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Select the winner account (triggers pre-flight check) | Pre-flight check fails due to service unavailability |
| 2. | Observe the UI response | Error message displayed indicating the check could not be completed [VERIFY: does the system block the merge or allow it to proceed without the check?] |
| 3. | Verify that the maker cannot submit a merge without a passing pre-flight check | Submission is blocked until pre-flight check can be completed |

Post Conditions:
The following should be true after test completion:
• System does not allow merges without a successful pre-flight check (fail-closed)
• Maker receives clear feedback about what went wrong

---

TEST CASE 21
Title: Verify that concurrent admin actions on the same conflict result in last-action-wins without data corruption

Tags: Customer Account Management, Milestone 3, Admin, Edge Case, Concurrency, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• A conflict exists in the "New" tab
• Two admin users (Maker A and Maker B) both have the conflict detail open simultaneously

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Maker A selects "Merge accounts" and begins filling in the form | Form is active for Maker A |
| 2. | Maker B selects "Edit a user" → Suspend and submits before Maker A | Maker B's operation is created successfully |
| 3. | Maker A completes and submits their merge proposal | Either: (a) Maker A's submission succeeds and overwrites Maker B's operation (last-action-wins), or (b) Maker A receives an error indicating the conflict has already been actioned [VERIFY: exact race condition behaviour] |

Post Conditions:
The following should be true after test completion:
• No data corruption or orphaned operations
• At most one valid PENDING operation exists on the conflict
• The system does not enter an inconsistent state

---

## Email Notifications to Users (Admin Actions)

TEST CASE 22
Title: Verify that the Target user receives a progress notification email when admin approves the merge

Tags: Customer Account Management, Milestone 3, Notifications, Email, Merge, Target User

Pre Conditions:
The following should be true before proceeding:
• Target user has submitted a conflict report (MergeRequested)
• Maker proposed a merge and checker approved it
• Merge saga completed successfully
• Target user has a verified email address

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Checker approves the merge operation | Merge saga executes and completes |
| 2. | Check the Target user's email inbox (or email delivery logs) | Email notification received indicating the merge/resolution is complete |
| 3. | Verify email content is appropriate to the outcome | Email confirms the account recovery is complete / account has been merged successfully |
| 4. | Verify email is sent only once (no duplicate delivery) | Exactly one resolution email received |

Post Conditions:
The following should be true after test completion:
• Target (winner) user is informed their account recovery completed
• Email is delivered promptly after saga completion
• No duplicate emails sent

Note: Incorporates archived M1 case A1.

---

TEST CASE 23
Title: Verify that the Target user receives a rejection notification email when the checker rejects the operation

Tags: Customer Account Management, Milestone 3, Notifications, Email, Rejection, Target User

Pre Conditions:
The following should be true before proceeding:
• Target user has submitted a conflict report
• Maker proposed an action and checker rejected it
• Target user has a verified email address

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Checker rejects the operation with a comment | Operation status becomes REJECTED |
| 2. | Check the Target user's email inbox (or email delivery logs) | Email notification received indicating the request was rejected |
| 3. | Verify email content | Email communicates the rejection without exposing internal audit details (checker name/comment should NOT be in customer email) |
| 4. | Verify email does not include self-service resolution options | Email does not guide the user to re-initiate the flow (user cannot self-serve after rejection — must wait for admin) |

Post Conditions:
The following should be true after test completion:
• Target user is informed of rejection
• Email does not mislead the user into thinking they can re-initiate
• Target account remains in TRN_DUPLICATED state (cannot transact on KYC-gated features)

---

TEST CASE 24
Title: Verify that the Existing account holder (loser) receives a notification email when their account is suspended post-merge

Tags: Customer Account Management, Milestone 3, Notifications, Email, Merge, Existing User

Pre Conditions:
The following should be true before proceeding:
• A merge has completed — Existing account was the loser
• Existing account is now suspended (cannot login, cannot transact)
• Existing user has a verified email address

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Merge saga completes (loser account suspended) | Saga reaches Completed state |
| 2. | Check the Existing (loser) user's email inbox | Email notification received about account suspension/merge |
| 3. | Verify email content communicates the outcome | Email informs the user that their account has been merged into another profile and is no longer active |
| 4. | Verify email includes support contact information | Email provides a way for the user to contact support if they believe this was an error |

Post Conditions:
The following should be true after test completion:
• Loser account holder is not left in the dark — they receive notification
• Email provides a path to dispute/contact support
• Email does NOT include login links or CTAs that the suspended user cannot action

Note: Incorporates archived M1 case A2.

---

TEST CASE 25
Title: Verify that the Existing account holder (winner in merge) receives a notification email confirming their account is restored

Tags: Customer Account Management, Milestone 3, Notifications, Email, Merge, Existing User

Pre Conditions:
The following should be true before proceeding:
• A merge has completed — Existing account was the winner (survived)
• Existing account's TRN_DUPLICATED status has been cleared
• Existing user has a verified email address

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Merge saga completes (Existing account is the winner/survivor) | Saga reaches Completed state |
| 2. | Check the Existing (winner) user's email inbox | Email notification received confirming account is back to normal |
| 3. | Verify email content | Email confirms the review is complete and their account is no longer under restriction |
| 4. | Verify email is distinct from the initial "under review" notification | Email clearly communicates a resolution, not a repeat of the detection notice |

Post Conditions:
The following should be true after test completion:
• Winner (surviving Existing account) is informed the conflict is resolved
• User understands their account is fully functional again
• KYC-gated actions should be accessible post-merge (TRN_DUPLICATED cleared)

---

TEST CASE 26
Title: Verify that the Existing account holder receives a release notification email when a checker rejects the merge and their TRN_DUPLICATED is cleared

Tags: Customer Account Management, Milestone 3, Notifications, Email, Rejection, Existing User

Pre Conditions:
The following should be true before proceeding:
• A conflict existed between Target and Existing accounts
• Checker has rejected the proposed operation
• Existing account's TRN_DUPLICATED status is cleared (per domain-knowledge: "Existing account gets freed up")
• Existing user has a verified email address

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Checker rejects the operation | Existing account's TRN_DUPLICATED status is cleared |
| 2. | Check the Existing user's email inbox | Email notification received indicating their account is no longer under review |
| 3. | Verify email content | Email confirms the restriction has been lifted and the account can resume normal use |
| 4. | Verify the Existing user can now access KYC-gated actions | KYC gate screen no longer shown |

Post Conditions:
The following should be true after test completion:
• Existing account holder is promptly informed when their restriction is lifted
• Email provides positive confirmation — not just silence

---

## Negative / Security Cases

TEST CASE 27
Title: Verify that a maker cannot approve their own operation (two-person rule enforcement)

Tags: Customer Account Management, Milestone 3, Admin, Security, Two-Person Rule, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• Maker has submitted a PENDING operation (any type: merge, reset KYC, suspend, archive)
• The same user attempts to approve it
• User has maker role (not admin)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Log in as the same maker who created the operation | Login succeeds |
| 2. | Navigate to "Waiting for Approval" and open the PENDING operation | Operation detail displayed |
| 3. | Attempt to approve the operation | Approval is blocked — system enforces that a different user must approve |

Post Conditions:
The following should be true after test completion:
• Two-person rule enforced for maker role
• No self-approval possible
• Operation remains PENDING until a different checker/admin approves

---

TEST CASE 28
Title: Verify that an admin role CAN both create and approve their own operation (two-person rule bypass)

Tags: Customer Account Management, Milestone 3, Admin, Security, Two-Person Rule, Edge Case, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• User has **admin** role (not just maker or checker)
• A conflict exists in the "New" tab

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Log in as admin and propose a merge/action on the conflict | Operation created with status PENDING |
| 2. | As the same admin user, navigate to "Waiting for Approval" | The operation is visible |
| 3. | Approve the operation | Approval succeeds — admin bypasses the two-person rule |
| 4. | Saga executes (if merge) | Completes normally |

Post Conditions:
The following should be true after test completion:
• Admin role bypasses two-person rule (by design — potential audit concern noted)
• Audit trail still records that the same person proposed and approved

---

TEST CASE 29
Title: Verify that a maker cannot submit a proposal without providing a reason or resolution notes

Tags: Customer Account Management, Milestone 3, Admin, Maker, Negative, Validation, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• Maker is on the proposal submission step (any action type)

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Attempt to submit a merge proposal with empty resolution notes | Submission blocked — minimum 5 characters required |
| 2. | Enter fewer than 5 characters (e.g. "ok") | Submission still blocked — validation enforces minimum length |
| 3. | Enter exactly 5 characters (e.g. "Fixed") | Submission succeeds |
| 4. | For Edit User actions: attempt to submit with empty reason field | Submission blocked — reason is required |

Post Conditions:
The following should be true after test completion:
• Merge requires resolution notes ≥ 5 characters
• Edit User actions require a non-empty reason
• No operations can be created without justification

---

TEST CASE 30
Title: Verify that an archived account is excluded from future TRN duplicate detection

Tags: Customer Account Management, Milestone 3, Admin, Archive, Detection, Regression, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• Account A was previously archived (soft-deleted) and shared a TRN with Account B
• Account C is a new account about to complete Ondato KYC with the same TRN

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Account C completes Ondato KYC with TRN matching archived Account A | Detection does NOT fire a conflict against the archived Account A |
| 2. | If Account B still exists and is active, verify whether detection fires against Account B | Detection fires against Account B (active account) — normal behaviour |
| 3. | Verify admin panel | No conflict created referencing the archived Account A |

Post Conditions:
The following should be true after test completion:
• Archived accounts are permanently excluded from duplicate detection
• Only active accounts participate in TRN conflict matching

---

## Checker Approval — Post-Approval Outcomes

TEST CASE M2-A1
Title: Verify that Reset KYC clears TRN_DUPLICATED status after approval and the user re-enters KYC

Tags: Customer Account Management, Milestone 3, Admin, Checker, Reset KYC, State Transition, Identity Conflicts

Pre Conditions:
The following should be true before proceeding:
• A conflict exists with both accounts in kycStatus = TRN_DUPLICATED
• Maker has proposed Reset KYC on the target account
• Checker has approved the operation
• Target user is logged in on mobile

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Verify the target account's kycStatus after approval | kycStatus is reset to 0 (no longer TRN_DUPLICATED) |
| 2. | Log in as the target user on mobile | Login succeeds |
| 3. | Navigate to Home v2 | Conflict tile is no longer displayed (TRN_DUPLICATED cleared) |
| 4. | Attempt a KYC-gated action | User is prompted to complete KYC (Ondato flow) — not shown the "account under review" gate screen |

Post Conditions:
The following should be true after test completion:
• TRN_DUPLICATED status cleared on the target account
• User can re-enter the Ondato KYC verification flow
• KYC gate screen no longer displayed — replaced by standard KYC prompt

Archived: 2026-06-19
Reason: Requires checker approval (M3 scope). The maker propose action (TC 7) is M2; the post-approval outcome verification belongs to M3.

---
