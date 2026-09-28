# Test Cases — US-31429: P2P Error Handling — Sender or Receiver Blocked in CMS

Generated: 2026-04-29.

---

## Preconditions (apply to all cases unless stated otherwise)

- Test accounts: two GKOne accounts, both KYC Tier 2, both with valid (non-expired) prepaid cards.
- P2P feature enabled in Firebase and Cosmos for the test tenant.
- Ability to set a CMS block on a test account in the test environment — confirm this is available before running.

---

## Section 1 — Receiver blocked in CMS (AC1)

### TC-001: Receiver blocked in CMS — error screen shown at transaction completion [ PASS ]
[PASS]

**Preconditions:** Sender account: unblocked, KYC Tier 2, valid card. Receiver account: blocked/flagged in CMS, KYC Tier 2, valid card.

**Steps:**
1. Log in as the sender and initiate a P2P transaction to the blocked receiver.
2. Proceed through the flow to the point of completing/confirming the transaction.
3. Observe the result.

**Expected:** The flow allows the user to start and proceed through setup. At the transaction completion stage, the error screen is shown:
- Title: "Unable to Process Payment"
- Body: "Unfortunately, this transaction cannot be sent at this time."
- Primary CTA: "Contact Support"
- Secondary CTA: "Back to Home"
No funds are transferred.

---

### TC-002: Receiver blocked in CMS — error message does not expose CMS block reason or which party is blocked
[PASS]

**Preconditions:** Same as TC-001.

**Steps:**
1. Trigger the receiver-blocked error screen (as per TC-001).
2. Read the full error message displayed.

**Expected:** The message does not mention CMS, does not state that the receiver is blocked, and does not expose any internal system detail. The generic "this transaction cannot be sent at this time" message is shown regardless of the block reason.

---

### TC-003: Receiver blocked in CMS — "Contact Support" CTA is functional
[PASS]

**Preconditions:** Same as TC-001. Error screen is displayed.

**Steps:**
1. Tap "Contact Support" on the error screen.

**Expected:** The user is taken to the support contact flow (or support screen). [UNCERTAIN: confirm exact destination of "Contact Support" CTA — in-app support screen, external link, or other.]

---

### TC-004: Receiver blocked in CMS — "Back to Home" returns user to home screen
[PASS]

**Preconditions:** Same as TC-001. Error screen is displayed.

**Steps:**
1. Tap "Back to Home" on the error screen.

**Expected:** The user is navigated back to the GKOne home screen. The failed P2P transaction is not retained in a draft or pending state.

---

### TC-005: Receiver blocked in CMS — no funds debited from sender
[PASS]

**Preconditions:** Note the sender's prepaid card balance before initiating the transaction. Same setup as TC-001.

**Steps:**
1. Complete steps to trigger the receiver-blocked error screen.
2. Check the sender's prepaid card balance after the error.

**Expected:** Sender's balance is unchanged. No funds were debited as a result of the failed transaction attempt.

---

## Section 2 — Sender blocked in CMS (AC2)

### TC-006: Sender blocked in CMS — error screen shown at transaction completion

**Preconditions:** Sender account: blocked/flagged in CMS, KYC Tier 2, valid card. Receiver account: unblocked, KYC Tier 2, valid card.

**Steps:**
1. Log in as the blocked sender and initiate a P2P transaction to the receiver.
2. Proceed through the flow to the point of completing/confirming the transaction.
3. Observe the result.

**Expected:** The flow allows the user to start and proceed through setup. At the transaction completion stage, the same error screen is shown:
- Title: "Unable to Process Payment"
- Body: "Unfortunately, this transaction cannot be sent at this time."
- Primary CTA: "Contact Support"
- Secondary CTA: "Back to Home"
No funds are transferred.

---

### TC-007: Sender blocked in CMS — error message does not expose that the sender is the blocked party

**Preconditions:** Same as TC-006. Error screen is displayed.

**Steps:**
1. Trigger the sender-blocked error screen.
2. Read the full error message displayed.

**Expected:** The message is identical to the receiver-blocked error (TC-002). The user cannot determine from the message whether they or the receiver is the blocked party.

---

### TC-008: Sender blocked in CMS — "Contact Support" CTA is functional

**Preconditions:** Same as TC-006. Error screen is displayed.

**Steps:**
1. Tap "Contact Support."

**Expected:** Same behaviour as TC-003.

---

### TC-009: Sender blocked in CMS — "Back to Home" returns user to home screen

**Preconditions:** Same as TC-006. Error screen is displayed.

**Steps:**
1. Tap "Back to Home."

**Expected:** Same behaviour as TC-004. No draft or pending transaction retained.

---

### TC-010: Sender blocked in CMS — no funds debited

**Preconditions:** Note sender's prepaid card balance before initiating. Same setup as TC-006.

**Steps:**
1. Trigger the sender-blocked error screen.
2. Check the sender's balance after the error.

**Expected:** Sender's balance is unchanged.

---

## Section 3 — Error screen consistency

### TC-011: Sender-blocked and receiver-blocked error screens are identical

**Preconditions:** Two test runs — one with sender blocked (TC-006), one with receiver blocked (TC-001).

**Steps:**
1. Screenshot the error screen from the receiver-blocked scenario.
2. Screenshot the error screen from the sender-blocked scenario.
3. Compare title, body text, CTA labels, and icon.

**Expected:** Both screens are visually and textually identical. There is no difference in the message that would reveal which party is blocked.

---

### TC-012: Error screen is shown at completion stage, not at flow entry

**Preconditions:** Either sender or receiver is blocked in CMS.

**Steps:**
1. Initiate the P2P flow.
2. Observe whether the error appears immediately on entering the flow or only at the transaction completion/confirmation step.

**Expected:** The user can enter and progress through the P2P flow (enter recipient, amount, etc.) before hitting the error. The error appears at the completion stage, not at the point of entering the flow or selecting the recipient. This is by design.

---

### TC-013: Failed transaction does not appear in transaction history

**Preconditions:** Either sender or receiver is blocked. Error screen triggered.

**Steps:**
1. Trigger the CMS block error.
2. Navigate to transaction history for the sender account.

**Expected:** No record of the failed P2P attempt appears in the sender's transaction history (or if it does appear, it is clearly marked as failed/cancelled — not as pending or completed). [UNCERTAIN: confirm expected transaction history behaviour for CMS-blocked failures with dev.]

---

## Context applied

- **Primary:** `p2p/domain-knowledge.md` — CMS block behaviour (late-surfacing, allows start but not completion); eligibility rules; V1 vs V2 error handling difference. This story is V2 only.
- **Primary:** `p2p/integration-points.md` — CMS as source of truth for customer details; V2 uses Payment Widget.
- **Story:** US-31429 acceptance criteria (AC1, AC2) and error screen mockup — error screen content confirmed from mockup (title, body, CTAs).
- **Marked content leaned on:** `[UNCERTAIN]` on "Contact Support" CTA destination (TC-003/008 — flagged inline). `[UNCERTAIN]` on transaction history behaviour for failed CMS-block attempts (TC-013 — flagged inline).