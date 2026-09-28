# eKYC — CMS Retry (Non-JM Markets)

Generated: 2026-05-12. Skill: Test Case Generator not available; generated directly in ADO format.

**Scope:** CMS retry behaviour introduced to allow users who pass Ondato but fail the CMS check (KYC Status 8) to retrigger the CMS step only — without restarting the Ondato flow.

**Markets in scope:** KY, VG, GY, TT. JM is excluded — CMS check is not part of the JM flow.

---

## UI flow reference (from design, 2026-05-12)

1. User passes Ondato but fails CMS check → Home screen shows banner: **"We couldn't confirm your identity."** with a **"Visit Retail Location"** CTA.
2. Tapping the CTA opens the **Documents Required** screen, listing the documents the customer must submit (ID, banking details, proof of account, proof of address). The screen also shows:
   - **"Find a retail location"** button
   - **"Retry ID Verification"** link/button
3. Tapping **"Retry ID Verification"** opens an **"Action Needed"** confirmation modal: *"Before continuing, please confirm that you've submitted the required documents at a retail location."* (wording is tenant-configured — may say CSC vs retail location depending on market requirements.)
   - **"No, go back"** — dismisses the modal, returns to Documents Required screen
   - **"Yes, I have"** — confirms and re-triggers the CMS check only (Ondato is not re-run)

---

## Preconditions (apply to all cases unless stated otherwise)

- Non-JM market account (KY, VG, GY, or TT) — fresh, not yet KYC-verified
- Test identity available in Ondato sandbox that will pass identity verification
- CMS test environment supports simulating failure scenarios (user not found, blocked, name mismatch, DOB mismatch, GKONumber conflict) [VERIFY: confirm with platform team]
- Ability to verify KYC status in the test environment (back-office tool or DB query) [VERIFY: confirm tooling with platform team]
- Retry limit: unknown — [VERIFY: confirm with dev whether there is a cap on retries]

---

## Section 1 — Happy path retry

### CMS-RTY-01
**Verify that a user who fails the CMS check can retrigger the CMS step and advance to KYC Status 1 after their CMS record is corrected**

Preconditions:
- Standard preconditions
- CMS configured: user initially fails (e.g. name mismatch), then record corrected to pass before step 6

Steps:
1. Launch the eKYC flow and complete Ondato with a passing test identity
2. Confirm the CMS check triggers automatically — no user action required
3. Confirm the CMS check fails; user is set to KYC Status 8
4. Confirm the Home screen displays the **"We couldn't confirm your identity."** banner with the **"Visit Retail Location"** CTA
5. Tap the CTA — confirm the **Documents Required** screen opens with the document list and both the **"Find a retail location"** and **"Retry ID Verification"** options visible
6. In the CMS test environment, correct the user's record so it will now pass
7. Tap **"Retry ID Verification"**
8. Confirm the **"Action Needed"** modal appears with the correct tenant-configured wording and the **"No, go back"** / **"Yes, I have"** options
9. Tap **"Yes, I have"**
10. Confirm the CMS check is re-triggered — Ondato is NOT re-run
11. Confirm the CMS check passes; user is set to KYC Status 1
12. Confirm the user proceeds into the remainder of the eKYC flow

**Expected:** CMS check passes on retry; KYC Status 8 → 1; user continues into eKYC completion screen. Ondato is not re-launched at any point during the retry.

---

### CMS-RTY-02
**Verify that tapping "No, go back" on the Action Needed modal dismisses the modal without retriggering the CMS check**

Preconditions:
- Standard preconditions
- User is at KYC Status 8; on the Documents Required screen

Steps:
1. Tap **"Retry ID Verification"**
2. Confirm the **"Action Needed"** modal appears
3. Tap **"No, go back"**
4. Confirm the modal is dismissed and the user is returned to the Documents Required screen
5. Confirm KYC Status remains 8 and no CMS check was triggered

**Expected:** Modal dismissed; user back on Documents Required screen; KYC Status unchanged; no CMS call made.

---

## Section 2 — Retry failure

