# M5 Test Cases — GK ID Session and Token Refresh

## Apps and tools used for this test

- **App A — GKID Test client** (`/test-client`), the client the QA Postman collection is pointed at. Its consent policy in the admin portal (GK Identity → Applications) **allows `offline_access`**. Used as the main application throughout.
- **App B — a second registered application** with its own client ID and client secret. Its consent policy **does not allow `offline_access`**. Used for the `invalid_scope` case, the cross-client cases, and as the "second app" when checking the GK One session.
- **QA Postman collection** (`GK-One-Identity-QA.postman_collection.json`) — sign in through the Authorization tab ("Get New Access Token"), and send `/token`, `/introspect`, `/userinfo` and `/revoke` requests directly. Endpoints live under `/user-profile/oauth2/v1`.

## Token naming used in the steps

- **AT1 / IT1 / RT1** — the access token, ID token and refresh token from the original sign-in.
- **AT2 / IT2 / RT2** — the tokens returned by the first refresh. **AT3 / RT3** — by the second, and so on.

A refresh request means: `POST /token` with `grant_type=refresh_token`, `refresh_token=<token>`, and App A's `client_id` and `client_secret`, unless the case says otherwise.

---

## Issuing refresh tokens

TEST CASE 1
Title: Verify that an application allowed `offline_access` receives a refresh token when the authorization request asks for that scope

Tags: GK ID, OAuth, Token Refresh, API, Smoke

Pre Conditions:
The following should be true before proceeding:
- `EnableOAuth2V1` is on.
- App A's consent policy allows `offline_access`.
- Tester has a customer account that can sign in to GK One.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | In Postman, set App A's authorization request scope to include `openid profile email offline_access`. | |
| 2. | Select **Get New Access Token** and sign in as the customer. | Sign-in completes and the token response is returned. |
| 3. | Inspect the raw token response. | Response contains an `access_token`, an `id_token` and a `refresh_token`. |

Post Conditions:
The following should be true after test completion:
- App A holds a refresh token (RT1) for the customer.

TEST CASE 2
Title: Verify that an application allowed `offline_access` receives no refresh token and no error when the authorization request does not ask for that scope

Tags: GK ID, OAuth, Token Refresh, API

Pre Conditions:
The following should be true before proceeding:
- App A's consent policy allows `offline_access`.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | In Postman, set App A's authorization request scope to `openid profile email` (no `offline_access`). | |
| 2. | Select **Get New Access Token** and sign in as the customer. | Sign-in completes without an error. |
| 3. | Inspect the raw token response. | Response contains an `access_token` and an `id_token`. No `refresh_token` is present. |

Post Conditions:
The following should be true after test completion:
- App A holds no refresh token from this sign-in.

TEST CASE 3
Title: Verify that an application not allowed `offline_access` is refused with `invalid_scope` when the authorization request asks for that scope

Tags: GK ID, OAuth, Token Refresh, API, Negative

Pre Conditions:
The following should be true before proceeding:
- App B's consent policy does not allow `offline_access`.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Build an authorization request for App B with scope `openid profile email offline_access` and valid PKCE parameters. | |
| 2. | Send the request to `/authorize`. | Request is refused with `invalid_scope`. No sign-in screen is reached and no authorization code is issued. |

Post Conditions:
The following should be true after test completion:
- No tokens are issued to App B.

---

## Refreshing

TEST CASE 4
Title: Verify that an application can exchange a refresh token for new tokens without the customer signing in again

Tags: GK ID, OAuth, Token Refresh, API, Smoke

Pre Conditions:
The following should be true before proceeding:
- App A holds AT1, IT1 and RT1 from a sign-in that asked for `offline_access` (as in Test Case 1).

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Send a refresh request with RT1. | Response is `200` and contains a new `access_token` (AT2), a new `id_token` (IT2) and a new `refresh_token` (RT2). No sign-in screen or customer interaction is required. |
| 2. | Compare AT2, IT2 and RT2 with AT1, IT1 and RT1. | All three are different values from the originals. |
| 3. | Call `/userinfo` with AT2. | Response is `200` and returns the same customer. |

