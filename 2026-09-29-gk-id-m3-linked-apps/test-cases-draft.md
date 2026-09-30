# M3 Test Cases — GK ID Linked Applications Self Service

TEST CASE 1
Title: Verify that a signed-in customer can view their linked applications and signed-in sessions on /account

Tags: GK ID, Account Management, Web, Smoke

Pre Conditions:
The following should be true before proceeding:
- A customer test account has a valid, active session.
- The customer has consented to at least one third-party application.
- The customer is signed in on at least one other device or browser in addition to the current one.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Navigate to `/account`. | The page loads and displays three panels: profile summary, linked applications, and signed-in sessions. |
| 2. | Observe the profile summary panel. | The signed-in customer's profile details are shown. |
| 3. | Observe the linked applications panel. | Each application the customer has consented to is listed as a row with a revoke action. |
| 4. | Observe the signed-in sessions panel. | Every device/browser holding a live session for the customer is listed. |

Post Conditions:
The following should be true after test completion:
- No data belonging to another customer is visible on the page.

TEST CASE 2
Title: Verify that an unauthenticated visitor cannot access /account

Tags: GK ID, Account Management, Web, Security, Regression

Pre Conditions:
The following should be true before proceeding:
- The browser holds no valid GK One session (signed out, or a fresh/private browser context).

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Navigate directly to `/account` without signing in. | The visitor is not shown another customer's data; the request is redirected to sign-in or otherwise rejected. |

Post Conditions:
The following should be true after test completion:
- No profile, application, or session data was rendered to the unauthenticated visitor.

TEST CASE 3
Title: Verify that an expired or invalidated session accessing /account is treated as unauthenticated

Tags: GK ID, Account Management, Web, Session, Regression

Pre Conditions:
The following should be true before proceeding:
- A customer had a valid session that has since expired or been invalidated (e.g. via "sign out everywhere else" from another browser).

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | With the expired/invalidated session's browser, navigate to `/account`. | The customer is treated as signed out and is not shown account data; the request is redirected to sign-in. |

Post Conditions:
The following should be true after test completion:
- The stale session was not honoured to render account data.

TEST CASE 4
Title: Verify that the linked applications list shows every application the customer has consented to and nothing else

Tags: GK ID, Account Management, Consent, Web, Regression

Pre Conditions:
The following should be true before proceeding:
- The customer has an established consent grant for two or more distinct applications.
- At least one other application exists in the system that this customer has never consented to.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Navigate to `/account` and open the linked applications panel. | Every application the customer has an active consent grant for is listed. |
| 2. | Compare the listed applications against the applications the customer has not consented to. | No application the customer has not consented to appears in the list. |

Post Conditions:
The following should be true after test completion:
- The linked applications list exactly matches the customer's active consent grants.

TEST CASE 5
Title: Verify that revoking an application asks for confirmation before acting

Tags: GK ID, Account Management, Web, Smoke

Pre Conditions:
The following should be true before proceeding:
- The customer has an active consent grant for at least one application, visible in the linked applications panel.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Select the revoke action on an application row. | A confirmation prompt is shown before any access is revoked. |

Post Conditions:
The following should be true after test completion:
- No revoke action has taken effect yet; the application remains listed until the confirmation is actioned.

TEST CASE 6
Title: Verify that cancelling the revoke confirmation leaves the application's access unchanged

Tags: GK ID, Account Management, Web, Regression

Pre Conditions:
The following should be true before proceeding:
- The customer has an active consent grant for at least one application.
- The revoke confirmation prompt is open for that application.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Dismiss or cancel the confirmation prompt instead of confirming. | The prompt closes and no revoke action is taken. |
| 2. | Refresh the linked applications panel. | The application row is still present. |
| 3. | Use the application's existing access token to call an authenticated endpoint. | The token is still accepted. |

Post Conditions:
The following should be true after test completion:
- The application's consent grant and existing tokens remain valid.

TEST CASE 7
Title: Verify that confirming the revoke action removes the application row without a page reload

Tags: GK ID, Account Management, Web, Smoke

Pre Conditions:
The following should be true before proceeding:
- The customer has an active consent grant for at least one application, visible in the linked applications panel.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Select the revoke action on an application row and confirm. | The confirmation is accepted. |
| 2. | Observe the linked applications panel immediately after confirming, without refreshing the page. | The row for the revoked application disappears from the panel without a full page reload. |

Post Conditions:
The following should be true after test completion:
- The revoked application no longer appears in the linked applications panel.

TEST CASE 8
Title: Verify that a revoked application's existing access token stops working

Tags: GK ID, Account Management, OAuth, Security, Regression

