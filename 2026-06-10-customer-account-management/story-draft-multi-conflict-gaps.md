# ADO Story Draft — Multi-Account & Post-Resolution Conflict Gaps

## Story 1: Define behaviour for 3+ accounts sharing the same TRN

---

**Title:** Define and implement conflict handling when more than two accounts share the same TRN

**Type:** User Story

**Description:**

Currently, duplicate account detection handles a 1:1 conflict — one Target (new) account matches one Existing account. However, the system does not have defined behaviour for scenarios where **3 or more accounts share the same TRN**.

During M1 testing (2026-06-15), this gap was identified and confirmed with management as needing resolution.

**What we know today:**
- Per domain-knowledge: "If multiple accounts share the same TRN, all conflicting accounts appear in a list together on the admin panel — not handled as separate pair-wise conflicts."
- No defined customer-facing flow for this scenario
- No defined admin resolution workflow (how does the maker pick a winner from 3+? Is it sequential merges or a single multi-way resolution?)

**Gaps to address:**

1. **Customer flow (Target):** If a new user's TRN matches 2+ existing accounts, what does the customer see? Which existing account's masked details are shown on the "Is this your account?" screen? All of them? The most recent?
2. **Customer flow (Existing):** If there are already 2 accounts with the same TRN, and a 3rd triggers detection — do both existing accounts get notified and suspended? Or just the one most recently active?
3. **Admin resolution:** Can the maker merge multiple accounts in a single operation, or must they resolve conflicts one pair at a time? What's the workflow?
4. **Saga impact:** The current merge saga is designed for 2 accounts (winner + loser). Does it support N-way merges, or does it need to be called sequentially?
5. **Edge case:** What if a merge resolves accounts A+B into A, but account C still shares the TRN? Does a new conflict auto-appear for A vs C?

**Acceptance Criteria:**
- [ ] Defined customer-facing behaviour when 3+ accounts share a TRN
- [ ] Defined admin panel behaviour for multi-account conflicts
- [ ] Defined resolution workflow (sequential pair-wise vs multi-way)
- [ ] Edge cases documented (partial resolution, remaining conflicts)
- [ ] Test cases written to cover the defined behaviour

**Priority:** High — this is a realistic production scenario (e.g. a user creates multiple accounts over time with the same TRN) and has no current handling beyond an admin list view.

---

## Story 2: Define behaviour when a new conflict arises after a previous resolution

---

**Title:** Define and implement conflict handling when a new TRN duplicate is detected after a previous conflict was resolved

**Type:** User Story

**Description:**

Currently, the conflict lifecycle ends at "Finished" (after merge completion or rejection). However, there is no defined behaviour for what happens if a **new conflict is detected on the same TRN after a previous resolution**.

During M1 testing (2026-06-15), this gap was identified and confirmed with management as needing resolution.

**Scenarios to address:**

1. **Post-merge new conflict:** Accounts A and B shared a TRN. Admin merged them (B → A). Later, Account C completes KYC with the same TRN. What happens?
   - Does a new conflict record appear on the admin panel linking A and C?
   - Does Account A (the previous merge winner) get suspended again?
   - Does Account A's user see the conflict tile again on Home v2?

2. **Post-rejection new conflict:** Account A was rejected (conflict dismissed). Account A's `TRN_DUPLICATED` status was cleared (reset KYC or other admin action). Later, Account D triggers detection on the same TRN. What happens?
   - Is there any memory of the previous conflict?
   - Can the system differentiate between "same conflict re-appearing" vs "genuinely new conflict"?

3. **Post-archive new conflict:** Account B was archived during resolution. Account C later triggers detection on the same TRN as Account A. Does the archived Account B factor in at all, or is it excluded from future detection?

**Gaps to address:**

1. **Conflict deduplication:** Should the system prevent a new conflict from being created if a "Finished" conflict already exists for the same TRN pair? Or is each detection treated independently?
2. **User experience:** If a user went through the conflict flow once (and their account was the winner), do they go through the full flow again for a new match? Is there a streamlined path for repeat conflicts?
3. **Admin context:** When the admin sees the new conflict, do they have visibility into the previous resolution? (e.g. "This TRN was previously involved in conflict #1234, resolved on 2026-06-10")
4. **State transitions:** What happens to `kycStatus` on the surviving account when a new match is found? Does it go back to `TRN_DUPLICATED`? Or is there a different state for "previously resolved, new match found"?

**Acceptance Criteria:**
- [ ] Defined behaviour for each post-resolution scenario (post-merge, post-rejection, post-archive)
- [ ] Conflict deduplication rules defined (or explicitly decided not to deduplicate)
- [ ] Customer-facing experience defined for repeat conflicts
- [ ] Admin panel shows historical context for repeated TRN conflicts
- [ ] Test cases written to cover the defined behaviour

**Priority:** Medium — less likely than the 3+ accounts scenario in early release, but will inevitably occur as the user base grows and conflicts are resolved over time.

---

## Notes

- Both gaps were identified during M1 first-round testing (2026-06-15) and confirmed with management as needing stories
- These are design/requirements gaps, not implementation defects — the current system was not designed to handle these scenarios
- Recommend addressing Story 1 before GA (realistic production scenario); Story 2 can be post-GA if needed
