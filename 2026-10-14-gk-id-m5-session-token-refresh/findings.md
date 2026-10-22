# M5 findings

Results from running `test-cases-draft.md` via `postman-run-sheet.md`. Dev environment, test client `43dcd764-…`.

## Run 2026-10-21

| TC | Result | Notes |
|---|---|---|
| 1 | PASS | |
| 2 | PASS | |
| 3 | PASS | |
| 4 | PASS | |
| 5 | PASS | `auth_time` unchanged after refresh (1792531187); original ID token had `nonce`, refreshed one doesn't; access token `scope` identical before and after. |
| 6 | Recorded | AT2 `active: true`. AT1 (the replaced access token) is **still `active: true`** after the refresh — refreshing doesn't deactivate the previous access token; it runs to its own `exp`. |
| 7 | Blocked | Lifetime claim is correct (AT2 `iat` 09:36:20, `exp` 10:36:20 EST — exactly 3600s), but AT2 was already dead by 10:02, so the expiry boundary couldn't be observed. See finding below. Rerun with a token nothing else touches for the hour (e.g. a second test customer). |
| 8 | PASS | |
| 9 | PASS | |
| 10 | PASS | |

## Observations

- **An access token was deactivated ~34 min before its expiry.** AT2 (from TC6, `exp` 10:36:20 EST) introspected `active: false` at ~10:02 with a working bearer. Between TC6 and the check, TC8–10 ran: each started with a new SIGN IN to the same app as the same customer, plus refreshes and rejected reuse attempts. Suspected cause: **a new sign-in to the same app deactivates the customer's earlier access tokens for that app**, along with replacing the refresh token. Not yet isolated — see the confirm test below. If confirmed, it's not in the dev's list (which only says a later sign-in replaces the *refresh* token), so ask whether it's intended.
  - Confirm test attempted ~10:10; introspect returned `{"error": "invalid_grant", "error_description": "The refresh token is not valid."}`. Unresolved: body token may have been a refresh token (would mean introspect errors instead of returning `active: false` per RFC 7662 — TC22 territory). Re-run, checking the body value starts with `eyJ`.
  - **Confirm test:** SIGN IN → copy `accessToken` → `atx` → introspect `{{atx}}` (`active: true`) → SIGN IN again → introspect `{{atx}}` with the new token as bearer. `active: false` = the new sign-in killed it.

- **The sign-ins today reused a GK One session from yesterday.** `auth_time` is 2026-10-20 16:19:47 EST; the tokens were issued 2026-10-21 ~09:35 EST. So "SIGN IN" was silently satisfied by a ~17-hour-old GK One session (M4 silent SSO), not a fresh sign-in. GK One session lifetime isn't documented anywhere — compliance-relevant per `squad.md`.
- **Introspection returns customer details and account status.** Beyond the standard RFC 7662 fields, `/introspect` returns `email`, `name`, `phone_number`, `oid`, `tenant_id`, `lockout_enabled` and `kyc_status` (e.g. `TIER_1`). Any app holding a valid bearer can read a customer's KYC tier and lockout flag this way. Ask the dev whether that's intended.
- **TC7 rerun:** `tc7` issued 10:07:06 EST, `exp` 11:07:06 EST. Checks due 11:02 (expect active) and 11:09 (expect inactive / `401`).
- **Plain `/logout` is rejected.** Opening `https://app-gkone-identity-001-dev.azurewebsites.net/logout` in the browser redirects to `/logout/failed`: "This sign-out link is not valid. Close this tab, or sign out from the application you came from." Sign-out needs at least `id_token_hint` (standard OIDC RP-initiated logout), possibly `client_id` + `post_logout_redirect_uri` matching the app's registered logout URL. The collection's `04 · End session` instruction ("open in a browser") is incomplete. Blocks TC11/TC12 until the working link is confirmed.
- **Access token scope includes `phone`**: `openid profile email phone offline_access`, and the ID token carries `phone_number`. The collection's default `scope` variable doesn't ask for `phone`. If the variable wasn't changed, the server is granting a scope that wasn't requested.