### CMS-RTY-03
**Verify that a CMS retry that fails again leaves the user at KYC Status 8 with the retry option still available**

Preconditions:
- Standard preconditions
- User is at KYC Status 8; CMS record has NOT been corrected (will still fail on retry)

Steps:
1. Navigate to the Documents Required screen via the Home screen banner
2. Tap **"Retry ID Verification"** → confirm modal appears → tap **"Yes, I have"**
3. Confirm the CMS check runs and fails again
4. Confirm the user remains at KYC Status 8
5. Confirm the Home screen banner is still shown
6. Confirm the Documents Required screen is still accessible and **"Retry ID Verification"** is still available

**Expected:** KYC Status remains 8; retry option is not removed; user is not locked out from retrying again after a further CSC/retail correction.

---

## Section 3 — Ondato isolation

### CMS-RTY-04
**Verify that the CMS retry does not re-trigger the Ondato identity verification flow**

Preconditions:
- Standard preconditions
- User is at KYC Status 8
- CMS configured to pass on retry
- Ability to observe whether Ondato SDK is launched (network log, Ondato sandbox event log, or webhook log)

Steps:
1. Navigate to Documents Required screen → tap **"Retry ID Verification"** → tap **"Yes, I have"**
2. Monitor for any Ondato SDK session being opened or any Ondato webhook activity during the retry
3. Allow the CMS check to complete

**Expected:** No Ondato SDK session is opened; no new Ondato webhook is received; only the CMS lookup executes. KYC Status advances to 1 without Ondato being involved.

---

## Section 4 — CMS failure scenarios

### CMS-RTY-05
**Verify that a CMS check where the user cannot be located in CMS results in KYC Status 8 and the retry path is shown**

Preconditions:
- Standard preconditions
- CMS configured: no matching record exists for the document ID + ISO 2 code combination

Steps:
1. Complete Ondato with a passing test identity
2. Confirm the CMS check triggers automatically and fails (user not found)
3. Confirm the user is set to KYC Status 8
4. Confirm the Home screen banner **"We couldn't confirm your identity."** is displayed
5. Confirm the Documents Required screen is accessible with **"Retry ID Verification"** present

**Expected:** KYC Status 8; flow stops; Documents Required screen accessible; retry option available.

---

### CMS-RTY-06
**Verify that a CMS check where the user is blocked in CMS results in KYC Status 8 and the retry path is shown**

Preconditions:
- Standard preconditions
- CMS configured: matching record exists but is flagged as blocked

Steps:
1. Complete Ondato with a passing test identity
2. Confirm the CMS check triggers automatically and fails (user blocked)
3. Confirm the user is set to KYC Status 8
4. Confirm the Documents Required screen is accessible with **"Retry ID Verification"** present

**Expected:** KYC Status 8; retry option available. User is not permanently locked out via the app — CSC/retail is the resolution path.

---

### CMS-RTY-07
**Verify that a CMS check where the name from Ondato does not match the CMS record results in KYC Status 8 and the retry path is shown**

Preconditions:
- Standard preconditions
- CMS configured: matching record exists but name differs from the Ondato-returned name

Steps:
1. Complete Ondato with a passing test identity (note the name returned)
2. Confirm CMS check triggers automatically and fails (name mismatch)
3. Confirm the user is set to KYC Status 8
4. Confirm the Documents Required screen is accessible with **"Retry ID Verification"** present

**Expected:** KYC Status 8; retry option available.

---

### CMS-RTY-08
**Verify that a CMS check where the DOB from Ondato does not match the CMS record results in KYC Status 8 and the retry path is shown**

Preconditions:
- Standard preconditions
- CMS configured: matching record exists but DOB differs from the Ondato-returned DOB

Steps:
1. Complete Ondato with a passing test identity (note the DOB returned)
2. Confirm CMS check triggers automatically and fails (DOB mismatch)
3. Confirm the user is set to KYC Status 8
4. Confirm the Documents Required screen is accessible with **"Retry ID Verification"** present

