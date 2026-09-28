# M1 Execution Checklist

Use `[x] PASS` or `[x] FAIL` after running a case. Leave `[ ] NOT RUN` until then.

- [x] TEST CASE 1: Standard GK ID sign-in with PKCE.
- [x] TEST CASE 2: `profile` scope claims.
- [x] TEST CASE 3: `email` scope claim.
- [x] TEST CASE 4: `phone` scope claim.
- [x] TEST CASE 5: Combination of requested scopes.
- [x] TEST CASE 6: Automatic `openid` scope.
- [x] TEST CASE 7: Unsupported or unauthorized scope.
- [x] TEST CASE 8: Missing PKCE `code_challenge`.
- [ ] TEST CASE 9: Missing required token fields.
- [ ] TEST CASE 10: Mismatched PKCE `code_verifier`.
- [x] TEST CASE 11: Reused authorization code.
- [x] TEST CASE 12: Changed redirect URI.
- [x] TEST CASE 13: Discovery document without subscription key.
- [x] TEST CASE 14: Expired authorization code.
- [x] TEST CASE 15: `profile` deselected.
- [x] TEST CASE 16: `email` deselected.
- [x] TEST CASE 17: `phone` deselected.
- [ ] NOT RUN - TEST CASE 18: `offline_access` not requested.
- [ ] NOT RUN - TEST CASE 19: `userinfo` without an access token.
- [ ] NOT RUN - TEST CASE 20: Malformed access token.
- [ ] NOT RUN - TEST CASE 21: Tampered access token.
- [ ] NOT RUN - TEST CASE 22: Token used with the wrong client.
- [ ] NOT RUN - TEST CASE 23: Expired access token.
- [ ] NOT RUN - TEST CASE 24: Revoked session or client access.
- [ ] NOT RUN - TEST CASE 25: Malformed token request.

---

# M1 Test Cases - GK ID Standard Sign-In and Scopes

## TEST CASE 1
Title: Verify that a registered client can complete the standard GK ID sign-in flow using PKCE

Tags: GK ID, OAuth, Web, API, Smoke

Pre Conditions:
The following should be true before proceeding:
- `EnableOAuth2V1` is enabled.
- The built-in test client is registered in GK ID.
- The registered redirect URI exactly matches the test client's callback URI.
- A valid customer test account is available.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Open the GK One Identity test client. | The registration details and sign-in controls are displayed. |
| 2. | Select `profile` and `email`, then start sign-in. | The client starts an authorization request and redirects to GK ID sign-in. |
| 3. | Sign in with the valid customer test account. | GK ID authenticates the customer and returns the client to the registered redirect URI. |
| 4. | Complete the authorization-code exchange using the generated PKCE `code_verifier`. | The client receives an access token and ID token. |
| 5. | Call `userinfo` with the access token. | The response contains claims for the signed-in customer. |

Post Conditions:
The following should be true after test completion:
- The client has completed a successful authorization-code flow.
- The returned tokens belong to the signed-in customer.

## TEST CASE 2
Title: Verify that the client receives only the claims associated with the requested `profile` scope

Tags: GK ID, OAuth, OpenID Connect, API

Pre Conditions:
The following should be true before proceeding:
- The test client is registered and its redirect URI is valid.
- A valid customer test account is available.
- The client can inspect the ID token and call `userinfo`.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start a new authorization request with `openid profile` and no `email` or `phone` scope. | The authorization request is accepted. |
| 2. | Complete sign-in and exchange the authorization code using the matching PKCE verifier. | The client receives tokens. |
| 3. | Inspect the ID token and `userinfo` response. | Basic profile claims are available; email and phone claims are not added solely because `profile` was requested. |

Post Conditions:
The following should be true after test completion:
- The authorization grant reflects the requested scopes only.

## TEST CASE 3
Title: Verify that the client receives the email claim when the `email` scope is requested

Tags: GK ID, OAuth, OpenID Connect, API

