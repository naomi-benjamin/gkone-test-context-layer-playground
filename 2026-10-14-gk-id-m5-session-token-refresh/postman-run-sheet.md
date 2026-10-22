# M5 Postman run sheet

Which request to hit for each step in `test-cases-draft.md`. Folder names are from the **GK One Identity — QA (dev)** collection.

---

## Read this first (the gotchas)

1. **Get refresh tokens from folder 02, not the Authorization tab.** Postman's OAuth helper keeps the refresh token to itself. Folder 01 is only useful for an access token.
2. **The sign-in loop (call it "SIGN IN" below):**
   1. Run **02 · Build the sign-in URL**. Copy the URL from the Postman console.
   2. Open it in your browser and sign in.
   3. Copy the `code` from the address bar into the `authCode` collection variable.
   4. Run **02 · Exchange code for tokens** **within 60 seconds** (codes expire). The console says "Refresh token captured." when you got one.
   - Tokens land in `accessToken`, `idToken`, `refreshToken`.
3. **"Refresh the access token" overwrites `refreshToken` and `accessToken` every time.** For any case that reuses an *old* token, copy the old value somewhere first. Easiest: add collection variables `rt1`, `rt2`, `at1` and paste values into them before refreshing.
4. **A failed refresh wipes `accessToken`** (its script sets it to `''` when there's no `access_token` in the response). `refreshToken` is safe.
5. **The refresh request doesn't save the new `id_token`.** Read it from the response body. Decode it at jwt.io.
6. **Introspect needs a working bearer.** The Authorization tab bearer authorises the call, and the body `token` is the token being checked. If the bearer is the same token and it's dead, you get `401` instead of `active: false`. Both mean the token is dead. For a clean `active: false`, put a fresh working token in the bearer and the old token in the body.
7. **Sign out happens in the browser.** **04 · End session** just prints the URL (`https://app-gkone-identity-001-dev.azurewebsites.net/logout`). Open it in **the same browser you signed in with** in SIGN IN.
8. **There's no `/revoke` request in the collection.** Make one: duplicate **02 · Refresh the access token**, rename it "Revoke token", change the URL to `{{issuer}}/revoke`, and set the body to `token={{refreshToken}}`, `client_id={{clientId}}`, `client_secret={{clientSecret}}`. Delete the test script so it doesn't overwrite your variables.
9. **App B = swap `clientId` and `clientSecret`** to App B's values. App B also needs `https://oauth.pstmn.io/v1/callback` registered as a redirect URI. When signing in to App B without testing `offline_access`, set `scope` to `openid profile email`, or you'll get `invalid_scope`. **Swap back to App A afterwards.**

---

## Issuing refresh tokens

**TC1 — refresh token issued (allowed + asked)** [PASS]
| Step | Do this |
|---|---|
| 1 | Check the `scope` variable is `openid profile email offline_access` (the default). |
| 2 | SIGN IN. |
| 3 | Look at the **Exchange code for tokens** response body: `access_token`, `id_token`, `refresh_token`. |

**TC2 — no refresh token (allowed + not asked)** [PASS]
| Step | Do this |
|---|---|
| 1 | Set `scope` to `openid profile email`. |
| 2 | SIGN IN. |
| 3 | Exchange response has no `refresh_token`. Console says "No refresh token." **Put `scope` back afterwards.** |

**TC3 — `invalid_scope` (not allowed + asked)** [PASS]
| Step | Do this |
|---|---|
| 1 | Swap to App B (gotcha 9), keep `scope` with `offline_access`. Run **02 · Build the sign-in URL**. |
| 2 | Open the URL in the browser. Expect `error=invalid_scope` in the address bar (redirected to the Postman callback), no sign-in screen, no `code`. **Swap back to App A.** |

---

## Refreshing

**TC4 — refresh works** [PASS]
| Step | Do this |
|---|---|
| — | SIGN IN. Copy `accessToken`, `idToken`, `refreshToken` into `at1`, `it1`, `rt1`. |
| 1 | **02 · Refresh the access token.** Response has `access_token`, `id_token`, `refresh_token`. |
| 2 | Compare the response values with `at1`, `it1`, `rt1`. All different. |
| 3 | **01 · Userinfo, and capture the token** (it uses `{{accessToken}}`, which is now AT2). `200`, same customer. |

**TC5 — `auth_time`, `nonce`, scopes** [PASS]
| Step | Do this |
|---|---|
| — | SIGN IN. Decode `idToken` at jwt.io and note `auth_time`. |

[EVIDENCE] Original ID token: `auth_time` 1792531187, `nonce` present, `iat` 09:34:44 EST. Personal claims removed.


| 1 | Wait one minute. |
| 2 | **02 · Refresh the access token.** |
| 3–4 | Decode the `id_token` from the refresh **response body**. Same `auth_time`, no `nonce`. |
[EVIDENCE] Refreshed ID token: `auth_time` 1792531187 (unchanged), no `nonce`, `iat` 09:36:20 EST. Personal claims removed.
| 5 | Check `scope` in the refresh response body, or run **01 · Introspect the access token**. |

**TC6 — new token active, old token's state**
| Step | Do this |
|---|---|
| — | SIGN IN. Copy `accessToken` → `at1`. |
[EVIDENCE] AT1 captured (token removed). `exp` 10:34:44 EST.

| 1 | **02 · Refresh the access token.** |
[EVIDENCE] AT2 captured (token removed). `exp` 10:36:20 EST.
| 2 | **01 · Introspect the access token** (bearer and body are both AT2). `active: true`. |
| 3 | Same request, change the body `token` to `{{at1}}`. Record the result. |

[RESULT] both give a 200 and both have active = true

**TC7 — refreshed token expires after 1 hour** [PASS]
| Step | Do this |
|---|---|
| — | Refresh, and note the time. |
| 1 | At ~55 min: **01 · Introspect the access token**. `active: true`. |
| 2 | At ~61 min: introspect again. `active: false`, or `401` (gotcha 6). |
| 3 | **01 · Userinfo, and capture the token.** `401`. |

Setup looks right: the token starts with eyJ and introspect gives active: true. It was issued at 10:07:06 EST and expires at 11:07:06 EST.

11:02: introspect with the body set to {{tc7}}. Expect active: true.
11:09: run 02 · Refresh the access token first, so the bearer is fresh. Then introspect with the body set to {{tc7}} and expect active: false. Then run 01 · Userinfo with the bearer set to {{tc7}} and expect 401.
Until 11:09, don't sign in again as this customer. Refreshing is fine.

Something new in that introspect response: as well as the standard fields, it returns the customer's personal details and account status, including kyc_status: "TIER_1" and lockout_enabled. The standard allows extra fields, but any app with a valid token can see a customer's KYC tier and lockout flag this way. Is that intended? I'll add it to findings as a question for the dev.
---

## Rotation and reuse

**TC8 — old refresh token can't be reused** [PASS]
| Step | Do this |
|---|---|
| — | SIGN IN. Copy `refreshToken` → `rt1`. |
| 1 | **02 · Refresh the access token.** |
| 2 | Duplicate the refresh request (call it "Refresh with old token") and set the body `refresh_token` to `{{rt1}}`. Send it. Rejected. |

**TC9 — current token survives the reuse attempt** [PASS]
| Step | Do this |
|---|---|
| — | SIGN IN. Copy `refreshToken` → `rt1`. |
| 1 | **02 · Refresh the access token** (`refreshToken` is now RT2). |
| 2 | **Refresh with old token** (`{{rt1}}`). Rejected. |
| 3 | **02 · Refresh the access token** (uses RT2). `200`. |
| 4 | **01 · Introspect the access token.** `active: true`. |

**TC10 — chain of refreshes** [PASS]
| Step | Do this |
|---|---|
| — | SIGN IN. |
| 1–3 | **02 · Refresh the access token** three times. Before the second, copy `refreshToken` → `rt2`. |
| 4 | **Refresh with old token** with the body set to `{{rt2}}`. Rejected. |
| 5 | **02 · Refresh the access token.** `200`. |

---

## Sign-out and the GK One session

**TC11 — refresh survives sign-out, access token doesn't** [PASS]
| Step | Do this |
|---|---|
| — | SIGN IN. Copy `accessToken` → `at1`. |
| 1 | **01 · Introspect the access token.** `active: true`. |
| 2 | In the same browser, open `https://app-gkone-identity-001-dev.azurewebsites.net/logout`. |
| 3 | **01 · Introspect the access token.** Expect `active: false`, or `401` because the bearer is AT1 itself (gotcha 6). |
| 4 | **01 · Userinfo, and capture the token.** `401`. |
| 5 | **02 · Refresh the access token.** `200`. |
| 6 | **01 · Introspect the access token** (now AT2). `active: true`. Bonus: change the body to `{{at1}}` and re-send for a clean `active: false` on AT1. |

**TC12 — refreshing doesn't keep the GK One session alive** [PASS]
| Step | Do this |
|---|---|
| — | SIGN IN (App A). |
| 1 | Open `/logout` in the same browser. |
| 2 | **02 · Refresh the access token.** `200`. |
| 3 | Swap to App B and set `scope` to `openid profile email` (gotcha 9). Run **02 · Build the sign-in URL** and open the URL **in the same browser**. You should see the sign-in screen, not a silent redirect. **Swap back.** |

---

## What ends a refresh token

**TC13 — customer removes the app at `/account`** [PASS]
| Step | Do this |
|---|---|
| — | SIGN IN. |
| 1 | **02 · Refresh the access token.** `200`. |
| 2 | In the same browser, open `https://app-gkone-identity-001-dev.azurewebsites.net/account` and revoke the test client. Confirm. |
| 3 | **02 · Refresh the access token.** Rejected. (This wipes `accessToken`, gotcha 4, so copy it → `at2` before this step.) |
| 4 | **01 · Introspect the access token** with the body set to `{{at2}}`. `401` or `active: false` — both mean dead. |

The collection only points at the test client. For the first-party / third-party runs, you need the other app's `clientId` and `clientSecret` swapped in.

**TC14 — app revokes via `/revoke`** [PASS]
| Step | Do this |
|---|---|
| — | SIGN IN. Make the **Revoke token** request (gotcha 8). |
| 1 | **Revoke token** (body `{{refreshToken}}`). `200`. |
| 2 | **02 · Refresh the access token.** Rejected. |

**TC15 — new sign-in replaces the old refresh token**
| Step | Do this |
|---|---|
| — | SIGN IN. Copy `refreshToken` → `rt1`. |
| 1 | Run **02 · Build the sign-in URL**, add `&prompt=login` to the end of the URL, open it in the same browser, sign in, and paste the code into `authCode`. Run **02 · Exchange code for tokens**. `refreshToken` is now the new one. |
| 2 | **Refresh with old token** (`{{rt1}}`). Rejected. |
| 3 | **02 · Refresh the access token.** `200`. |

---

## Client authentication and request validation

**TC16 — wrong or missing secret**
| Step | Do this |
|---|---|
| — | SIGN IN. |
| 1 | Duplicate the refresh request ("Refresh, bad secret"). Set `client_secret` to `wrong`. Send. `invalid_client`. |
| 2 | Untick the `client_secret` row. Send. `invalid_client`. |
| 3 | **02 · Refresh the access token** (the original). `200`. |

**TC17 — App A's token with App B's credentials**
| Step | Do this |
|---|---|
| — | SIGN IN (App A). |
| 1 | In "Refresh, bad secret", set `client_id` and `client_secret` to App B's actual values (type them in; don't swap the variables). Body `refresh_token` = `{{refreshToken}}`. Send. `invalid_grant`. |
| 2 | **02 · Refresh the access token.** Record whether it still works. |

