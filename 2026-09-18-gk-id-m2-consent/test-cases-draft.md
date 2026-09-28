# M2 Test Cases - GK ID Consent Authorization Journey

## TEST CASE 1
Title: Verify that a customer sees no consent screen when the application is set to Admin consent

Tags: GK ID, Consent, OAuth, Web, Smoke

Pre Conditions:
The following should be true before proceeding:
- The application's consent policy is set to **Admin consent** in the admin portal.
- A valid customer test account is available.
- The customer has not previously authorized this application.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start an authorization request for the application from a client. | The authorization request is accepted. |
| 2. | Sign in with the valid customer test account. | The customer is authenticated. |
| 3. | Observe the sign-in journey after authentication. | No consent screen is shown. |
| 4. | Complete the flow. | The client receives an authorization code and can exchange it for tokens without any consent interaction. |

Post Conditions:
The following should be true after test completion:
- No consent grant screen was presented for an application with Admin consent.

## TEST CASE 2
Title: Verify that a customer sees the consent screen on first authorization when the application is set to Ask each customer for consent

Tags: GK ID, Consent, OAuth, Web, Smoke

Pre Conditions:
The following should be true before proceeding:
- The application's consent policy is set to **Ask each customer for consent**.
- A valid customer test account is available.
- The customer has no existing consent grant for this application.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start an authorization request for the application. | The authorization request is accepted. |
| 2. | Sign in with the valid customer test account. | The customer is authenticated. |
| 3. | Observe the sign-in journey after authentication. | A consent screen is shown before the flow completes. |

Post Conditions:
The following should be true after test completion:
- The consent screen was presented on the customer's first authorization for this application.

## TEST CASE 3
Title: Verify that the consent screen names the application and lists the requested scopes

Tags: GK ID, Consent, OAuth, Web

Pre Conditions:
The following should be true before proceeding:
- The application's consent policy is set to **Ask each customer for consent**.
- The authorization request includes a known, specific set of scopes.
- The customer has no existing consent grant for this application.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start an authorization request with a known set of scopes. | The authorization request is accepted. |
| 2. | Sign in with a valid customer test account. | The customer is authenticated. |
| 3. | Inspect the consent screen. | The screen displays the application's name and lists each scope requested in the authorization request. |

Post Conditions:
The following should be true after test completion:
- The displayed application name and scopes match the requesting client and its requested scopes.

## TEST CASE 4
Title: Verify that selecting Allow on the consent screen completes the journey and returns the customer to the application's redirect URI

Tags: GK ID, Consent, OAuth, Web, Smoke

Pre Conditions:
The following should be true before proceeding:
- The application's consent policy is set to **Ask each customer for consent**.
- The customer has no existing consent grant for this application.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start an authorization request and sign in. | The consent screen is shown. |
| 2. | Select Allow. | The customer is returned to the application's registered redirect URI. |
| 3. | Inspect the result. | An authorization code is issued and can be exchanged for tokens. |

Post Conditions:
The following should be true after test completion:
- A consent grant is recorded for the customer and the application.

## TEST CASE 5
Title: Verify that selecting Cancel on the consent screen ends the journey without issuing a code or token

Tags: GK ID, Consent, OAuth, Web, Negative

Pre Conditions:
The following should be true before proceeding:
- The application's consent policy is set to **Ask each customer for consent**.
- The customer has no existing consent grant for this application.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start an authorization request and sign in. | The consent screen is shown. |
| 2. | Select Cancel. | The journey ends without issuing an authorization code. |
| 3. | Inspect the result at the application's redirect URI. | The application receives a denial rather than a code or token. |

Post Conditions:
The following should be true after test completion:
- No token or authorization code exists for this attempt.
- No persistent consent grant is created as a result of a denial.

## TEST CASE 6
Title: Verify that a second sign-in to the same application by the same customer skips the consent screen

Tags: GK ID, Consent, OAuth, Web

Pre Conditions:
The following should be true before proceeding:
- The application's consent policy is set to **Ask each customer for consent**.
- The customer has already completed one authorization with Allow for this application.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start a new authorization request for the same application and customer. | The authorization request is accepted. |
| 2. | Sign in if required. | The customer is authenticated. |
| 3. | Observe the sign-in journey. | The consent screen is not shown, because a grant already exists. |
| 4. | Complete the flow. | The client receives an authorization code and can exchange it for tokens. |

Post Conditions:
The following should be true after test completion:
- The existing consent grant was reused rather than requiring a new decision.

## TEST CASE 7
Title: Verify that a request carrying `prompt=consent` shows the consent screen again even where a grant already exists

Tags: GK ID, Consent, OAuth, Web

Pre Conditions:
The following should be true before proceeding:
- The application's consent policy is set to **Ask each customer for consent**.
- The customer has an existing consent grant for this application.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start a new authorization request with `prompt=consent`. | The authorization request is accepted. |
| 2. | Sign in if required. | The customer is authenticated. |
| 3. | Observe the sign-in journey. | The consent screen is shown again, despite the existing grant. |
| 4. | Select Allow. | The journey completes and an authorization code is issued. |

Post Conditions:
The following should be true after test completion:
- `prompt=consent` forced a fresh consent decision regardless of the prior grant.

## TEST CASE 8
Title: Verify that an application set to Admin consent never shows the consent screen, even with `prompt=consent`

Tags: GK ID, Consent, OAuth, Web, Negative

