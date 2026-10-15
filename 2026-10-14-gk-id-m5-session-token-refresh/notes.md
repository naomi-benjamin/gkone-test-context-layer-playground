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

## Dev answers (2026-10-15)

### Lifetime
- 30 days unused, sliding: each refresh pushes it forward.
- 90 days from sign-in at most, absolute: refreshing never extends past this.

### Refresh response and rotation
- A refresh returns a new `access_token`, a new `id_token` and a new `refresh_token`.
- The new `id_token` keeps the original `auth_time` and carries no `nonce`.
- Rotation: every refresh returns a new refresh token and the old one dies.
- The refreshed access token keeps the original scopes (earlier answer).

### Sign-out
- Signing out through `end_session_endpoint` (`/logout`):
  - ends the GK One session and clears its cookie;
  - deactivates that customer's access tokens for the app (`/introspect` → `active: false`, `/userinfo` → `401`).
- The refresh token **survives sign-out, by design.** It's the app's offline access (what `offline_access` asks the customer to allow). OIDC Back-Channel Logout 1.0 §2.7 says such tokens normally shouldn't be revoked at logout.

### What kills a refresh token
- The app's backend calls `POST /oauth2/v1/revoke` with it.
- The customer removes the app from their account portal. Applies to any app, first- or third-party; the customer can remove either.
- Reuse is detected (an old, rotated-out token is presented). Only the replayed old token fails; the current token keeps working, so the grant isn't revoked.
- It expires (30 days idle / 90 days absolute).
- A later sign-in to the same app replaces it.
- "Revoked application" in the M5 contract means the customer revoking (earlier answer).

### Why surviving sign-out is safe: Backend-for-frontend
- Every GK One Identity app is a confidential client with its own backend.
- The backend runs the OAuth flow and receives tokens from `/token` server to server. The browser only gets the app's own session cookie, so the customer never sees the refresh token.
- Redeeming a refresh token requires the app's `client_secret`, which never leaves the app's server. The refresh token alone is useless.

## Open questions / gaps

- **"A later sign-in replaces it"** — one refresh token per customer per app? If the customer uses the same app on two devices/browsers, does signing in on device B kill device A's refresh token?
- **Does a refresh extend the GK One session?** Earlier note said yes, but the dev's answers point the other way: the session and the refresh token are separate (logout ends one and not the other; `auth_time` doesn't move; 90-day cap counts from sign-in). Likely answer: refresh extends the *app's* access, not the GK One session, so M4 silent SSO is unaffected. Confirm if a test case depends on it.
- **Absolute 90-day cap after rotation** — does the 90 days count from the original sign-in across all rotated tokens, or reset per token? "From the sign-in" implies the original; worth one test.
- Turning `offline_access` off in the consent policy after refresh tokens were issued — do existing tokens keep working? Ties to the existing [UNCERTAIN] "Config-change impact on live sessions" in `gkone-identity/integration-points.md` / `_global/to-verify.md`.
- Email/phone change (M6) — does it kill refresh tokens? Not covered in the dev's answer list.
- Refresh token sent by a different client (wrong `client_id` / `client_secret`) — expected `invalid_grant` / `invalid_client`? Not stated. Testable directly.
- Can `/introspect` be called with a refresh token, or only access tokens? Testable directly.
- `/revoke` with an access token (rather than a refresh token) — supported? Response for an already-revoked or unknown token (RFC 7009 says `200` either way)?

## Test angles the answers opened up

- Sign out → `/introspect` access token `active: false`, `/userinfo` `401`, but refresh still succeeds and the new access token is active.
- Rotation: refresh once, then present the old refresh token → rejected; then present the current refresh token → still succeeds.
- Customer removes the app at the account portal (both a first-party and a third-party app) → next refresh fails.
- Refresh without `client_secret` (or with the wrong one) → rejected.
- New `id_token` after refresh: same `auth_time` as original, no `nonce`.
- `POST /oauth2/v1/revoke` with the refresh token → next refresh fails.
- Sign in to the same app again → previous refresh token fails.
- Lifetime: 30-day idle and 90-day absolute expiry — probably not testable in real time; ask whether QA env lifetimes can be shortened.

## Context to load for test case generation

- Primary: `squads/platform/features/gkone-identity/` (all six files) — M5 rules already in `domain-knowledge.md` M5 section and `edge-cases.md` (`offline_access` gating).
- Test data: `test-patterns.md` — one app with `offline_access` allowed, one without.
- M1–M3 sections of `getting-started.md` for setup (PKCE sign-in, consent policy config, revocation via `/account`).
