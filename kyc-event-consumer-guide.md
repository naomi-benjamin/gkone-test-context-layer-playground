# KYC event consumer guide — task 36197 (WALLET-04)

Work item **36197** — UserProfileUpdated consumer (KYC completion). Parent feature **35690**.

## Purpose

When a customer completes KYC verification, the identity service publishes a <code>UserProfileUpdated</code> event with a full profile snapshot. The wallet consumes this event to refresh fields that incremental <code>UserProfileChanged</code> events may not cover — especially <code>gender</code>, <code>kycStatus</code>, and <code>kycTier</code>.

## How it works

<table>
  <thead>
    <tr><th>Step</th><th>Action</th></tr>
  </thead>
  <tbody>
    <tr><td>1</td><td>Customer completes KYC in identity service</td></tr>
    <tr><td>2</td><td>IAM publishes <code>UserProfileUpdated</code> to profile Service Bus topic</td></tr>
    <tr><td>3</td><td>Wallet <code>ProfileIamTopicSubscriberService</code> routes message to <code>ApplyUserProfileUpdatedCommandHandler</code></td></tr>
    <tr><td>4</td><td>Handler maps full <code>GkOneUser</code> snapshot to <code>WalletUserProfile</code> (sensitive fields excluded)</td></tr>
    <tr><td>5</td><td>Cosmos <code>UserProfile</code> document upserted; Redis cache invalidated</td></tr>
  </tbody>
</table>

## Coexistence with UserProfileChanged

Both event types share the same Service Bus subscription and idempotency strategy.

<table>
  <thead>
    <tr><th>Event</th><th>When</th><th>Authority</th></tr>
  </thead>
  <tbody>
    <tr><td><code>UserProfileChanged</code></td><td>Incremental updates (email, phone, address, admin patch, KYC reset)</td><td>Incremental patch; stale guard on <code>occurredAtUtc</code></td></tr>
    <tr><td><code>UserProfileUpdated</code></td><td>KYC completion</td><td>Superset refresh — authoritative for <code>gender</code>, <code>kycStatus</code>, <code>kycTier</code></td></tr>
  </tbody>
</table>

Rules:

- Idempotency via <code>lastEventId</code> on the profile document.
- After KYC completion refresh, a later older <code>UserProfileChanged</code> is skipped as stale.
- A newer <code>UserProfileChanged</code> still applies incremental patches.

## Fields refreshed on KYC completion

<table>
  <thead>
    <tr><th>Field</th><th>Why wallet needs it</th></tr>
  </thead>
  <tbody>
    <tr><td><code>gender</code></td><td>Required for prepaid card / open-loop GPC registration</td></tr>
    <tr><td><code>kycStatus</code></td><td>Profile sync metadata; future eligibility rules</td></tr>
    <tr><td><code>kycTier</code></td><td>Profile sync metadata</td></tr>
    <tr><td>Full snapshot fields</td><td>Name, contact, address subset, identification — superset refresh</td></tr>
  </tbody>
</table>

## Verification

1. Complete KYC for a test user with an existing wallet.
2. Confirm <code>UserProfileUpdated</code> consumed in wallet logs.
3. Verify Cosmos <code>UserProfile</code> document: <code>gender</code>, <code>kycStatus</code> updated; <code>lastChangeSource</code> reflects KYC completion.

See [../36192/wallet-verification-test-guide.md](../36192/wallet-verification-test-guide.md) test #6.

## Infrastructure

Uses same Service Bus subscription and feature flag as WALLET-03 — see [../36198/subscription-setup-checklist.md](../36198/subscription-setup-checklist.md).