Post Conditions:
The following should be true after test completion:
- App A holds a working AT2 and RT2.

TEST CASE 5
Title: Verify that the ID token returned by a refresh keeps the original `auth_time`, carries no `nonce`, and the refreshed tokens keep the original scopes

Tags: GK ID, OAuth, OpenID Connect, Token Refresh, API

Pre Conditions:
The following should be true before proceeding:
- App A holds IT1 and RT1 from a sign-in that asked for `openid profile email offline_access`.
- IT1 has been decoded and its `auth_time` and scopes noted.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Wait at least one minute after sign-in, so a changed `auth_time` would be visible. | |
| 2. | Send a refresh request with RT1. | New tokens (AT2, IT2, RT2) are returned. |
| 3. | Decode IT2 and compare its `auth_time` with IT1's. | `auth_time` in IT2 is identical to IT1's. |
| 4. | Check IT2 for a `nonce` claim. | IT2 carries no `nonce`. |
| 5. | Check the `scope` value in the refresh response, or introspect AT2. | Scopes are the same as the original grant (`openid profile email offline_access`) — no scope added or dropped. |

Post Conditions:
The following should be true after test completion:
- Refreshing has not been treated as a new sign-in.

TEST CASE 6
Title: Verify that a refreshed access token reports active at introspection and the replaced access token keeps its own expiry

Tags: GK ID, OAuth, Token Refresh, API

Pre Conditions:
The following should be true before proceeding:
- App A holds AT1 and RT1.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Send a refresh request with RT1. | AT2 and RT2 are returned. |
| 2. | Call `/introspect` with AT2. | `active: true`, with an expiry 1 hour after AT2 was issued. |
| 3. | Call `/introspect` with AT1. | Record the result. AT1 is still within its 1-hour lifetime; refreshing is not documented as deactivating it. |

Post Conditions:
The following should be true after test completion:
- AT2 is active for 1 hour from issue.

TEST CASE 7
Title: Verify that a refreshed access token reports inactive at introspection once its 1-hour lifetime has passed

Tags: GK ID, OAuth, Token Refresh, API, Regression

Pre Conditions:
The following should be true before proceeding:
- App A holds AT2 from a refresh, with its issue time noted.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Call `/introspect` with AT2 shortly before 1 hour after issue. | `active: true`. |
| 2. | Call `/introspect` with AT2 just after 1 hour after issue. | `active: false`. |
| 3. | Call `/userinfo` with AT2. | Response is `401`. |

Post Conditions:
The following should be true after test completion:
- An expired refreshed access token is treated the same as any expired access token.

---

## Rotation and reuse

TEST CASE 8
Title: Verify that a refresh token cannot be used again after it has been exchanged

Tags: GK ID, OAuth, Token Refresh, API, Security, Negative

Pre Conditions:
The following should be true before proceeding:
- App A holds RT1.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Send a refresh request with RT1. | New tokens including RT2 are returned. |
| 2. | Send a second refresh request with RT1. | Request is rejected (expected `invalid_grant`). No tokens are returned. |

Post Conditions:
The following should be true after test completion:
- RT1 is permanently unusable.

TEST CASE 9
Title: Verify that the current refresh token keeps working after an old, replaced refresh token is presented

Tags: GK ID, OAuth, Token Refresh, API, Edge Case

Pre Conditions:
The following should be true before proceeding:
- App A holds RT1.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Send a refresh request with RT1. | RT2 is returned. |
| 2. | Send a refresh request with RT1 again. | Request is rejected. |
| 3. | Send a refresh request with RT2. | Response is `200` and returns AT3, IT3 and RT3. The grant has not been revoked by the reuse attempt. |
| 4. | Call `/introspect` with AT3. | `active: true`. |