Pre Conditions:
The following should be true before proceeding:
- An application has an active consent grant and the customer holds a currently valid access token issued under that grant.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Revoke the application from the linked applications panel and confirm. | The application's access is revoked. |
| 2. | Use the previously issued access token to call an authenticated endpoint (e.g. `userinfo`). | The request is rejected; the token is no longer accepted. |
| 3. | Introspect the access token. | The token is reported as inactive. |

Post Conditions:
The following should be true after test completion:
- The revoked application's access token no longer grants access to protected resources.

TEST CASE 9
Title: Verify that a revoked application's existing refresh token stops working when the application had offline_access

Tags: GK ID, Account Management, OAuth, Security, Regression

Pre Conditions:
The following should be true before proceeding:
- The application's consent policy allows `offline_access`.
- The customer's authorization for the application requested `offline_access`, and a refresh token was issued.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Revoke the application from the linked applications panel and confirm. | The application's access is revoked. |
| 2. | Attempt to exchange the previously issued refresh token for a new access token. | The request is rejected; the refresh token no longer works. |

Post Conditions:
The following should be true after test completion:
- The revoked application cannot obtain new access tokens via its previously issued refresh token.

TEST CASE 10
Title: Verify that revoking an application with no refresh token issued only invalidates the access token

Tags: GK ID, Account Management, OAuth, Regression

Pre Conditions:
The following should be true before proceeding:
- The application's consent policy does not allow `offline_access`, or the authorization did not request it.
- No refresh token was issued for this grant; only an access token exists.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Revoke the application from the linked applications panel and confirm. | The application's access is revoked. |
| 2. | Use the previously issued access token to call an authenticated endpoint. | The request is rejected. |

Post Conditions:
The following should be true after test completion:
- The revoked application's access token no longer works, and no refresh token exists to test separately.

TEST CASE 11
Title: Verify that signing in again to a revoked application shows the consent screen

Tags: GK ID, Account Management, Consent, OAuth, Web, Regression

Pre Conditions:
The following should be true before proceeding:
- The customer previously consented to an application and has since revoked it via the linked applications panel.
- The application's consent policy is set to **Ask each customer for consent**.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start a new authorization request for the revoked application. | The authorization request is accepted. |
| 2. | Sign in with the same customer test account. | The customer is authenticated. |
| 3. | Observe the sign-in journey after authentication. | The consent screen is shown again, naming the application and its requested scopes. |

Post Conditions:
The following should be true after test completion:
- The application does not appear as already-consented until the customer allows it again.

TEST CASE 12
Title: Verify the outcome of revoking an application whose consent policy is Admin consent

Tags: GK ID, Account Management, Consent, OAuth, Web

Pre Conditions:
The following should be true before proceeding:
- An application's consent policy is set to **Admin consent**.
- The customer has an existing access/session under this application (established without a consent screen, per Admin consent behaviour).

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Confirm the application appears in the customer's linked applications panel. | The application is listed even though no per-customer consent screen was ever shown. |
| 2. | Revoke the application and confirm. | [UNCERTAIN] The revoke action's effect on an Admin-consent application is not documented — confirm whether revoke is available at all for Admin-consent applications, and if so, what it does given the organisation (not the customer) owns the consent decision. |
| 3. | Start a new authorization request for the same application. | [UNCERTAIN] Confirm whether the customer is signed straight back in without a screen (consistent with Admin consent policy) or is shown a consent screen (consistent with per-application revoke behaviour in Test Case 11). This is a direct conflict between the M2 rule ("Admin consent never shows the screen") and the M3 rule ("revoke shows the consent screen again") that needs a product answer before this case can be asserted either way. |

Post Conditions:
The following should be true after test completion:
- [VERIFY: expected behaviour for revoke on an Admin-consent application / ask GK ID product owner or dev]

TEST CASE 13
Title: Verify that revoking a customer's only remaining linked application succeeds and leaves the list empty

Tags: GK ID, Account Management, Web, Edge Case

Pre Conditions:
The following should be true before proceeding:
- The customer has exactly one active consent grant, for a single application.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Revoke the sole application from the linked applications panel and confirm. | The application's access is revoked. |
| 2. | Observe the linked applications panel. | The panel shows an empty state with no application rows. |

Post Conditions:
The following should be true after test completion:
- The linked applications list is empty and the page does not error in this state.

TEST CASE 14
Title: Verify that the signed-in sessions panel lists the current session and marks it as current

Tags: GK ID, Account Management, Session, Web, Smoke

Pre Conditions:
The following should be true before proceeding:
- The customer is signed in on the current browser.
- The customer is also signed in on at least one other device or browser.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Navigate to `/account` and open the signed-in sessions panel. | Every live session is listed, including the one being used to view the page. |
| 2. | Identify the entry corresponding to the current browser. | That entry is visibly marked as the current session, distinct from the others. |