Pre Conditions:
The following should be true before proceeding:
- The test client is registered and a valid customer test account is available.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start a new authorization request with `openid email`. | The authorization request is accepted. |
| 2. | Complete sign-in and exchange the authorization code using the matching PKCE verifier. | The client receives tokens. |
| 3. | Inspect the ID token and call `userinfo`. | The signed-in customer's email claim is returned. |

Post Conditions:
The following should be true after test completion:
- The returned email belongs to the signed-in customer.

## TEST CASE 4
Title: Verify that the client receives the phone claim when the `phone` scope is requested

Tags: GK ID, OAuth, OpenID Connect, API

Pre Conditions:
The following should be true before proceeding:
- The test client is registered and a valid customer test account with a phone number is available.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start a new authorization request with `openid phone`. | The authorization request is accepted. |
| 2. | Complete sign-in and exchange the authorization code using the matching PKCE verifier. | The client receives tokens. |
| 3. | Inspect the ID token and call `userinfo`. | The signed-in customer's phone claim is returned. |

Post Conditions:
The following should be true after test completion:
- The returned phone claim belongs to the signed-in customer.

## TEST CASE 5
Title: Verify that a client receives the claims for a valid combination of requested scopes

Tags: GK ID, OAuth, OpenID Connect, API

Pre Conditions:
The following should be true before proceeding:
- The test client is registered and a valid customer test account has profile, email, and phone data.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start a new authorization request with `openid profile email phone`. | The authorization request is accepted. |
| 2. | Complete sign-in and exchange the authorization code using the matching PKCE verifier. | The client receives tokens. |
| 3. | Inspect the ID token and call `userinfo`. | The response contains the requested profile, email, and phone claims for the signed-in customer. |
| 4. | Repeat the request with `openid profile email`. | The response contains profile and email claims, without requiring the phone claim. |

Post Conditions:
The following should be true after test completion:
- The claims returned match the scopes granted to the client.

## TEST CASE 6
Title: Verify that `openid` is included and enables the OpenID Connect sign-in response

Tags: GK ID, OAuth, OpenID Connect, API

Pre Conditions:
The following should be true before proceeding:
- The test client is registered and a valid customer test account is available.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start a sign-in request without manually selecting `openid`. | The test client includes `openid` automatically in the authorization request. |
| 2. | Complete sign-in and exchange the authorization code. | The response includes an ID token as part of the OpenID Connect flow. |
| 3. | Inspect the ID token. | The token identifies the authenticated customer and is issued for the registered client. |

Post Conditions:
The following should be true after test completion:
- The client has completed an OpenID Connect sign-in.

## TEST CASE 7
Title: Verify that an unauthorized or unsupported scope is rejected

Tags: GK ID, OAuth, API, Negative

Pre Conditions:
The following should be true before proceeding:
- The test client is registered.
- The requested scope is not registered or allowed for the client.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start an authorization request containing the unsupported or unauthorized scope. | GK ID rejects the request with the expected OAuth scope error. |
| 2. | Inspect the response. | No authorization code or tokens are issued. |

Post Conditions:
The following should be true after test completion:
- No authorization grant is created for the rejected scope.

## TEST CASE 8
Title: Verify that an authorization request without a PKCE `code_challenge` is rejected

Tags: GK ID, OAuth, PKCE, API, Negative

Pre Conditions:
The following should be true before proceeding:
- The test client is registered.
- A valid authorization request can be created with the `code_challenge` removed.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Send an authorization request without a `code_challenge`. | GK ID rejects the request. |
| 2. | Inspect the response. | No authorization code is issued. |

Post Conditions:
The following should be true after test completion:
- The client cannot complete an authorization-code flow without PKCE.

## TEST CASE 9
Title: Verify that a token request with missing required fields returns `invalid_request`

Tags: GK ID, OAuth, PKCE, API, Negative

Pre Conditions:
The following should be true before proceeding:
- A valid authorization code has been issued.
- The token endpoint is available.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Submit separate token requests with `code_verifier`, `code`, `redirect_uri`, or `client_id` omitted one at a time. | Each request is rejected. |
| 2. | Inspect each token response. | Each response returns `invalid_request` and no token is issued. |

