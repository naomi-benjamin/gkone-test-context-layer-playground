# GK ID M5 — Session and Token Refresh

Source: milestone contract in `squads/platform/features/gkone-identity/getting-started.md`, M5 section. Dev answers to open questions added 2026-10-15.

## Scope

- Session and token refresh (Backend)

## What is in place

A refresh token reaches an application only where an operator allowed `offline_access` for it, in the consent policy under GK Identity → Applications, and the authorization request asks for that scope. New applications start with `profile` and `email`, so `offline_access` stays off until someone turns it on.

## Expected outcomes

- An application whose consent policy allows `offline_access`, asking for that scope, receives a refresh token alongside the access token.
- The same application asking without the scope receives no refresh token, and no error. Asking is what triggers it.
- An application whose consent policy does not allow `offline_access`, asking for it, is refused at `/authorize` with `invalid_scope`.
- A refresh token exchanges for a new access token without the customer signing in again.
- A grant type other than `authorization_code` or `refresh_token` returns `unsupported_grant_type`.
- A refresh token belonging to a revoked application stops working.
- Introspection reports an access token as active before expiry and inactive after it, and inactive once its grant is revoked.

## Answered

Dev answers 2026-10-15, plus decisions made since. Items marked *(expected)* are our assumption, not confirmed by the dev — testing confirms them.

### Lifetime
- 30 days unused, sliding: each refresh pushes it forward.
- 90 days from sign-in at most, absolute: refreshing never extends past this. (How this interacts with rotation is still open, see below.)

### Refresh response and rotation
- A refresh returns a new `access_token`, a new `id_token` and a new `refresh_token`.
- The new `id_token` keeps the original `auth_time` and carries no `nonce`.
- The refreshed access token keeps the original scopes.
- Rotation: every refresh returns a new refresh token and the old one dies.
- Reuse: presenting an old, rotated-out token fails, but only that token. The current token keeps working; the grant isn't revoked.

### Sign-out
- Signing out through `end_session_endpoint` (`/logout`):
  - ends the GK One session and clears its cookie;
  - deactivates that customer's access tokens for the app (`/introspect` → `active: false`, `/userinfo` → `401`).
- The refresh token **survives sign-out, by design.** It's the app's offline access (what `offline_access` asks the customer to allow). OIDC Back-Channel Logout 1.0 §2.7 says such tokens normally shouldn't be revoked at logout.

### Refresh vs GK One session
- A refresh extends the *app's* access, not the GK One session. Logout ends the GK One session but not the refresh token; `auth_time` doesn't move on refresh; the 90-day cap counts from sign-in. So M4 silent SSO is unaffected by refreshing.

### What kills a refresh token
- The app's backend calls `POST /oauth2/v1/revoke` with it.
- The customer removes the app from their account portal. Any app, first- or third-party, can be removed. This is what "revoked application" in the M5 contract means.
- Reuse of an old token (kills only that old token, see above).
- It expires (30 days idle / 90 days absolute).
- A later sign-in to the same app replaces it.

### Client authentication: Backend-for-frontend
- Every GK One Identity app is a confidential client with its own backend.
- The backend runs the OAuth flow and receives tokens from `/token` server to server. The browser only gets the app's own session cookie, so the customer never sees the refresh token.
- Redeeming a refresh token requires the app's `client_secret`, which never leaves the app's server. The refresh token alone is useless.
- *(expected)* Wrong or missing `client_secret` → `invalid_client`. Valid app B credentials with app A's refresh token → `invalid_grant`. Same behaviour as for session tokens.

### Moved out of M5
- Whether an email/phone change kills refresh tokens → `playground/2026-10-20-gk-id-m6-email-phone-update/notes.md`.

## Still open

### Needs a decision
- **90-day cap after rotation** — counts from the original sign-in, or resets with each rotated token? Your note says "per token", but the dev said "90 days from the sign-in at most… refreshing never extends it", which means the original sign-in. Per token would let a refresh token live forever through rotation.

### Testing will answer
- **Two devices, same app:** does signing in on device B kill device A's refresh token? Exploratory — record what happens.
- **`offline_access` turned off** in the consent policy after refresh tokens were issued — do existing tokens keep working? Result also resolves the [UNCERTAIN] "Config-change impact on live sessions" in `gkone-identity/integration-points.md` / `_global/to-verify.md`.
- **`/introspect` with a refresh token** — supported, or access tokens only?
- **`/revoke` with an access token** (rather than a refresh token) — supported? Response for an already-revoked or unknown token (RFC 7009 says `200` either way)?

### Practical
- 30-day idle and 90-day absolute expiry can't be tested in real time — ask whether QA env lifetimes can be shortened.

## Test angles

- Sign out → `/introspect` access token `active: false`, `/userinfo` `401`, but refresh still succeeds and the new access token is active.
- Sign out of GK One while the app keeps refreshing → opening a second app shows the sign-in screen, not silent SSO.
- Rotation: refresh once, then present the old refresh token → rejected; then present the current refresh token → still succeeds.
- New `id_token` after refresh: same `auth_time` as original, no `nonce`; scopes unchanged.
- Customer removes the app at the account portal (a first-party and a third-party app) → next refresh fails.
- `POST /oauth2/v1/revoke` with the refresh token → next refresh fails.
- Sign in to the same app again → previous refresh token fails.
- Wrong/missing `client_secret` → `invalid_client`; app B credentials with app A's refresh token → `invalid_grant`.
- Two devices: sign in on A, sign in on B, refresh with A → observe. Exploratory.
- `offline_access` turned off after issue → refresh with existing token → observe. Exploratory.
- `/introspect` with a refresh token; `/revoke` with an access token, an already-revoked token, an unknown token → observe.
- Lifetime: 30-day idle and 90-day absolute expiry — pending shortened QA lifetimes.

## Context to load for test case generation

- Primary: `squads/platform/features/gkone-identity/` (all six files) — M5 rules already in `domain-knowledge.md` M5 section and `edge-cases.md` (`offline_access` gating).
- Test data: `test-patterns.md` — one app with `offline_access` allowed, one without.
- M1–M3 sections of `getting-started.md` for setup (PKCE sign-in, consent policy config, revocation via `/account`).