Post Conditions:
The following should be true after test completion:
- Only the reused old token was rejected; App A's access continues on RT3.

TEST CASE 10
Title: Verify that repeated refreshes each replace the previous refresh token

Tags: GK ID, OAuth, Token Refresh, API, Regression

Pre Conditions:
The following should be true before proceeding:
- App A holds RT1.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Send a refresh request with RT1. | RT2 is returned. |
| 2. | Send a refresh request with RT2. | RT3 is returned. |
| 3. | Send a refresh request with RT3. | RT4 is returned. |
| 4. | Send a refresh request with RT2. | Request is rejected. |
| 5. | Send a refresh request with RT4. | Response is `200` and returns RT5. |

Post Conditions:
The following should be true after test completion:
- Only the most recently issued refresh token works at any point in the chain.

---

## Sign-out and the GK One session

TEST CASE 11
Title: Verify that a refresh token keeps working after the customer signs out, while their access tokens are deactivated

Tags: GK ID, OAuth, Token Refresh, Session, API, Edge Case

Pre Conditions:
The following should be true before proceeding:
- Customer has signed in to App A with `offline_access`; App A holds AT1 and RT1.
- The `end_session_endpoint` URL has been taken from the discovery document.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Call `/introspect` with AT1. | `active: true`. |
| 2. | In the same browser session used to sign in, go to the `end_session_endpoint` (`/logout`). | Customer is signed out of GK One and the GK One session cookie is cleared. |
| 3. | Call `/introspect` with AT1. | `active: false`. |
| 4. | Call `/userinfo` with AT1. | Response is `401`. |
| 5. | Send a refresh request with RT1. | Response is `200` and returns AT2, IT2 and RT2. |
| 6. | Call `/introspect` with AT2. | `active: true`. |

Post Conditions:
The following should be true after test completion:
- The GK One session is ended, but App A's offline access survives through the refresh token.

TEST CASE 12
Title: Verify that refreshing tokens does not keep the customer's GK One session alive for other applications after sign-out

Tags: GK ID, OAuth, Token Refresh, SSO, Session, Edge Case

Pre Conditions:
The following should be true before proceeding:
- Customer has signed in to App A with `offline_access` in a browser; App A holds RT1.
- App B is registered with a valid redirect URI.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | In the same browser, go to the `end_session_endpoint` (`/logout`). | Customer is signed out of GK One. |
| 2. | Send a refresh request with RT1. | New tokens are returned. |
| 3. | In the same browser, start an authorization request for App B. | The ordinary GK One sign-in screen is shown. The customer is not silently signed in to App B. |

Post Conditions:
The following should be true after test completion:
- App A still has access through its refresh token.
- No GK One session exists in the browser until the customer signs in again.

---

## What ends a refresh token

TEST CASE 13
Title: Verify that a refresh token stops working when the customer removes the application from their account portal

Tags: GK ID, OAuth, Token Refresh, Account Management, Web, Regression

Pre Conditions:
The following should be true before proceeding:
- Customer has signed in to App A with `offline_access`; App A holds AT1 and RT1.
- App A appears in the customer's linked applications at `/account`.
- Run this case once with a first-party application and once with a third-party application, if both are registered.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Send a refresh request with RT1. | RT2 is returned. |
| 2. | Signed in as the customer, go to `/account` and revoke App A, confirming the prompt. | App A disappears from the linked applications list without a page reload. |
| 3. | Send a refresh request with RT2. | Request is rejected (expected `invalid_grant`). No tokens are returned. |
| 4. | Call `/introspect` with AT2. | `active: false`. |

Post Conditions:
The following should be true after test completion:
- App A has no working tokens for the customer.
- The customer's GK One session is unaffected.

TEST CASE 14
Title: Verify that a refresh token stops working when the application revokes it through `/revoke`

Tags: GK ID, OAuth, Token Refresh, API, Regression