Post Conditions:
The following should be true after test completion:
- Missing required token-exchange fields cannot produce tokens.

## TEST CASE 10
Title: Verify that a token request with a mismatched PKCE `code_verifier` is rejected

Tags: GK ID, OAuth, PKCE, API, Negative

Pre Conditions:
The following should be true before proceeding:
- A valid authorization code has been issued for a known `code_challenge`.
- A different `code_verifier` is available.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Submit the token request with the authorization code and the mismatched `code_verifier`. | GK ID rejects the token request. |
| 2. | Retry the token request with the original `code` and correct `code_verifier`. | The authorization code is no longer reusable and the request remains rejected. |

Post Conditions:
The following should be true after test completion:
- No token is issued for a mismatched PKCE verifier.
- The attempted authorization code cannot be reused.

## TEST CASE 11
Title: Verify that an authorization code cannot be reused after a successful token exchange

Tags: GK ID, OAuth, API, Negative

Pre Conditions:
The following should be true before proceeding:
- A valid authorization code and matching PKCE verifier are available.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Exchange the authorization code successfully. | Access and ID tokens are returned. |
| 2. | Submit the same authorization code and verifier again. | The second exchange is rejected and no additional tokens are issued. |

Post Conditions:
The following should be true after test completion:
- An authorization code is single-use.

## TEST CASE 12
Title: Verify that a changed redirect URI is rejected during authorization or token exchange

Tags: GK ID, OAuth, API, Negative

Pre Conditions:
The following should be true before proceeding:
- The client has one exact redirect URI registered.
- A redirect URI differing by at least one character is available.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start an authorization request using the changed redirect URI. | GK ID rejects the request. |
| 2. | If an authorization code is issued before the mismatch is detected, submit the token request using the changed redirect URI. | The token request is rejected and no token is issued. |

Post Conditions:
The following should be true after test completion:
- Redirect URI matching is exact and cannot be bypassed by a near match.

## TEST CASE 13
Title: Verify that the discovery document is available without a subscription key

Tags: GK ID, OAuth, API, Smoke

Pre Conditions:
The following should be true before proceeding:
- The dev GK ID API is available.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Send a GET request to the OpenID Connect discovery URL without a subscription key. | The request succeeds. |
| 2. | Inspect the response body. | The document contains the authorization, token, userinfo, introspection, JWKS, and supported-scope configuration needed by a client. |

Post Conditions:
The following should be true after test completion:
- A client can discover the GK ID OAuth configuration without a subscription key.

## TEST CASE 14
Title: Verify that an expired authorization code cannot be exchanged for tokens

Tags: GK ID, OAuth, API, Negative

Pre Conditions:
The following should be true before proceeding:
- A valid authorization code can be captured.
- The test can wait at least 60 seconds or otherwise use a controlled expired-code fixture.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Capture a newly issued authorization code. | The code is available for exchange. |
| 2. | Wait until the code is more than 60 seconds old. | The code is expired. |
| 3. | Submit the token request with the expired code and matching verifier. | The request is rejected and no token is issued. |

Post Conditions:
The following should be true after test completion:
- Expired authorization codes cannot be exchanged.

## TEST CASE 15
Title: Verify that profile claims are omitted when the `profile` scope is deselected

Tags: GK ID, OAuth, OpenID Connect, API, Negative

Pre Conditions:
The following should be true before proceeding:
- The test client is registered and its redirect URI is valid.
- A valid customer test account with profile, email, and phone data is available.
- The previous test-client session has been forgotten or signed out so that the result is from a new authorization request.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start a new sign-in request with `profile` deselected and only `openid email` selected. | The authorization request shows or records `openid email` without `profile`. |
| 2. | Complete sign-in and exchange the authorization code using the matching PKCE verifier. | The client receives tokens. |
| 3. | Inspect the ID token and call `userinfo`. | The authentication claims remain available and the email claim is returned. |
| 4. | Check the returned claims for profile information. | `name`, `given_name`, and `family_name` are absent when `profile` is not requested. `phone_number` is also absent because `phone` was not requested. |

