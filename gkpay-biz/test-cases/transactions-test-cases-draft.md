# Test Cases — Merchant View Transactions (GK PayBiz Portal, Release 1)

Generated via Test Case Generator skill. Scope: the merchant's read-only transaction list, balance, and transaction detail view only. Filtering, export, and any other portal capability (disputes, subscriptions, reporting, onboarding) are explicitly out of scope and excluded below.

---

## Happy Path

TEST CASE 1
Title: Verify that a merchant can view a list of all incoming transactions on the Transactions page

Tags: GK Pay Biz, Merchant Portal, Web, Smoke *(suggested — confirm these match your tagging convention)*

Pre Conditions:
The following should be true before proceeding:
• The merchant is authenticated into the GK PayBiz portal
• The merchant's account has at least one completed transaction and one pending transaction

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Navigate to the Transactions page             | A list of all incoming transactions for the merchant's account is displayed |
| 2.   | Observe the pending transaction's status      | It is shown as "Pending" |
| 3.   | Observe the completed transaction's status    | It is shown as "Completed" |

Post Conditions:
The following should be true after test completion:
• All transactions shown belong only to the authenticated merchant's account

---

TEST CASE 2
Title: Verify that a newly completed payment appears in the merchant's transaction list after refreshing or reopening the Transactions page

Tags: GK Pay Biz, Merchant Portal, Web *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The merchant is authenticated and viewing the Transactions page
• A customer is able to make a new payment to this merchant via an in-scope channel (e.g. QR Code or Payment Plugin)

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Note the current transaction list             |                                              |
| 2.   | Have a customer complete a new payment to this merchant |                                              |
| 3.   | Refresh or reopen the Transactions page       | The new transaction now appears in the list, without further delay |

Post Conditions:
The following should be true after test completion:
• The transaction list reflects the new payment immediately on refresh/reopen

*Note: [UNCERTAIN] whether the underlying data feed is polling, websocket, or a true real-time push is not confirmed — this case only verifies the user-facing behavior ("no delay on refresh/open"), not the transport mechanism. Confirm with dev if a live/auto-updating-without-refresh expectation needs separate coverage.*

---

## Alternate Valid Paths

TEST CASE 3
Title: Verify that a merchant can open a completed transaction and view its customer payment details

Tags: GK Pay Biz, Merchant Portal, Web *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The merchant is authenticated and has at least one completed transaction in their list

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Select/open a completed transaction           | Transaction detail view opens |
| 2.   | Observe the detail view                       | Customer name, payment method, reference ID, and payment channel are all shown |

Post Conditions:
The following should be true after test completion:
• The detail shown accurately reflects the selected transaction, with no editing controls present (read-only)

*Note: [OPEN QUESTION] should there be anything in the transaction list or detail view that distinguishes a guest checkout transaction (Payment Plugin, no GK One login) from a transaction made by an authenticated GK One user? 37333's AC (Customer name, payment method, reference ID, payment channel) doesn't call out a guest-vs-member distinction either way. Worth confirming with dev/PO whether this is expected to be visible to the merchant (e.g. for support/dispute purposes) before assuming either "no distinction needed" or "missing field" — raised 2026-10-13, relevant to the Payment Plugin's guest-checkout path documented in `plugin-test-cases-draft.md`.*

---

TEST CASE 4
Title: Verify that a merchant can open a pending transaction and see its status without error or failure details [CHECK_THIS]

Tags: GK Pay Biz, Merchant Portal, Web *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The merchant is authenticated and has at least one pending transaction in their list

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Select/open the pending transaction           | Transaction detail view opens, showing status "Pending" |
| 2.   | Observe for any error or failure-reason field | None is shown, since the transaction has neither completed nor failed |

Post Conditions:
The following should be true after test completion:
• The pending transaction's detail view does not misleadingly show failure information

---

TEST CASE 5
Title: Verify that a merchant can view transactions originating from different payment channels in the same list

Tags: GK Pay Biz, Merchant Portal, Web *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The merchant has at least one transaction received via QR Code 1.0 and at least one received via the Payment Plugin

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | View the Transactions list                    | Both transactions are shown together in the same list |
| 2.   | Open each transaction's detail view            | Each shows the correct payment channel (e.g. "QR Code" vs. "Payment Plugin") for that transaction |

Post Conditions:
The following should be true after test completion:
• The payment channel field accurately distinguishes transactions by their originating channel

---

## Negative / Error Cases

TEST CASE 6
Title: Verify that a failed transaction's detail view shows the error or reason for failure

Tags: GK Pay Biz, Merchant Portal, Web *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The merchant has at least one transaction in the "Failed" state

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Select/open the failed transaction            | Transaction detail view opens, showing status "Failed" |
| 2.   | Observe the detail view for failure information | An error message or reason for the failure is displayed |

Post Conditions:
The following should be true after test completion:
• The merchant has enough information to understand why the transaction failed, without needing to contact support

---

TEST CASE 7
Title: Verify that a merchant cannot view another merchant's transactions