**TC18 — bad or missing refresh token**
| Step | Do this |
|---|---|
| 1 | **Refresh with old token** with the body `refresh_token` set to `made-up-value`. Rejected. |
| 2 | Paste a real refresh token with one character changed. Rejected. |
| 3 | Untick the `refresh_token` row. Expect `invalid_request`. |

**TC19 — unsupported grant types**
| Step | Do this |
|---|---|
| 1 | **03 · Token with an unsupported grant type** as is (`client_credentials`). `unsupported_grant_type`. |
| 2 | Change `grant_type` to `password`. Send. |
| 3 | Change `grant_type` to `made_up_value`. Send. Put it back to `client_credentials` afterwards. |

---

## Exploratory

**TC20 — two devices**
| Step | Do this |
|---|---|
| 1 | SIGN IN in your normal browser. Copy `refreshToken` → `rtd1`. |
| 2 | SIGN IN again, but open the URL in an **incognito / different browser**. `refreshToken` is now RT-D2. |
| 3 | **Refresh with old token** with the body set to `{{rtd1}}`. Record the result. |
| 4 | **02 · Refresh the access token** (RT-D2). `200`. |

**TC21 — `offline_access` turned off afterwards**
| Step | Do this |
|---|---|
| — | SIGN IN. |
| 1 | Admin portal → GK Identity → Applications → test client → turn off `offline_access`. |
| 2 | **02 · Refresh the access token.** Record the result. |
| 3 | Run **02 · Build the sign-in URL** and open it. Expect `error=invalid_scope`. **Turn `offline_access` back on.** |

Careful: this changes the shared dev test client for anyone else using it. Do it quickly, or use App B with `offline_access` temporarily allowed.

**TC22 — introspect a refresh token**
| Step | Do this |
|---|---|
| — | SIGN IN. Refresh once (copy the old one → `rt0` first). |
| 1 | **01 · Introspect the access token** with the body `token` set to `{{refreshToken}}`. Record the result. |
| 2 | Same request, body set to `{{rt0}}`. Record the result. |

**TC23 — `/revoke` edge cases**
| Step | Do this |
|---|---|
| — | SIGN IN. |
| 1 | **Revoke token** with the body `token` set to `{{accessToken}}`. Record the response. |
| 2 | **01 · Introspect the access token.** Record the result (`401` or `active: false` means it worked). |
| 3 | **Revoke token** with `{{refreshToken}}`, then send it again. Record the response. |
| 4 | **Revoke token** with the body set to `made-up-value`. Record the response. |

---

## Lifetimes (TC24–26)

Same requests as above — SIGN IN, then **02 · Refresh the access token** at the right times. Blocked until you know whether the QA lifetimes can be shortened.
