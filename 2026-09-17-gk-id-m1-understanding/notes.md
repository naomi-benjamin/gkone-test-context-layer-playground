# GK ID M1 and Entra ID

## Plain-language model

- **Entra ID** is Microsoft's identity service. It checks the person's credentials and any Microsoft-controlled rules, such as tenant access or Conditional Access.
- **GK ID** is GKOne's identity layer. It gives a GKOne-facing application a controlled way to start sign-in, receive the result, and establish a GKOne session.
- **GKOne** is the product using that session. Once GKOne trusts the result, the person can use authenticated GKOne features.
- A **third-party client** is another application that wants to use GK ID sign-in. It must be registered so GK ID knows which application is allowed to ask for sign-in, where it may receive the result, and which information it is requesting.

The important correction is that the third-party application normally does not receive a person's Entra password. The person signs in with Entra, Entra returns proof of authentication, and GKOne validates that proof before creating its own session.

## How the pieces fit

```text
Third-party app
    -> asks GK ID to sign the person in
GK ID
    -> sends the person to Entra when Entra is the configured identity provider
Entra ID
    -> authenticates the person and returns an authorization result
GK ID / GKOne auth service
    -> validates the result and creates a GKOne session
Third-party app or GKOne
    -> uses the GKOne session/tokens to access allowed features
```

This means "GK ID sits on top of Entra ID" is a useful working model, but the exact service boundary is not fully documented. The repo confirms that Entra validates the person and GKOne validates the resulting token, then issues its own session token. It does not yet prove whether the Entra auth service is exactly the same service that owns the M1 `/oauth2/v1` endpoints.

## What M1 tests

M1 is the standard OAuth sign-in plumbing for a registered client:

1. The client is registered with a client ID and exact redirect URI.
2. The client starts an authorization request.
3. GK ID sends the person through sign-in.
4. GK ID returns a short-lived authorization code.
5. The client exchanges the code using the matching PKCE verifier.
6. GK ID returns tokens and the client can call an authenticated endpoint such as `userinfo`.

M1 tester path:

- Confirm `EnableOAuth2V1` is enabled.
- Use the built-in test client or the Postman collection.
- Complete one successful sign-in and token exchange.
- Verify `userinfo` returns the signed-in person's claims.
- Verify the discovery document loads without a subscription key.
- Verify missing `code_challenge`, missing token fields, a wrong `code_verifier`, a reused/expired code, and a changed redirect URI are rejected as described in `getting-started.md`.

M2 covers consent, M3 covers linked applications and session management, M4 covers silent sign-on, and M5 covers refresh tokens. Entra-specific login testing should be added to M1 only when the acceptance criteria explicitly require the Entra identity-provider path.

## Scope behaviour to evaluate

- Confirm what claims or information each scope adds to the ID token or `userinfo` response: `profile`, `email`, and `phone`.
- Confirm that `openid` is always included and that it enables the OpenID Connect sign-in response.
- Request each ordinary scope individually, then in combinations, and verify the returned claims match the scopes granted.
- Request a scope that is not registered or allowed for the client and verify the request is rejected with the expected error.
- Request `offline_access` when it is allowed and verify a refresh token is issued.
- Request `offline_access` without enabling it in the application's consent policy and verify the request is rejected with `invalid_scope`.
- Request `offline_access` without selecting it and verify that no refresh token is returned and no error occurs.

### Suggested M1 scope test set

- `openid` only — `openid` is included by default and enables the OpenID Connect sign-in response.
- `openid profile` — verify basic profile claims.
- `openid email` — verify the email claim.
- `openid phone` — verify the phone claim.
- `openid profile email` — verify both requested claim groups.
- `openid profile email phone` — verify all requested claim groups.
- An unsupported or unauthorized scope — verify the expected rejection.

For each request, compare the ID token and `userinfo` response with the scopes requested. `offline_access` may appear on the same sign-in screen, but evaluate it primarily under M5 because it controls whether a refresh token is issued.

## Open architecture question

[UNCERTAIN] Confirm whether the Entra auth service and the GK ID OAuth `/oauth2/v1` service are the same service or two connected layers. This determines whether an Entra login is itself an M1 test or an integration test spanning M1 and `entraid-mobile-integration`.