Pre Conditions:
The following should be true before proceeding:
- The application's consent policy is set to **Admin consent**.
- A valid customer test account is available.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start an authorization request with `prompt=consent`. | The authorization request is accepted. |
| 2. | Sign in with the valid customer test account. | The customer is authenticated. |
| 3. | Observe the sign-in journey. | No consent screen is shown, regardless of the `prompt` parameter. |

Post Conditions:
The following should be true after test completion:
- Admin consent applications never present a per-customer consent screen.

## TEST CASE 9
Title: Verify that a customer who revokes the application is asked for consent again on the next authorization

Tags: GK ID, Consent, OAuth, Web

Pre Conditions:
The following should be true before proceeding:
- The application's consent policy is set to **Ask each customer for consent**.
- The customer has an existing consent grant for this application.
- The customer can revoke the application from their linked applications (M3).

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Revoke the application from the customer's linked applications. | The existing consent grant is removed. |
| 2. | Start a new authorization request for the same application and customer. | The authorization request is accepted. |
| 3. | Sign in if required. | The customer is authenticated. |
| 4. | Observe the sign-in journey. | The consent screen is shown again, because the prior grant was revoked. |

Post Conditions:
The following should be true after test completion:
- A revoked application requires a new consent decision on the next authorization.

## TEST CASE 10
Title: Verify that switching an application's consent policy from Ask each customer to Admin consent stops the consent screen from appearing

Tags: GK ID, Consent, OAuth, Web, Edge Case

Pre Conditions:
The following should be true before proceeding:
- The application's consent policy is initially set to **Ask each customer for consent**.
- An administrator can change the application's consent policy in the admin portal.
- A valid customer test account with no existing grant is available.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Change the application's consent policy to **Admin consent**. | The policy change is saved. |
| 2. | Start an authorization request as a customer with no existing grant. | The authorization request is accepted. |
| 3. | Sign in. | The customer is authenticated. |
| 4. | Observe the sign-in journey. | No consent screen is shown, reflecting the updated policy. |

Post Conditions:
The following should be true after test completion:
- The application's current consent policy, not its historical policy, governs whether the screen appears.

## TEST CASE 11
Title: Verify that denying consent does not prevent the customer from retrying authorization for the same application

Tags: GK ID, Consent, OAuth, Web, Edge Case

Pre Conditions:
The following should be true before proceeding:
- The application's consent policy is set to **Ask each customer for consent**.
- The customer previously selected Deny for this application.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start a new authorization request for the same application and customer. | The authorization request is accepted. |
| 2. | Sign in if required. | The customer is authenticated. |
| 3. | Observe the sign-in journey. | The consent screen is shown again, since no grant exists after a prior denial. |
| 4. | Select Allow. | The journey completes and an authorization code is issued. |

Post Conditions:
The following should be true after test completion:
- A prior denial does not block a subsequent authorization attempt.

## TEST CASE 12
Title: Verify that a customer flagged for migration completes the migration flow inside the consent journey before authorization finishes

Tags: GK ID, Consent, OAuth, Web, Migration, Edge Case

Pre Conditions:
The following should be true before proceeding:
- The application's consent policy is set to **Ask each customer for consent**.
- A test account exists that needs migration
- The customer has no existing consent grant for this application.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start an authorization request for the application. | The authorization request is accepted. |
| 2. | Sign in with the test account flagged for migration. | The customer is authenticated. |
| 3. | Observe the sign-in journey after authentication. | The migration flow is presented to the customer inside the consent journey, before or alongside the consent screen. [UNCERTAIN: exact ordering — whether migration precedes consent, is combined into one screen, or follows consent — should be confirmed against the implementation.] |
| 4. | Complete the migration step(s) as prompted. | The migration completes successfully and the journey proceeds to (or continues) the consent screen. |
| 5. | Select Allow on the consent screen. | The customer is returned to the application's registered redirect URI. |
| 6. | Inspect the result. | An authorization code is issued and can be exchanged for tokens. |

Post Conditions:
The following should be true after test completion:
- The customer's account is no longer flagged as needing migration.
- A consent grant is recorded for the customer and the application.
- The client successfully completes the authorization code flow despite the customer requiring migration.

## Context applied

- `squads/platform/features/gkone-identity/getting-started.md`, M2 expected outcomes
- `playground/2026-09-17-gk-id-m1-understanding/notes.md`, for the distinction between GK ID and Entra ID and the M1/M2 boundary

## Assumptions and gaps

- The exact response GKOne returns to the client on Deny (e.g. `access_denied`) is not specified in the current notes; verify the API response.
- Whether a policy change mid-flow (case 10) applies immediately or only to new sessions should be confirmed against the implementation.
- M9 (revocation, M3) is a precondition for TEST CASE 9; confirm the revoke action is available in the current test environment before running it.
- TEST CASE 12 (migration inside consent) is based on the user's description alone; the migration flag, its trigger conditions, the exact screen ordering, and failure-path behaviour are not yet documented anywhere in this repo. Flag for team confirmation and consider capturing in `known-issues.md` or `domain-knowledge.md` once verified.

Total cases: 12 (happy path: 2, alternate valid paths: 4, negative/error: 1, edge cases: 5).

Suggested tags: GK ID, Consent, OAuth, Web, Smoke, Negative, Edge Case (confirm these match the team's tagging convention).
