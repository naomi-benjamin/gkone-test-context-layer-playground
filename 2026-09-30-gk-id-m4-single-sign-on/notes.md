# GK ID M4 — Single Sign On

Source: milestone contract in `squads/platform/features/gkone-identity/getting-started.md`, M4 section.

## Scope

- Silent single sign authentication (Backend and frontend)

## What is in place

When a customer who already holds a GK One session reaches an authorization request, the identity API attempts the authorization without showing a screen.

The attempt resolves one of four ways: redirect the customer back to the application, show the consent screen, require interaction, or treat the session as invalid.

A related path carries a session from GK One Mobile into an embedded browser, so a customer who opens a GKID app from the GKOne Mobile app arrives already signed in.

## Expected outcomes

- A customer with a live session reaching a second application is returned to it without typing a password.
- A customer with no session sees the ordinary sign-in screen.
- An expired or revoked session falls back to sign-in and does not error.
- `prompt=login` forces the sign-in screen even where a session exists.

## Open questions / gaps

- No trigger condition is described for the "require interaction" branch of the four-way silent-SSO resolution — couldn't design an isolated test case for it without guessing.
- Exact mechanism behind the mobile-to-embedded-browser session carry-over (cookie jar, URI scheme, token hand-off) isn't detailed.
- Relationship between this SSO surface and `entraid-mobile-integration` (Entra ID as external IdP) is unconfirmed — [UNCERTAIN] marker logged in `_global/to-verify.md`.
- Relationship between this SSO surface and gkpay-biz merchant portal auth is unconfirmed — [UNCERTAIN] marker logged in both `gkone-identity/integration-points.md` and `gkpay-biz/integration-points.md`.

## Context used for test case generation

- Primary: `squads/platform/features/gkone-identity/` (all six files, scaffolded 2026-09-30 from this contract)
- Related (checked, empty): `squads/platform/features/entraid-mobile-integration/known-issues.md`, `squads/payments/features/gkpay-biz/known-issues.md`
- M1–M3 sections of `getting-started.md` for session/consent test-data setup (PKCE sign-in, consent policy types, revocation via `/account`)
