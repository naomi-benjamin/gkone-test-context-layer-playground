# M4 Test Cases — GK ID Single Sign On

## Apps used for this test

- **GKOne app** — the mobile app. Sign in here first to establish the live session. Has a **Test SSO** action that triggers the M4 flow into the GKID Test client.
- **GKID Test client** — the built-in test client (`/test-client`) registered against GK One Identity. This is the "second application" throughout — where you land, and whose consent policy (Admin consent vs Ask each customer) can be toggled in the admin portal (GK Identity → Applications) to exercise different cases below. It shows decoded claims after a successful exchange, so no separate consumer app is needed to confirm the outcome.

TEST CASE 1
Title: Verify that a customer with a live GKOne app session is silently signed in to the GKID Test client via Test SSO when the client is set to Admin consent

Tags: GK ID, SSO, Mobile, Smoke

Pre Conditions:
The following should be true before proceeding:
- Customer is signed in to the GKOne app with a live, valid session.
- The GKID Test client's consent policy is set to "Admin consent" in the admin portal.
- The GKID Test client's redirect URI is registered correctly.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | From within the GKOne app, confirm the session is active. | |
| 2. | Tap **Test SSO**. | |
| 3. | Observe the result. | Customer lands in the GKID Test client already authenticated — no sign-in screen, no consent screen. |
| 4. | Check the decoded claims shown by the test client. | Claims match the signed-in customer. |

Post Conditions:
The following should be true after test completion:
- The GKOne app session remains active and unaffected.
- The GKID Test client holds a valid access/ID token for the customer.

TEST CASE 2
Title: Verify that a customer with a live GKOne app session sees the consent screen the first time they reach the GKID Test client when it is set to Ask each customer for consent

Tags: GK ID, SSO, Consent, Mobile

Pre Conditions:
The following should be true before proceeding:
- Customer is signed in to the GKOne app with a live, valid session.
- The GKID Test client's consent policy is set to "Ask each customer for consent" in the admin portal.
- No prior consent grant exists between this customer and the GKID Test client.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | From within the GKOne app, with the session active, tap **Test SSO**. | |
| 2. | Observe the result. | Consent screen is shown, naming the GKID Test client and listing the requested scopes — sign-in itself is not repeated since a session already exists. |
| 3. | Select Allow. | Customer lands in the GKID Test client, authenticated. |

Post Conditions:
The following should be true after test completion:
- A consent grant is persisted for this customer + the GKID Test client.
- Tapping Test SSO again does not show the consent screen a second time.

TEST CASE 3
Title: Verify that a customer with a live session and an existing consent grant reaches the GKID Test client via Test SSO without seeing the consent screen again

Tags: GK ID, SSO, Consent, Regression

Pre Conditions:
The following should be true before proceeding:
- Customer is signed in to the GKOne app with a live, valid session.
- The GKID Test client's consent policy is set to "Ask each customer for consent".
- A consent grant already exists for this customer + the GKID Test client (from a prior Allow).

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | From within the GKOne app, tap **Test SSO**. | |
| 2. | Observe the result. | Customer lands in the GKID Test client, authenticated — no consent screen and no sign-in screen shown. |

Post Conditions:
The following should be true after test completion:
- The existing consent grant is unchanged (not duplicated or reset).

TEST CASE 4
Title: Verify that reaching the GKID Test client with no existing GK One session shows the ordinary sign-in screen

Tags: GK ID, SSO, Smoke

Pre Conditions:
The following should be true before proceeding:
- No active GK One session exists anywhere (customer is signed out of the GKOne app and has no live browser session).
- Note: Test SSO lives behind sign-in in the GKOne app, so a "signed out, tap Test SSO" state isn't reachable — this case is exercised by going directly to the GKID Test client instead.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Navigate directly to the GKID Test client (`/test-client`) with no active session present. | |
| 2. | Observe the result. | Ordinary sign-in screen is shown — no silent authentication occurs. |
| 3. | Complete sign-in with valid credentials. | Customer lands in the GKID Test client, authenticated. |

Post Conditions:
The following should be true after test completion:
- A new session is established for the customer. [VERIFY] whether this session also signs the customer into the GKOne app, or is scoped only to the browser/test client — not stated in source doc.

TEST CASE 5
Title: Verify that presenting an expired session directly to the GKID Test client falls back to sign-in without an error

Tags: GK ID, SSO, Session, Regression

