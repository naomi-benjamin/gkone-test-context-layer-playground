# GK ID M9 — Legacy IAM token bridge

Source: milestone contract in `squads/platform/features/gkone-identity/getting-started.md`, M9 section. Folder created 2026-10-23.

## Why it exists

- Existing GK applications keep working on the new sign in, with no change on their side
- The bank can switch to the new sign in without migrating every application on the same day
- Customers notice nothing during the transition

## What it covers

A first-party application's backend trades a GK One Identity access token for the legacy identity token of the same customer:

```
POST /user-profile/oauth2/v1/token
grant_type=iam_token
subject_token=<GK One Identity access token>
client_id=...
client_secret=...        (form fields OR Basic auth, not both)
```

Response: `access_token` (the legacy token), `token_type`, `expires_in`.

The legacy token is the one the legacy sign-in issues, so the existing `/api` endpoints and `gkone-core` accept it with no change. An app moving to the new sign-in adds this one call in its backend. The bank moves apps one at a time by marking each first party in the admin portal (M10 switch).

The discovery document does not list this grant, on purpose.

## Expected outcomes

- A first-party application that exchanges a valid access token receives a legacy token for the same customer, and that token works on the existing `/api` endpoints and on `gkone-core`.
- The legacy token never outlives the access token it came from.
- An application that is not first party gets `unauthorized_client`.
- An ID token or a legacy token sent as `subject_token` gets `invalid_grant`.
- An access token issued to a different application gets `invalid_grant`.
- Once the customer's session ends, their access to the application is removed, or the customer no longer exists, the exchange answers `invalid_grant`.
- A suspended customer gets `invalid_grant`.
- A request missing `subject_token` or `client_id` gets `invalid_request`.
- More than 60 requests a minute from one application get `429` with `Retry-After: 60`.

## Related context already in the repo

- **M5 client auth:** every app is a confidential client; `client_secret` never leaves the backend. Wrong/missing secret → `invalid_client` is still an assumption (`domain-knowledge.md` → M5 → Client authentication).
- **M5 sign-out:** sign-out deactivates access tokens (`/introspect` → `active: false`) but the refresh token survives, and refreshing after sign-out still works.
- **M5 refresh:** refreshing does not deactivate the previous access token — it stays active until its own `exp`.
- **M10:** first-party switch is what makes an app eligible. Access tokens can carry a `resource` audience. Removing a GK app from `/account` is blocked (`400`), so "access to the application is removed" can't come from the customer for a first-party app.
- **M11:** ending another browser's sessions sends it to sign-in at its *next visit*.
- **M5 Postman collection:** `playground/2026-10-14-gk-id-m5-session-token-refresh/GK One Identity — QA (dev).postman_collection.json` — base for M9 requests.

## Test angles to work through

**Happy path**
- Exchange → legacy token → call a `/api` endpoint and a `gkone-core` endpoint; confirm the customer identity matches the GK One Identity `sub`/email.
- Credentials as form fields; credentials as Basic auth (separate runs).
- `expires_in` ≤ remaining lifetime of the subject access token. Exchange near the end of the access token's hour and check the legacy token is capped, then confirm it fails on `/api` after the access token's `exp`.

**Client**
- Outside app (not first party) → `unauthorized_client`.
- First-party app switched off → `unauthorized_client`; switched back on → works.
- Credentials in both form and Basic → ? (contract says "not both" but doesn't name the error).
- Wrong / missing `client_secret` → ? (only `subject_token` and `client_id` are named for `invalid_request`).

**Subject token**
- ID token → `invalid_grant`. Legacy token → `invalid_grant`. Another app's access token → `invalid_grant`.
- Expired access token → presumably `invalid_grant`.
- Access token requested with `resource` (aud = API identifier) → ? not covered.
- Access token from a refresh (M5) → should work. The *pre-refresh* access token, still active → ?
- Garbage / truncated JWT → `invalid_grant` or `invalid_request`?

**Customer / session state**
- After sign-out (`/logout`) → `invalid_grant`.
- **Sharp edge:** sign out, then refresh (M5 allows this), then exchange the new access token. The session is ended but the access token is fresh — contract says `invalid_grant`. Check which wins.
- Session ended from another browser via M11 End sessions → `invalid_grant`.
- Suspended customer → `invalid_grant`. Deleted customer → `invalid_grant`.
- Legacy tokens already issued before any of these — do they keep working until their own expiry?

**Missing params**
- No `subject_token` → `invalid_request`. No `client_id` → `invalid_request`. No `grant_type`?

**Rate limit**
- 61 requests inside a minute from one app → 61st gets `429` + `Retry-After: 60`.
- A second app is unaffected while the first is throttled (per-application).
- Do failed requests count towards the 60?

**Discovery**
- `grant_types_supported` in `.well-known/openid-configuration` does not list `iam_token`.

## Open questions

See `questions.md`.