**Expected:** KYC Status 8; retry option available.

---

## Section 5 — KYC Status 5 (GKONumber conflict)

### CMS-RTY-09
**Verify that a user set to KYC Status 5 (REJECTED) due to a GKONumber conflict is not offered the CMS retry option**

Preconditions:
- Standard preconditions
- CMS configured: matched CMS user's GKONumber already belongs to a different user in the GKOne DB

Steps:
1. Complete Ondato with a passing test identity
2. Confirm CMS check triggers automatically
3. Confirm the GKONumber conflict is detected; the new user (the one currently completing KYC) is set to KYC Status 5 (REJECTED)
4. Check whether the Home screen or any subsequent screen offers a **"Retry ID Verification"** option

**Expected:** KYC Status 5 (REJECTED); no retry option is presented; no path forward is available in-app. Full stop — no self-recovery.

---

## Section 6 — Tenant-specific confirmation wording

### CMS-RTY-10
**Verify that the Action Needed modal wording reflects the correct resolution path for the tenant (retail location vs CSC)**

Preconditions:
- Two test accounts in markets with different configured resolution paths [VERIFY: confirm which markets map to which wording]

Steps:
1. Trigger a CMS failure on the retail-location market account
2. Navigate to Documents Required → tap **"Retry ID Verification"**; note the Action Needed modal wording
3. Repeat on the CSC market account; note the modal wording
4. Compare the two messages

**Expected:** Modal wording differs between markets per tenant configuration. Neither market shows the other's wording. Both modals still show **"No, go back"** and **"Yes, I have"** regardless of wording variant.

---

## Section 7 — JM market exclusion

### CMS-RTY-11
**Verify that a JM market user who completes Ondato is not subjected to a CMS check and sees no CMS failure states**

Preconditions:
- JM market account, not yet KYC-verified
- Test identity that passes Ondato

Steps:
1. Complete the Ondato identity verification step on the JM account
2. Confirm the flow does not pause for a CMS check
3. Confirm no **"We couldn't confirm your identity."** banner appears
4. Confirm the user proceeds directly to the eKYC completion screen

**Expected:** No CMS check triggered; no KYC Status 8 set; no Documents Required screen or retry option shown. User moves straight from Ondato to eKYC completion.

---

## Section 8 — Market sweep

### CMS-RTY-12
**Verify that the CMS retry behaviour is consistent across all non-JM markets (KY, VG, GY, TT)**

Preconditions:
- One account per market: KY, VG, GY, TT — each at KYC Status 8
- Each CMS record corrected to pass before running

Steps:
1. For each market, from the Home screen banner → Documents Required → tap **"Retry ID Verification"** → confirm modal → tap **"Yes, I have"**
2. Confirm the CMS check runs in each market
3. Confirm each account advances to KYC Status 1
4. Confirm the eKYC flow continues for each market after the successful retry

**Expected:** Behaviour is identical across KY, VG, GY, TT. No market-specific variation in the retry path or outcome.

---

## Context applied

- `squads/platform/features/ekyc/domain-knowledge.md` — CMS check section (trigger, lookup, checks, outcomes, original and updated failure recovery)
- `squads/platform/features/ekyc/test-patterns.md` — standard preconditions, KYC status verification points, negative test angles
- `squads/platform/features/ekyc/edge-cases.md` — reviewed; no existing CMS-specific entries
- `squads/platform/features/ekyc/known-issues.md` — reviewed; no open issues relevant to CMS check
- `squads/platform/features/ekyc/integration-points.md` — reviewed; CMS not yet documented as an upstream dependency (see graduation note below)
- Design screenshots shared in session (2026-05-12) — Home screen banner → Documents Required screen → Action Needed modal → "Retry ID Verification" trigger

---

## Graduation candidates

2. **UI failure and retry flow** — the Home screen banner → Documents Required screen → Action Needed modal → retry flow is a durable test pattern for future CMS-related stories. Propose adding a "CMS check failure and retry" recipe to `squads/platform/features/ekyc/test-patterns.md`. Approve?