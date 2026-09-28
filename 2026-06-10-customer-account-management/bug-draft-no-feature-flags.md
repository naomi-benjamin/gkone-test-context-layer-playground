# Bug Report — No Feature Flag Gating on Customer Account Management

## TITLE

Customer Account Management Feature is Not Gated Behind Feature Flags on Backend or Frontend — No Kill Switch Available

## REPRO STEPS

1. Observe the current deployment of Customer Account Management (Milestone 1) in the QA environment
2. Check the feature flag configuration for any toggle controlling the duplicate detection flow
3. Confirm whether a feature flag exists to disable:
   - The Ondato webhook extension (duplicate detection trigger on BE)
   - The Home v2 conflict tile (FE)
   - The conflict reporting flow (FE)
   - The email notification dispatch (BE)
4. Attempt to disable the feature without a code deployment

## EXPECTED BEHAVIOUR

The Customer Account Management feature should be gated behind feature flags on both backend and frontend, consistent with how other GKOne features are managed:
- **Entra ID Login** — toggled per tenant/account/global
- **Payment Widget** — enable/disable for transaction flows
- **P2P v2/v3** — switch between versions
- **WU Outbound v2/v3** — switch between versions
- **Top-Up Providers** — enable/disable per market
- **CMS Block** — enable/disable for compliance

Expected flag controls for this feature:
- **BE flag:** Disable duplicate detection trigger (Ondato webhook processing) without code deployment
- **FE flag:** Hide the conflict tile, reporting flow, and related UI without app release
- **Notification flag:** Disable conflict-related emails independently

This is especially critical given:
- The feature is scoped to JM only (needs market-level toggle)
- Multiple defects identified during M1 testing (non-JM isolation failure, repeated emails, template issues)
- Production rollout requires the ability to disable quickly if issues emerge post-release

## ACTUAL BEHAVIOUR / DESCRIPTION OF DEFECT

- No feature flag exists to control or disable the Customer Account Management feature
- The feature cannot be turned off without a code deployment on both BE and FE
- There is no kill switch if critical issues are discovered in production (e.g. the non-JM isolation failure found in testing)
- The integration-points.md for this feature has a `[TODO: confirm flag controls per component]` — indicating this was recognised as needed but never implemented

## SYSTEM INFO

- Environment: All (QA, Staging, Production)
- Platform: Backend + Frontend (Mobile)
- Feature: Customer Account Management — all components
- Date observed: 2026-06-15

## SEVERITY: Major

**JUSTIFICATION:** Classified as Major — the absence of a feature flag means there is no ability to quickly disable this feature in production if a critical defect is discovered post-release. Given that M1 testing has already uncovered a critical scope leak (non-JM isolation failure) and multiple email defects, shipping without a kill switch creates operational risk. If the non-JM isolation issue were to reach production, the only remediation would be a hotfix deployment rather than a flag toggle. This affects the release readiness posture, not a specific user flow — hence Major rather than Critical.

---

## Additional Context

**Why this matters for release:**
- The non-JM market isolation failure (separate bug) means the feature is actively affecting users it shouldn't. A feature flag would allow immediate mitigation.
- The duplicate email sends could overwhelm users. A notification-specific flag would allow disabling emails while leaving the in-app flow active.
- Standard GKOne practice (per cross-cutting-concerns.md) is to flag-gate new features. This feature is an outlier.

**Recommended flag structure:**
| Flag | Scope | Controls |
|------|-------|----------|
| `customer-account-management.detection.enabled` | Per-market | Ondato webhook duplicate detection trigger |
| `customer-account-management.ui.enabled` | Per-market | Home v2 tile + conflict reporting flow |
| `customer-account-management.notifications.enabled` | Global | Email notifications for conflicts |
| `customer-account-management.admin.enabled` | Global | Admin panel /identity-conflicts |

> Note: This is a recommendation. PO/engineering to define actual flag granularity.