Post Conditions:
The following should be true after test completion:
- Exactly one session in the panel is marked as current, and it corresponds to the browser in use.

TEST CASE 15
Title: Verify that ending a single other session invalidates only that session

Tags: GK ID, Account Management, Session, Web, Regression

Pre Conditions:
The following should be true before proceeding:
- The customer has a live session on the current browser and at least one other live session on a different device/browser.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | In the sessions panel, end the session that is not the current one. | The targeted session is removed from the panel. |
| 2. | On the device/browser whose session was ended, attempt to use the application. | The session is no longer valid; the customer is required to sign in again on that device. |
| 3. | On the current browser, attempt to use the application. | The current session remains valid and the customer stays signed in. |

Post Conditions:
The following should be true after test completion:
- Only the targeted session was invalidated; the current session and any other untouched sessions remain live.

TEST CASE 16
Title: Verify that no action in the sessions panel signs the customer out of the browser they are using

Tags: GK ID, Account Management, Session, Web, Regression

Pre Conditions:
The following should be true before proceeding:
- The customer is viewing `/account` on the current browser with a live session.
- At least one other live session exists on a different device/browser.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Attempt to locate an option to end the current session's entry in the sessions panel. | No available action ends the current session from within the panel (the current session's row does not offer an end/revoke action, or attempting it has no effect). |
| 2. | End one or more other sessions from the panel. | The other sessions are ended. |
| 3. | Reload `/account` on the current browser. | The customer remains signed in and the page loads normally. |

Post Conditions:
The following should be true after test completion:
- The current browser's session was not affected by any action taken in the sessions panel.

TEST CASE 17
Title: Verify that "Sign out everywhere else" clears every other session and leaves the current one working

Tags: GK ID, Account Management, Session, Web, Smoke

Pre Conditions:
The following should be true before proceeding:
- The customer has live sessions on three or more devices/browsers, including the current one.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | On the current browser, select "Sign out everywhere else." | The action is accepted. |
| 2. | Observe the sessions panel. | Only the current session remains listed. |
| 3. | On each of the other previously signed-in devices/browsers, attempt to use the application. | Each is signed out and required to sign in again. |
| 4. | On the current browser, reload `/account`. | The customer remains signed in and the page loads normally. |

Post Conditions:
The following should be true after test completion:
- Exactly one live session remains — the current one — and all others have been invalidated.

TEST CASE 18
Title: Verify that a silent sign-on attempt from another application does not succeed using a session ended via "Sign out everywhere else"

Tags: GK ID, Account Management, Session, OAuth, Web, Edge Case

Pre Conditions:
The following should be true before proceeding:
- A customer had a live session on a second browser that was ended via "Sign out everywhere else" from the current browser.
- A registered application is configured to attempt silent authorization against that now-ended session.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | From the browser whose session was ended, trigger a silent sign-on (silent authorization) attempt for the application. | The attempt does not resolve as an existing valid session; the customer is shown the ordinary sign-in screen rather than being silently authorized. |

Post Conditions:
The following should be true after test completion:
- The ended session was not usable to complete a silent sign-on.

TEST CASE 19
Title: Verify that ending a session does not affect a different device's session marked as belonging to an Entra-originated sign-in

Tags: GK ID, Account Management, Session, Entra ID, Edge Case

Pre Conditions:
The following should be true before proceeding:
- The customer has a live GK One session originating from a native sign-in on one device and a live session originating from an Entra ID sign-in on another device.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | End the native-origin session from the sessions panel. | [UNCERTAIN] Whether Entra-originated sessions are held in the same shared session store and subject to the same end/timeout behaviour as native sessions is not confirmed (see `squads/platform/features/entraid-mobile-integration/integration-points.md`). Confirm the Entra session is unaffected and still listed as live. |

Post Conditions:
The following should be true after test completion:
- [VERIFY: whether Entra-originated sessions share the same session store/lifecycle as native sessions / ask platform squad dev]

TEST CASE 20
Title: Verify that revoking the same application twice in quick succession (double-click / race) does not error

Tags: GK ID, Account Management, Web, Edge Case

Pre Conditions:
The following should be true before proceeding:
- The customer has an active consent grant for at least one application.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Trigger the revoke confirmation for an application, then submit the confirmation twice in rapid succession (e.g. double-click, or trigger the request from two open tabs at the same time). | The application is revoked exactly once; the second confirmation either no-ops gracefully or returns a clear "already revoked" outcome rather than an unhandled error. |
| 2. | Reload the linked applications panel. | The application appears exactly once in the revoked state — i.e. it does not appear at all, and no duplicate or corrupted entry is present. |

Post Conditions:
The following should be true after test completion:
- The application's consent grant is revoked cleanly with no duplicate revoke side effects or error state left behind.