Tags: GK Pay Biz, Merchant Portal, Web, Security *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• Two distinct merchant accounts exist (Merchant A and Merchant B), each with their own transactions
• The tester is authenticated as Merchant A

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | View the Transactions list as Merchant A      | Only Merchant A's transactions are shown |
| 2.   | Attempt to access Merchant B's transaction detail directly (e.g. via a guessed or manipulated transaction/reference ID in the URL, if applicable) | Access is denied; Merchant B's transaction data is not returned or displayed |

Post Conditions:
The following should be true after test completion:
• No cross-merchant data leakage occurs under any access path tested

---

TEST CASE 8
Title: Verify that an unauthenticated user cannot access the Transactions page

Tags: GK Pay Biz, Merchant Portal, Web, Security *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The tester does not have an active authenticated session with the GK PayBiz portal

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Attempt to navigate directly to the Transactions page URL | The user is redirected to login/authentication and is not shown any transaction data |

Post Conditions:
The following should be true after test completion:
• No transaction data is exposed to an unauthenticated request

---

## Edge Cases

TEST CASE 9
Title: Verify that the Transactions page displays a clear empty state when the merchant has no transactions yet

Tags: GK Pay Biz, Merchant Portal, Web *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The merchant account has zero transactions (e.g. a newly onboarded merchant)

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Navigate to the Transactions page             | A clear "no transactions yet" empty state is shown, not an error or a blank/broken page |

Post Conditions:
The following should be true after test completion:
• The empty state does not read as a system error

---

TEST CASE 10
Title: Verify that a transaction's status updates from Pending to Completed when viewed again after the underlying payment completes

Tags: GK Pay Biz, Merchant Portal, Web *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• A transaction exists in the "Pending" state and is expected to transition to "Completed" shortly

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Note the transaction's status as "Pending"    |                                              |
| 2.   | Wait for the underlying payment to complete, then refresh or reopen the Transactions page | The transaction's status now shows "Completed" |

Post Conditions:
The following should be true after test completion:
• The status transition is reflected correctly without requiring any merchant action beyond refresh/reopen

---

TEST CASE 11
Title: Verify that filtering and export controls are not present on the Transactions page for Release 1

Tags: GK Pay Biz, Merchant Portal, Web *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The merchant is authenticated and viewing the Transactions page with multiple transactions present

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Review the Transactions page for any filter controls (date, channel, amount) or export/download controls (CSV, PDF) | None are present — this page is read-only list + balance only for Release 1 |

Post Conditions:
The following should be true after test completion:
• Confirms the Release 1 scope boundary — if filtering or export appear, that is a scope regression, not a missing feature to raise as a routine enhancement request

---

## Post-Condition Verification

TEST CASE 12
Title: Verify that the merchant's account balance is visible on or from the Transactions page

Tags: GK Pay Biz, Merchant Portal, Web *(suggested)*

Pre Conditions:
The following should be true before proceeding:
• The merchant is authenticated and has a non-zero account balance

Steps:
| Step | Action                                      | Expected Result                              |
|------|---------------------------------------------|----------------------------------------------|
| 1.   | Navigate to the Transactions page (or the screen/section where balance is shown) | The merchant's current balance is displayed |

Post Conditions:
The following should be true after test completion:
• The displayed balance is accurate relative to completed transactions

*Note: [ASSUMPTION/GAP] the Release 1 scope doc describes this workstream as "transaction list + balance view," but none of the three in-scope stories (32622, 37332, 37333) individually specify balance-view fields or placement. This case is included to cover the scope doc's explicit mention, but the exact UI location/fields for balance are not documented — confirm with design/dev before treating a mismatch as a defect.*

---

## Context applied

- **Primary context:** `playground/gkpay-biz/paybiz_release_1_requirements.md`, §4 "Merchant View Transactions" — all 12 cases trace to the three confirmed in-scope stories (32622, 37332, 37333) and the explicit exclusions (37325 Transaction Filtering, 37331 Transaction Export), both confirmed out of scope for Release 1.
- **Related/secondary context used:** `squads/payments/features/gkpay-biz/integration-points.md` — the [UNCERTAIN] real-time data feed mechanism directly shaped TEST CASE 2's wording (tests the user-facing "no delay on refresh" behavior rather than asserting a specific push/poll mechanism). `squads/payments/features/gkpay-biz/domain-knowledge.md` — payment channel terminology (QR code vs. Plugin) used in TEST CASE 5. `squads/payments/squad.md` — confirms this is a web portal capability, distinct from the GKOne mobile app. `_global/cross-cutting-concerns.md` and `_global/domain-gloassary.md` — general terminology only, no specific case derived directly from them.
- **Deliberately excluded per instruction:** `squads/payments/features/gkpay-biz/edge-cases.md` and `test-patterns.md` — these describe a broader portal vision (filtering, export, disputes, subscriptions) from an earlier objectives document that is NOT the confirmed, narrower Release 1 scope. Using them would have reintroduced out-of-scope functionality (e.g. filter/export test patterns) — TEST CASE 11 exists specifically to guard against that scope creep.
