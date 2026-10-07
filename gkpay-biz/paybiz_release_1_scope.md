# PayBiz Release 1 Scope

**Target Delivery:** October 31, 2026 [UNCERTAIN] — year not stated in source notes, assumed current year since target is in the future.

## Workstream 1: Merchants

- **Scope:** Two merchants onboarded for this release.
  - GKGI
  - Foods
- [UNCERTAIN] "GKGI & Foods" could be one merchant with an ampersand in its name, or two separate merchants. Listed as two here per "Two Merchants" heading — confirm with the PO.

## Workstream 2: Initial Merchant Channel Setup

- **Merchant:** GKGI & Foods
- **Channel Name:** Plug-In 1.0 & QR Code 1.0
- **Plug-in 1.0:** Basic functionality only. **No integration into major e-commerce sites** (e.g. Shopify, WooCommerce) — out of scope for this release.
- **QR Code 1.0:** Scan-to-Pay using Payments V1.
  - **Person-to-Business only.** Person-to-Person is explicitly **not** released in this release. [UNCERTAIN] Confirm against `paybiz_channel_stories.md` — story 37734 ("Individual Payment Instrument," Parent 37284) describes sending funds to someone without a wallet, which may describe a P2P scenario. Worth checking whether that story is out of scope for Release 1 or describes a P2B case (e.g. an unregistered merchant).
  - QR code generation/management will be handled in the merchant portal. [UNCERTAIN] Meeting note was "will catch up the QR code in the portal" — exact meaning/scope of this portal capability needs confirming with the team.

## Workstream 3: Payment Channels & Features

- **Payment Plugin 1.0** for GKGI — referred to in the meeting as **Web Pay**.
  - **Test site use cases:** Donate, Top Up.
  - **Guest payments:** In scope. Guest is presented with a **3DS challenge** and still receives payment notifications.
  - Guest payments apply to the **plugin only** — **not** to Scan-to-Pay (QR Code 1.0).
- [UNCERTAIN] Only the plugin channel is listed under this workstream heading — unclear whether QR Code 1.0's broader payment feature set (amount entry, validation, receipts — see stories under Parent 37284 in `paybiz_channel_stories.md`) is also considered in scope here, or whether it's covered entirely by Workstream 2. The guest-payment note above (plugin only) suggests the two channels have genuinely different feature sets this release, not just different entry points.

## Workstream 4: Settlement Options

- Settlement via **current Bill Express infrastructure**, using **biller codes**.
- No new settlement infrastructure built for this release — reuses existing Bill Express rails.
- *QA planning note from the meeting: settlement was called out as something the team doesn't intend to test this release — confirm this is a deliberate risk acceptance before finalizing the test plan, not just scope shorthand.*

## Workstream 5: Merchant View Transactions

- Merchant can **view** a list of transactions and current balance.
- **Read-only** for this release — no mention of exports, filtering, disputes, or reconciliation actions. Treat anything beyond list + balance as out of scope unless confirmed otherwise.
- **Onboarding is explicitly not included** in this workstream's scope. Merchant portal access for Release 1 is handled manually:
  - The initial 2 companies will be onboarded manually (not self-service).
  - There is a password reset path for merchant accounts.
  - A dummy/test merchant account will be provided for QA, with a URL and a list of valid identifiers to create login accounts.

## Cross-cutting: Payment Notifications

- Payment notifications are in scope and apply across channels — called out specifically for guest payments on the plugin (Workstream 3), but should be verified for QR Code 1.0 / Scan-to-Pay as well per the existing notification stories (37738, 37750) in `paybiz_channel_stories.md`.

---

## Scope summary

### In scope
- Onboarding for 2 merchants (GKGI, Foods — or one combined merchant, see note above), onboarded **manually** by the team, not self-service.
- Plug-In 1.0 / Web Pay (basic functionality, no major e-commerce integration):
  - Test site transaction types: Donate, Top Up.
  - Guest payments, with 3DS challenge and payment notifications.
- QR Code 1.0 (Scan-to-Pay, Payments V1):
  - Person-to-Business only.
  - QR code generation/management surfaced in the merchant portal.
- Payment notifications (confirmed for plugin guest payments; verify for QR Code 1.0 too).
- Merchant-facing transaction list + balance view (read-only).
- Dummy/test merchant account for QA (URL + valid identifiers, login account creation).
- Password reset path for merchant accounts.

### Explicitly out of scope
- Plugin integration into major e-commerce platforms.
- Person-to-Person payments via QR Code 1.0.
- Self-service merchant onboarding (handled manually this release).
- Any settlement path other than existing Bill Express biller codes.
- Any merchant transaction-view actions beyond list + balance (no exports/filters/actions mentioned).

### QA planning notes
- Settlement (Workstream 4) was flagged in the meeting as low priority for testing this release — confirm this is a deliberate call before the test plan is finalized, since it's a risk-acceptance decision, not a scope exclusion.

### Open questions to resolve before test planning
1. Is "GKGI & Foods" one merchant or two?
2. Does story 37734 (`paybiz_channel_stories.md`, Parent 37284 — sending funds to someone without a wallet) describe a P2P case that's now out of scope, or a P2B case that's still valid?
3. What exactly does "QR code caught up in the portal" cover — is QR generation/management a testable Release 1 portal feature?
4. Confirm target delivery year.
5. Is Apple Pay / Google Pay in scope for Release 1? (Flagged "Not MVP" in `paybiz_channel_stories.md`, story 37747 — consistent with this scope doc having no mention of digital wallets, but worth confirming explicitly.)
6. Timeline for provisioning the dummy merchant test account — needed before test execution can start.

---

*Source: pasted release notes, 2026-10-07. This file is scratch/playground content — not authoritative feature documentation. Related: `paybiz_channel_stories.md` (same folder).*