Pre Conditions:
The following should be true before proceeding:
- App A holds RT1.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Send `POST /oauth2/v1/revoke` with `token=<RT1>` and App A's `client_id` and `client_secret`. | Response is `200`. |
| 2. | Send a refresh request with RT1. | Request is rejected (expected `invalid_grant`). No tokens are returned. |

Post Conditions:
The following should be true after test completion:
- RT1 is permanently unusable.

TEST CASE 15
Title: Verify that a new sign-in to the same application replaces the previous refresh token

Tags: GK ID, OAuth, Token Refresh, API, Edge Case

Pre Conditions:
The following should be true before proceeding:
- Customer has signed in to App A with `offline_access`; App A holds RT1.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | In the same browser/Postman session, sign in to App A again with `offline_access` (use `prompt=login` if a session is still live). | A new refresh token (RT1-new) is returned. |
| 2. | Send a refresh request with RT1 (the original). | Request is rejected. |
| 3. | Send a refresh request with RT1-new. | Response is `200` and returns new tokens. |

Post Conditions:
The following should be true after test completion:
- Only the refresh token from the latest sign-in works.

---

## Client authentication and request validation

TEST CASE 16
Title: Verify that a refresh request is rejected with `invalid_client` when the client secret is wrong or missing

Tags: GK ID, OAuth, Token Refresh, API, Security, Negative

Pre Conditions:
The following should be true before proceeding:
- App A holds a current, unused refresh token (RT1).

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Send a refresh request with RT1 and App A's `client_id`, but an incorrect `client_secret`. | Request is rejected with `invalid_client` (expected status `401`). No tokens are returned. |
| 2. | Send a refresh request with RT1 and App A's `client_id`, with no `client_secret`. | Request is rejected with `invalid_client`. No tokens are returned. |
| 3. | Send a refresh request with RT1 and App A's correct `client_id` and `client_secret`. | Response is `200` and returns new tokens. |

Post Conditions:
The following should be true after test completion:
- The failed attempts did not use up or revoke RT1.

TEST CASE 17
Title: Verify that a refresh token issued to one application cannot be redeemed with another application's credentials

Tags: GK ID, OAuth, Token Refresh, API, Security, Negative

Pre Conditions:
The following should be true before proceeding:
- App A holds a current refresh token (RT1).
- App B's `client_id` and `client_secret` are known.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Send a refresh request with RT1 using App B's `client_id` and `client_secret`. | Request is rejected with `invalid_grant` (expected status `400`). No tokens are returned. |
| 2. | Send a refresh request with RT1 using App A's credentials. | Record whether RT1 still works after the cross-client attempt. |

Post Conditions:
The following should be true after test completion:
- App B has received no tokens for the customer.

TEST CASE 18
Title: Verify that a refresh request with an invalid or missing refresh token is rejected

Tags: GK ID, OAuth, Token Refresh, API, Negative

Pre Conditions:
The following should be true before proceeding:
- App A's `client_id` and `client_secret` are known.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Send a refresh request with `refresh_token` set to a made-up value. | Request is rejected (expected `invalid_grant`). |
| 2. | Send a refresh request with RT1 with one character changed. | Request is rejected (expected `invalid_grant`). |
| 3. | Send a refresh request with the `refresh_token` parameter left out. | Request is rejected (expected `invalid_request`). |

Post Conditions:
The following should be true after test completion:
- No tokens are issued.

TEST CASE 19
Title: Verify that a token request with a grant type other than `authorization_code` or `refresh_token` returns `unsupported_grant_type`

Tags: GK ID, OAuth, API, Negative

Pre Conditions:
The following should be true before proceeding:
- App A's `client_id` and `client_secret` are known.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Send `POST /token` with `grant_type=client_credentials`. | Response is `unsupported_grant_type`. |
| 2. | Send `POST /token` with `grant_type=password`. | Response is `unsupported_grant_type`. |
| 3. | Send `POST /token` with `grant_type=made_up_value`. | Response is `unsupported_grant_type`. |

