# GK ID M6 — Email and Phone Number Update

Source: milestone contract in `squads/platform/features/gkone-identity/getting-started.md`, M6 section. Not started yet — folder created 2026-10-20 to hold questions carried over from M5.

## Scope

- Change of email address with verification
- Change of phone number with written confirmation

## What is in place

GK One Mobile carries both journeys, each with the same three steps: enter the new value, enter the code sent to it, done. The identity API backs them with `email-change/request`, `email-change/verify`, `phone-change/request` and `phone-change/verify`.

Four templates ship with the identity API: the change-email code, the change-phone code, and a notification to the customer after each change completes.

Changing the email address ends the session. The customer sees a notice saying they must sign in again and that biometric sign-in is now off, and the app signs them out. This is deliberate: the email address is the sign-in identifier, and the credentials held on the device no longer match it.

## Expected outcomes

- Requesting an email change sends a code to the new address, not the current one.
- Verifying the code applies the change, and the customer can sign in with the new address afterwards.
- A notification reaches the customer after the change completes.
- After a successful email change the app shows the sign-in-required notice and signs the customer out. Biometric sign-in is off until they set it up again.
- An email address already registered to another customer is refused.
- The phone change journey follows the same three steps and sends its code to the email of the user.
- A notification reaches the customer after the phone change completes.

## Open questions / gaps

- **Carried over from M5:** does an email or phone change kill refresh tokens already issued to apps? M5 established that refresh tokens survive sign-out by design (see `playground/2026-10-14-gk-id-m5-session-token-refresh/notes.md`). An email change ends the session and signs the customer out — so by the M5 rule, apps' refresh tokens would keep working unless the email change revokes them explicitly. Ask the dev which applies, for email and phone separately.