Post Conditions:
The following should be true after test completion:
- The granted scope is limited to `openid email`.
- No profile or phone claims are returned solely from a previously completed sign-in.

## TEST CASE 16
Title: Verify that the email claim is omitted when the `email` scope is deselected

Tags: GK ID, OAuth, OpenID Connect, API, Negative

Pre Conditions:
The following should be true before proceeding:
- The test client is registered and its redirect URI is valid.
- A valid customer test account with profile, email, and phone data is available.
- The previous test-client session has been forgotten or signed out.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start a new sign-in request with `email` deselected and only `openid profile phone` selected. | The authorization request shows or records `openid profile phone` without `email`. |
| 2. | Complete sign-in and exchange the authorization code using the matching PKCE verifier. | The client receives tokens. |
| 3. | Inspect the ID token and call `userinfo`. | Profile and phone claims are returned, but the email claim is absent when `email` is not requested. |

Post Conditions:
The following should be true after test completion:
- The granted scope is limited to `openid profile phone`.
- The email claim is not returned solely because it was present in a previous sign-in.

## TEST CASE 17
Title: Verify that the phone claim is omitted when the `phone` scope is deselected

Tags: GK ID, OAuth, OpenID Connect, API, Negative

Pre Conditions:
The following should be true before proceeding:
- The test client is registered and its redirect URI is valid.
- A valid customer test account with profile, email, and phone data is available.
- The previous test-client session has been forgotten or signed out.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start a new sign-in request with `phone` deselected and only `openid profile email` selected. | The authorization request shows or records `openid profile email` without `phone`. |
| 2. | Complete sign-in and exchange the authorization code using the matching PKCE verifier. | The client receives tokens. |
| 3. | Inspect the ID token and call `userinfo`. | Profile and email claims are returned, but the phone claim is absent when `phone` is not requested. |

Post Conditions:
The following should be true after test completion:
- The granted scope is limited to `openid profile email`.
- The phone claim is not returned solely because it was present in a previous sign-in.

## TEST CASE 18
Title: Verify that no refresh token is issued when `offline_access` is not requested

Tags: GK ID, OAuth, API, Negative

Pre Conditions:
The following should be true before proceeding:
- The test client is registered and its consent policy allows normal sign-in scopes.
- `offline_access` is not selected in the authorization request.
- A valid customer test account is available.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Start a new sign-in request with `openid profile email` and leave `offline_access` deselected. | The requested scope does not include `offline_access`. |
| 2. | Complete sign-in and exchange the authorization code. | Access and ID tokens are issued. |
| 3. | Inspect the granted scope and token response. | `offline_access` is not granted and no refresh token is issued. |

Post Conditions:
The following should be true after test completion:
- A scope that was not requested does not result in a refresh token.

## TEST CASE 19
Title: Verify that `userinfo` rejects a request without an access token

Tags: GK ID, OAuth, API, Negative

Pre Conditions:
The following should be true before proceeding:
- The `userinfo` endpoint is available.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Send a request to `userinfo` without an access token. | The request is rejected with an authentication error. |
| 2. | Inspect the response. | No customer claims are returned and no internal error details are exposed. |

Post Conditions:
The following should be true after test completion:
- An unauthenticated request cannot access customer information.

## TEST CASE 20
Title: Verify that `userinfo` rejects a malformed access token

Tags: GK ID, OAuth, API, Negative

Pre Conditions:
The following should be true before proceeding:
- The `userinfo` endpoint is available.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Send a request to `userinfo` with a malformed or truncated bearer token. | The request is rejected with an authentication error. |
| 2. | Inspect the response. | No customer claims, token contents, stack trace, or internal error details are returned. |

Post Conditions:
The following should be true after test completion:
- Malformed bearer tokens cannot access customer information.

## TEST CASE 21
Title: Verify that `userinfo` rejects a token with a tampered payload or signature