Post Conditions:
The following should be true after test completion:
- No tokens are issued.

---

## Exploratory — expected result not yet confirmed

Each of these records what happens. If the result looks wrong, raise it with the dev before logging a bug.

TEST CASE 20
Title: Verify whether signing in to the same application on a second device ends the first device's refresh token

Tags: GK ID, OAuth, Token Refresh, Session, Edge Case

Pre Conditions:
The following should be true before proceeding:
- Two separate browsers or devices (Device 1 and Device 2), with no shared cookies.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | On Device 1, sign in to App A with `offline_access`. | RT-D1 is returned. |
| 2. | On Device 2, sign in to App A with the same customer and `offline_access`. | RT-D2 is returned. |
| 3. | Send a refresh request with RT-D1. | Record whether it succeeds or is rejected. |
| 4. | Send a refresh request with RT-D2. | Response is `200`. |

Post Conditions:
The following should be true after test completion:
- The result of step 3 is recorded and shared with the dev to confirm intended behaviour.

TEST CASE 21
Title: Verify whether an existing refresh token keeps working after `offline_access` is turned off in the application's consent policy

Tags: GK ID, OAuth, Token Refresh, Consent, Edge Case

Pre Conditions:
The following should be true before proceeding:
- App A holds a current refresh token (RT1) issued while `offline_access` was allowed.
- Tester has admin portal access to change App A's consent policy.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | In the admin portal, turn off `offline_access` in App A's consent policy and save. | Policy saves. |
| 2. | Send a refresh request with RT1. | Record whether it succeeds or is rejected, and the error code if rejected. |
| 3. | Start a new authorization request for App A asking for `offline_access`. | Request is refused with `invalid_scope`. |

Post Conditions:
The following should be true after test completion:
- App A's consent policy is restored to allow `offline_access`.
- The result of step 2 is recorded (it also answers the "config-change impact on live sessions" question for the feature docs).

TEST CASE 22
Title: Verify how `/introspect` responds when called with a refresh token

Tags: GK ID, OAuth, Token Refresh, API, Edge Case

Pre Conditions:
The following should be true before proceeding:
- App A holds a current refresh token (RT1) and a replaced one (RT0).

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Call `/introspect` with RT1. | Record the response: supported (`active: true` with details) or not supported. |
| 2. | Call `/introspect` with RT0. | If refresh tokens are supported, `active: false`. Record the response. |

Post Conditions:
The following should be true after test completion:
- Whether `/introspect` supports refresh tokens is recorded.

TEST CASE 23
Title: Verify how `/revoke` responds to an access token, an already-revoked token and an unknown token

Tags: GK ID, OAuth, API, Edge Case

Pre Conditions:
The following should be true before proceeding:
- App A holds a current AT1 and RT1.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Send `POST /oauth2/v1/revoke` with `token=<AT1>`. | Record the response. |
| 2. | Call `/introspect` with AT1. | Record whether AT1 is now inactive. |
| 3. | Revoke RT1, then send `/revoke` with RT1 again. | Record the response (the OAuth standard expects `200`). |
| 4. | Send `/revoke` with a made-up token value. | Record the response (the OAuth standard expects `200`). |

Post Conditions:
The following should be true after test completion:
- `/revoke` behaviour for each token type is recorded.

---

## Lifetimes — needs shortened lifetimes in QA

These can't be run in real time at 30 and 90 days. Ask the dev whether the refresh token lifetimes can be shortened in the QA environment, then substitute the configured values.

TEST CASE 24
Title: Verify that a refresh token expires when it has not been used for 30 days

Tags: GK ID, OAuth, Token Refresh, API, Negative

Pre Conditions:
The following should be true before proceeding:
- Refresh token idle lifetime is known ([configured idle lifetime], 30 days in production).
- App A holds RT1 and RT2 from two separate sign-ins, with issue times noted.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Just before the idle lifetime passes since RT1 was issued, send a refresh request with RT1. | Response is `200`. |
| 2. | Leave RT2 unused until just after the idle lifetime passes since it was issued, then send a refresh request with RT2. | Request is rejected (expected `invalid_grant`). |

