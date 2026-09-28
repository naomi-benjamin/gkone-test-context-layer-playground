# GK PayBiz — Customer Subscription Scoping

Session notes: 2026-04-24. Source: verbal walkthrough from user.

---

## Core insight

Capability 9 (Manage customer subscriptions) only makes sense for merchants using the **payment plugin** (SDK/website integration). It is not relevant for QR code or payment link channels, which handle one-off transaction requests with no persistent integration.

The payment plugin is the only channel where the merchant's system is continuously integrated with GK PayBiz — meaning it's the only channel where GK PayBiz can receive signals about subscription lifecycle events (customer cancels on merchant's site, payment fails, plan change requested).

---

## Manual vs automated status updates

Whether subscription status changes are automated or merchant-manual depends on how deeply the merchant has integrated their own system with GK PayBiz via the SDK.

- **Deeply integrated merchant:** customer-facing subscription events (cancel, upgrade, downgrade) can be passed through to GK PayBiz via the plugin; status updates may be automated.
- **Lightly integrated merchant:** merchant manages subscription status manually in the portal (e.g. customer calls to cancel → merchant logs in and updates status to Cancelled).

The degree of integration is merchant-driven, not GK PayBiz-driven.

---

## Tier dependency

Relevant tiers for subscription management: likely Tier 2 and Tier 3 merchants with online presence and payment plugin integration. Tier 1 merchants (utilities, government) have bespoke billing arrangements outside this scope. Tier 4 (POS, in-person) is not relevant for recurring subscriptions.

---

## Testing scope implication

Customer subscription management (capability 9) should only be tested against merchants using the payment plugin channel. Test environment needs a merchant account with active plugin integration to exercise this capability meaningfully.

---

## Open questions

- Which tiers are actually expected to use the subscription management capability? Confirm with PO.
- Is there a minimum integration requirement (e.g. webhook endpoints the merchant must implement) for automated subscription status updates to work?
- What happens to active customer subscriptions if the merchant switches payment channel or loses their plugin credentials?
- If recurring payment fails, does GK PayBiz automatically update subscription status (e.g. to Paused) or does the merchant need to manually act?