Pre Conditions:
The following should be true before proceeding:
- Note: in the GKOne app today, an expired session forces the customer to be logged out immediately (no refresh tokens yet — M5 not shipped), so "signed in to the GKOne app with a stale expired session, tap Test SSO" isn't a reachable state. This case is exercised by presenting an expired session artifact directly to the GKID Test client instead (e.g. via the Postman collection with a captured stale session cookie/token).
- An expired session artifact is available to present manually.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Present the expired session artifact directly to the GKID Test client's authorization request. | |
| 2. | Observe the result. | Ordinary sign-in screen is shown — no error, no broken state. |

Post Conditions:
The following should be true after test completion:
- No error is logged or surfaced to the customer as a failure.
- Completing sign-in from here succeeds normally and reaches the GKID Test client.
- [VERIFY] confirm the GKOne app's force-logout-on-expiry behaviour is still current — relevant once M5 (session/token refresh) ships, since that would change whether an "expired but present" session state becomes reachable via Test SSO at all.

TEST CASE 6
Title: Verify that a revoked GKOne app session falls back to sign-in when Test SSO is tapped, without an error

Tags: GK ID, SSO, Session, Regression

Pre Conditions:
The following should be true before proceeding:
- Customer's session was explicitly ended (e.g. via "sign out everywhere else" in `/account`).
- The now-invalid session artifact is still present on the device.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | With the revoked session artifact still present, tap **Test SSO** in the GKOne app. | |
| 2. | Observe the result. | Customer sees the ordinary sign-in screen — no error, no broken state. |

Post Conditions:
The following should be true after test completion:
- No error is logged or surfaced to the customer as a failure.

TEST CASE 7
Title: Verify that a GKID Test client request carrying prompt=login forces the sign-in screen even with a live GKOne app session

Tags: GK ID, SSO, Regression

Pre Conditions:
The following should be true before proceeding:
- Customer is signed in to the GKOne app with a live, valid session.
- The authorization request to the GKID Test client includes `prompt=login` (set via the test client / Postman collection rather than the standard Test SSO tap, since this is a query-parameter-level case).

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Trigger the authorization request to the GKID Test client with `prompt=login` while the GKOne app session is active. | |
| 2. | Observe the result. | Sign-in screen is shown despite the existing session — no silent authentication occurs. |
| 3. | Re-enter credentials and submit. | Customer lands in the GKID Test client, authenticated. |

Post Conditions:
The following should be true after test completion:
- The original GKOne app session is not invalidated by this forced re-authentication (unless re-authentication explicitly replaces it — [VERIFY] confirm expected session behaviour post `prompt=login` with dev).

TEST CASE 8
Title: Verify that a GKID Test client request carrying prompt=consent shows the consent screen even when a valid consent grant already exists

Tags: GK ID, SSO, Consent, Regression

Pre Conditions:
The following should be true before proceeding:
- Customer is signed in to the GKOne app with a live, valid session.
- A consent grant already exists for this customer + the GKID Test client.
- The authorization request includes `prompt=consent` (set via the test client / Postman collection).

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Trigger the authorization request to the GKID Test client with `prompt=consent`. | |
| 2. | Observe the result. | Consent screen is shown, even though a grant already covers the GKID Test client. |
| 3. | Select Allow. | Customer lands in the GKID Test client, authenticated. |

Post Conditions:
The following should be true after test completion:
- The existing consent grant is retained/re-confirmed, not duplicated.

TEST CASE 9
Title: Verify that the GKID Test client set to Admin consent never shows a consent screen via Test SSO, regardless of the prompt parameter

Tags: GK ID, SSO, Consent, Edge Case

Pre Conditions:
The following should be true before proceeding:
- The GKID Test client's consent policy is set to "Admin consent".
- Customer is signed in to the GKOne app with a live, valid session.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Tap **Test SSO** in the GKOne app. | Customer lands in the GKID Test client, authenticated — no consent screen appears. |
| 2. | Repeat with an authorization request carrying `prompt=consent`. | Consent screen still does not appear — [VERIFY] confirm `prompt=consent` has no effect on Admin-consent applications, since this isn't explicitly stated for the M4/M2 intersection. |

