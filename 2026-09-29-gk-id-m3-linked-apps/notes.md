# GK ID M3 — Linked applications self service

Source: milestone contract pasted into session on 2026-09-29 (also present verbatim in `squads/platform/features/gkone-identity/getting-started.md`, M3 section).

## Scope

- Linked applications page (Backend and frontend)
- Revoke access per application (Backend and frontend)

## What is in place

A signed-in customer opens `/account` and sees three panels: a profile summary, the applications they have granted access to, and the devices and browsers holding a live session. Each application row offers a revoke action behind a confirmation. The customer ends one session at a time, or every session except the one they are using.

## Expected outcomes

- `/account` requires a session. A visitor without one does not see another customer's data.
- The linked applications list shows every application the customer has consented to, and nothing they have not.
- Revoking an application asks for confirmation before acting.
- After revoking, the row disappears without a page reload.
- A revoked application's existing access and refresh tokens stop working.
- Try to login again after revoke — it shows the consent screen again.
- The signed-in sessions panel lists the current session and marks it as current.
- Ending a single session invalidates that session alone, and the current browser stays signed in.
- "Sign out everywhere else" clears every other session and leaves the current one working.
- No action in the sessions panel signs the customer out of the browser they are using.