Tags: GK ID, OAuth, API, Security, Negative

Pre Conditions:
The following should be true before proceeding:
- A valid access token is available.
- The token can be modified in a non-production test tool without exposing secrets.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Change a claim in the token payload or alter its signature without re-signing it. | The modified token is no longer valid. |
| 2. | Send a request to `userinfo` using the modified token. | The request is rejected and no customer claims are returned. |

Post Conditions:
The following should be true after test completion:
- Token integrity and signature validation cannot be bypassed.

## TEST CASE 22
Title: Verify that a token issued for one client cannot be used as another client

Tags: GK ID, OAuth, API, Security, Negative

Pre Conditions:
The following should be true before proceeding:
- Two registered clients with different client IDs are available.
- A valid token issued for the first client is available.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Present the first client's token to the second client's protected request or validation flow. | The token is rejected because it was not issued for the second client. |
| 2. | Inspect the response. | No customer claims or unauthorized access are returned. |

Post Conditions:
The following should be true after test completion:
- Tokens cannot be used across registered clients.

## TEST CASE 23
Title: Verify that `userinfo` rejects an expired access token

Tags: GK ID, OAuth, API, Negative

Pre Conditions:
The following should be true before proceeding:
- A valid access token is available.
- The test can wait for expiry or use a controlled expired-token fixture.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Wait until the access token is expired or submit a controlled expired token. | The token is no longer valid. |
| 2. | Call `userinfo` with the expired access token. | The request is rejected and no customer claims are returned. |

Post Conditions:
The following should be true after test completion:
- An expired access token cannot access `userinfo`.

## TEST CASE 24
Title: Verify that a revoked session or client grant invalidates previously issued access

Tags: GK ID, OAuth, API, Security, Negative

Pre Conditions:
The following should be true before proceeding:
- A valid access token has been issued to the test client.
- The customer can revoke the client or end the relevant session.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Revoke the client's access or end the session associated with the token. | The grant or session is revoked. |
| 2. | Call `userinfo` using the previously issued access token. | The request is rejected and no customer claims are returned. |

Post Conditions:
The following should be true after test completion:
- Revoking access invalidates previously issued access as required by the grant/session model.

## TEST CASE 25
Title: Verify that a malformed token request is rejected without issuing tokens

Tags: GK ID, OAuth, API, Negative

Pre Conditions:
The following should be true before proceeding:
- The token endpoint is available.
- A valid authorization code and client registration are available for comparison.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Submit token requests with an empty required value, missing `grant_type`, duplicate parameters, or incorrectly encoded values, one variation at a time. | Each malformed request is rejected with a controlled OAuth error. |
| 2. | Inspect each response. | No access token, ID token, refresh token, stack trace, or sensitive diagnostic details are returned. |

Post Conditions:
The following should be true after test completion:
- Malformed token requests cannot produce tokens or expose internal errors.

## Context applied

- `playground/2026-09-17-gk-id-m1-understanding/notes.md`
- `squads/platform/features/gkone-identity/getting-started.md`, M1 expected outcomes
- `squads/platform/features/entraid-mobile-integration/overview.md` and `integration-points.md` for the distinction between Entra authentication and GK ID OAuth

## Assumptions and gaps

- Exact claim names and whether a claim appears in the ID token, `userinfo`, or both should be confirmed against the discovery document and observed responses.
- The exact error code for an unsupported scope is not specified in the current notes; verify the API response.
- The test client automatically includes `openid` based on the supplied UI; confirm this by inspecting the actual authorization request.
- Entra-specific authentication is not included as a mandatory M1 case because the repo does not confirm that Entra uses the same `/oauth2/v1` service.
- Token expiry tests may require a controlled test fixture or time manipulation.

Total cases: 25 (happy path: 1, alternate valid scope paths: 5, negative/error: 18, edge/verification: 1).

Suggested tags: GK ID, OAuth, OpenID Connect, PKCE, Web, API, Negative, Smoke (confirm these match the team's tagging convention).
