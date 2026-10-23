# M9 — Questions for dev

1. **What is the "legacy sign-in"?** Is it the Entra ID path (`entraid-mobile-integration`) or a separate legacy IAM? Decides whether the Entra relationship marker in `integration-points.md` can close.
2. **Legacy token lifetime.** How is "never outlives the access token" enforced — is `expires_in` set to the access token's remaining lifetime, or is the legacy token revoked when the access token expires?
3. **Already-issued legacy tokens.** When the session ends, app access is removed, or the customer is suspended/deleted, the *exchange* fails. Do legacy tokens already issued stop working too, or do they run to expiry?
4. **Session ended but access token fresh.** After sign-out, M5 lets an app refresh and get a new access token. Does exchanging that new token return `invalid_grant` (session ended) or a legacy token?
5. **Client auth errors.** Wrong/missing `client_secret` → `invalid_client`? Credentials sent both as form fields and Basic → which error?
6. **`resource` tokens.** Is an access token with an API audience (M10 `resource`) accepted as `subject_token`?
7. **`subject_token_type`.** Required, optional or ignored? (RFC 8693 token exchange normally requires it.)
8. **Rate limit.** Fixed or sliding minute window? Keyed on `client_id`? Do rejected requests count?
9. **Test data.** How do we suspend and delete a customer in dev to test those branches?
10. **First party turned off.** Tokens already issued to the app (access and legacy) — do they keep working?