Post Conditions:
The following should be true after test completion:
- No consent grant record is created (Admin-consent applications don't require per-customer grants) — [VERIFY] confirm this assumption with dev.

TEST CASE 10
Title: Verify that a tampered GKOne app session artifact is treated as invalid and falls back to sign-in when Test SSO is tapped

Tags: GK ID, SSO, Security, Negative

Pre Conditions:
The following should be true before proceeding:
- The GKOne app holds a session artifact that has been altered/corrupted (e.g. modified signature, truncated value).

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Tap **Test SSO** while the tampered session artifact is present. | |
| 2. | Observe the result. | Session is treated as invalid; customer sees the ordinary sign-in screen — no error, no silent authentication into the GKID Test client. |

Post Conditions:
The following should be true after test completion:
- The tampered artifact is not accepted for any subsequent Test SSO attempt.
- [VERIFY] whether this event is logged for security/audit purposes — not stated in source doc.

TEST CASE 11
Title: Verify that tapping Test SSO opens the GKID Test client in an embedded browser and arrives already signed in

Tags: GK ID, SSO, Mobile, Smoke

Pre Conditions:
The following should be true before proceeding:
- Customer is signed in to the GKOne app with a live session.
- `gkIdAppLauncherEnabled` feature flag is on.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | From within the GKOne app, tap **Test SSO**. | An embedded browser opens showing the GKID Test client. |
| 2. | Observe the embedded browser state. | Customer arrives already signed in — no sign-in screen shown inside the embedded browser. |

Post Conditions:
The following should be true after test completion:
- The embedded browser session (GKID Test client) reflects the same customer identity as the GKOne app session.
- [VERIFY] exact session carry-over mechanism with dev — not detailed in source doc, so failure-mode coverage beyond this happy path is limited until confirmed.

TEST CASE 12
Title: Verify that tapping Test SSO without an active GKOne app session shows the sign-in screen inside the embedded browser

Tags: GK ID, SSO, Mobile, Edge Case

Pre Conditions:
The following should be true before proceeding:
- Customer is not signed in to the GKOne app (no active session).
- `gkIdAppLauncherEnabled` feature flag is on.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Tap **Test SSO** in the GKOne app while signed out. | Embedded browser opens showing the GKID Test client. |
| 2. | Observe the embedded browser state. | Ordinary sign-in screen is shown inside the embedded browser — no error, no silent failure. |

Post Conditions:
The following should be true after test completion:
- Completing sign-in inside the embedded browser succeeds and establishes a session covering both apps.

TEST CASE 13
Title: Verify that repeatedly tapping Test SSO against an Admin-consent GKID Test client does not create duplicate tokens or session side effects

Tags: GK ID, SSO, Regression

Pre Conditions:
The following should be true before proceeding:
- Customer is signed in to the GKOne app with a live, valid session.
- The GKID Test client's consent policy is set to "Admin consent".

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Tap **Test SSO**. | Customer lands in the GKID Test client, authenticated. |
| 2. | Return to the GKOne app and tap **Test SSO** again immediately. | Customer again lands in the GKID Test client, authenticated, silently. |
| 3. | Compare the two resulting token/claim sets in the test client. | Each attempt produces its own valid, distinct token pair. |

Post Conditions:
The following should be true after test completion:
- The GKOne app's underlying session is unaffected by repeated Test SSO taps.
- No duplicate consent grants or session records are created.

---

## Summary

13 test cases — 3 happy path (1, 4, 11), 4 alternate valid paths (2, 3, 9, 13), 3 negative/error cases (6, 7, 10), 3 edge cases (5, 8, 12), all framed around the two apps actually set up for this investigation: the GKOne app (session origin) and the GKID Test client (target application, reached via the Test SSO action).

## Assumptions/flags

- Test SSO in the GKOne app is behind sign-in, so "signed out + tap Test SSO" isn't a reachable state. Case 4 now tests the "no session" rule by going directly to the GKID Test client instead, rather than via the GKOne app button.
- The GKOne app currently force-logs-out on session expiry (no refresh tokens yet — M5 not shipped), so "expired session still present, tap Test SSO" isn't reachable either. Case 5 now presents the expired artifact directly to the GKID Test client instead.
- "Require interaction" as a distinct fourth silent-SSO outcome isn't independently testable from `getting-started.md` alone — no trigger condition is described (e.g. step-up MFA, risk signal). No case written for it in isolation; logged as a gap in `notes.md` instead of guessing.
- Cases 7, 8, and 9 assume `prompt=login`/`prompt=consent` are set via the test client or Postman collection rather than the GKOne app's Test SSO tap itself, since that's a plain UI action with no parameter control — [VERIFY] confirm there's no in-app way to set these parameters, or whether a different trigger is intended.
- Several cases carry inline `[VERIFY]` markers (7, 9, 10, 11) where `getting-started.md` doesn't specify the exact expected behaviour.
- No case exercises the gkpay-biz or Entra ID relationship, since both are open `[UNCERTAIN]` markers rather than confirmed integration points.