Post Conditions:
The following should be true after test completion:
- An unused refresh token expires at the idle lifetime.

TEST CASE 25
Title: Verify that each refresh extends the refresh token's idle lifetime

Tags: GK ID, OAuth, Token Refresh, API, Edge Case

Pre Conditions:
The following should be true before proceeding:
- Refresh token idle lifetime is known ([configured idle lifetime]).
- App A holds RT1.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Partway through the idle lifetime, send a refresh request with RT1. | RT2 is returned. |
| 2. | After the point where RT1's original idle lifetime would have run out, but within RT2's own idle lifetime, send a refresh request with RT2. | Response is `200`. The idle window restarted at the refresh. |

Post Conditions:
The following should be true after test completion:
- Regular use keeps a refresh token alive, up to the absolute limit.

TEST CASE 26
Title: Verify that refreshing cannot extend access beyond 90 days from the original sign-in

Tags: GK ID, OAuth, Token Refresh, API, Negative

Pre Conditions:
The following should be true before proceeding:
- Refresh token absolute lifetime is known ([configured absolute lifetime], 90 days in production).
- Customer's original sign-in time is noted.
- **Open decision:** this case follows the dev's answer that the 90 days count from the original sign-in. If the cap is decided to restart with each new refresh token, rewrite this case.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Sign in to App A with `offline_access` and note the sign-in time. | RT1 is returned. |
| 2. | Keep refreshing within the idle lifetime until just before the absolute lifetime from sign-in. | Each refresh returns `200` and a new refresh token. |
| 3. | Just after the absolute lifetime from the original sign-in, send a refresh request with the latest refresh token. | Request is rejected (expected `invalid_grant`), even though the token itself was issued recently. |

Post Conditions:
The following should be true after test completion:
- The customer must sign in again for App A to regain offline access.

---

## Context applied

- **Playground input:** `notes.md` in this folder — Answered section (lifetime, refresh response and rotation, sign-out, refresh vs GK One session, what kills a refresh token, client authentication), Still open section (cases 20–23, 26), Test angles list.
- **Primary — `gkone-identity/getting-started.md`:** M5 expected outcomes (cases 1–4, 6–7, 13, 19); Postman collection and endpoint list (all cases); M3 revoke-from-`/account` steps (case 13).
- **Primary — `domain-knowledge.md`:** M5 rules (cases 1–3); M1 1-hour access token lifetime (cases 6–7); M3 revocation invalidating refresh tokens (case 13); M4 no-session → sign-in screen (case 12).
- **Primary — `edge-cases.md`:** "`offline_access` requires both policy allowance and an explicit scope request" (cases 1–3); "Revoking an application doesn't end the underlying session" (case 13 post-condition).
- **Primary — `test-patterns.md`:** data setup recipe of one app with `offline_access` and one without (App A / App B); token lifetimes; Postman tooling notes.
- **Primary — `integration-points.md`:** `EnableOAuth2V1` flag (case 1). The [UNCERTAIN] "config-change impact on live sessions" marker is what case 21 is designed to answer — not relied on for an expected result.
- **Primary — `overview.md`, `known-issues.md`:** no known issues logged; nothing excluded.
- **Related (checked, empty):** `entraid-mobile-integration/known-issues.md`, `gkpay-biz/known-issues.md`. No case leaned on related-feature context.
- **Global:** `squad.md` compliance note (session/token lifetimes are compliance-relevant). No global file shaped a specific case.
- **Not from the repo or dev:** error codes marked "expected" (`invalid_grant`, `invalid_client`, `invalid_request`, the `200` responses from `/revoke`) follow the OAuth standard rather than a confirmed GK One answer — cases 8, 13–18, 23–26.
