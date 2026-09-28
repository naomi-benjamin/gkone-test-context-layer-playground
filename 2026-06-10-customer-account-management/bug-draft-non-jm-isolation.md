# Bug Report — Non-JM Market Isolation Failure

## TITLE

Duplicate Account Detection Incorrectly Fires for Non-JM Market Accounts Despite Feature Being Scoped to Jamaica Only

## REPRO STEPS

1. Set up a non-JM market account (e.g. GKONumber market) that has completed KYC
2. Create or use another non-JM market account with a matching identifier for that market
3. Complete Ondato KYC on the second non-JM account using the matching identifier
4. Observe the backend status of the second account after KYC completion
5. Log in as the non-JM user and navigate to Home v2
6. Observe whether conflict-related UI elements are displayed
7. Attempt to access the `/merge-request` deep link as a non-JM user
8. Attempt to access the `/not-my-account` deep link as a non-JM user

NB: Screenshots of failed ADO test run attached (TC 15, TC 16).

## EXPECTED BEHAVIOUR

- Duplicate detection does NOT fire for non-JM market accounts — the Ondato webhook processing should be market-gated and only set `kycStatus = TRN_DUPLICATED` for JM accounts
- No "Account conflict detected" tile is displayed on Home v2 for non-JM users
- The conflict reporting flow is not accessible to non-JM users
- Deep links (`/merge-request`, `/not-my-account`) do not trigger the conflict flow for non-JM users
- No conflict record is created on the admin panel for non-JM accounts
- Non-JM accounts remain fully functional and are not suspended

This is explicitly documented as a requirement: the feature is scoped to Jamaica (JM) only, and non-JM flows must not be affected.

## ACTUAL BEHAVIOUR / DESCRIPTION OF DEFECT

- Duplicate detection IS firing for non-JM market accounts — the webhook processing is NOT market-gated
- The Home v2 conflict tile and/or reporting flow IS being surfaced to non-JM users
- Non-JM users are being pulled into a conflict resolution flow designed exclusively for JM's TRN-based detection

Sub-issues:
- The Ondato webhook extension does not check the user's market before setting `TRN_DUPLICATED`
- The frontend does not gate the conflict tile or flow behind a market check
- Note: it is unclear whether the non-JM user's account was also suspended as a result — if so, this escalates the severity further

## SYSTEM INFO

- Environment: QA / Test
- Platform: Mobile (iOS/Android) + Backend
- Feature: Customer Account Management — Milestone 1
- Test accounts: Non-JM market test user (specific market TBC)
- Date observed: 2026-06-15

## SEVERITY: Critical

**JUSTIFICATION:** Classified as Critical — this is a scope leak where a JM-only feature is affecting users in other markets. Non-JM users could be incorrectly flagged as duplicates, have their accounts suspended, and be locked out — with no workaround available. This creates financial impact (users cannot transact), potential regulatory exposure (suspending users in other jurisdictions without market-appropriate process), and reputational risk. The feature boundary was explicitly defined as JM-only and the isolation is not enforced at either the backend or frontend layer.
