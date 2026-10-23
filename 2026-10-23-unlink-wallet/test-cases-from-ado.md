# Unlink Wallet (imported from ADO)

**Source:** ADO test plan "Market Expansion" (#26234), suite "MVP 1 / MMG / Unlink Wallet" (#26311). Imported 2026-10-23. [Open in ADO](https://dev.azure.com/GKDigital/GKOne/_testPlans/define?planId=26234&suiteId=26311)

**Origin:** written in ADO, not generated from the test-context repo. See `notes.md` for cases that didn't convert cleanly.

---

## Test cases

TEST CASE 1
Title: Verify that a user has the option to remove their external wallet

ADO: [#26609](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26609) · Ready

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user has an existing MMG wallet.
• The user has successfully completed the KYC process.
• The user has a linked MMG wallet.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Tap the external account that is to be deleted |  |
| 5. | Tap "Manage" | User should see the option to "Remove account" |

---

TEST CASE 2
Title: Verify that a user can select that they want to remove their wallet

ADO: [#26610](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26610) · Ready

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user has an existing MMG wallet.
• The user has successfully completed the KYC process.
• The user has a linked MMG wallet.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne applications |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Tap the external account that is to be deleted |  |
| 5. | Tap "Manage" |  |
| 6. | Tap "Remove account" | User should get a prompt asking them if they are sure that they want to remove the account/wallet |

---

TEST CASE 3
Title: Verify that a user can decide not delete a linked external wallet

ADO: [#26611](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26611) · Ready

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user has an existing MMG wallet.
• The user has successfully completed the KYC process.
• The user has a linked MMG wallet.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Tap the external account that is to be deleted |  |
| 5. | Tap "Manage" |  |
| 6. | Tap "Remove account" |  |
| 7. | Tap "No, never mind" | User should be returned to the digital tab |

---

TEST CASE 4
Title: Verify that a user can confirm that they want to delete a linked external wallet

ADO: [#26612](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26612) · Ready

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user has an existing MMG wallet.
• The user has successfully completed the KYC process.
• The user has a linked MMG wallet.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Tap the external account that is to be deleted |  |
| 5. | Tap "Manage" |  |
| 6. | Tap "Remove account" |  |
| 7. | Tap "Yes, remove account" | User should see some sort of loading screen indicating that some process is taking place |

---

TEST CASE 5
Title: Verify that a user can successfully remove a linked external wallet

ADO: [#26613](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26613) · Ready

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user has an existing MMG wallet.
• The user has successfully completed the KYC process.
• The user has a linked MMG wallet.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Tap the external account that is to be deleted |  |
| 5. | Tap "Manage" |  |
| 6. | Tap "Remove account" |  |
| 7. | Tap "Yes, remove account" |  |
| 8. | Wait | Waiting on process to complete to get confirmation that deletion occurred and give the option to return to the wallet |
| 9. | Tap "Return to wallet" |  |
| 10. | Navigate to the "Digital" tab | User should not see the external wallet that was added in the list of external wallets |

---

TEST CASE 6
Title: Verify that if a user removes an external wallet, they can add another one in its place

ADO: [#26614](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26614) · Ready

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user has an existing MMG wallet.
• The user has successfully completed the KYC process.
• The user has 2 linked MMG wallets.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Tap the external account that is to be deleted |  |
| 5. | Tap "Manage" |  |
| 6. | Tap "Remove account" |  |
| 7. | Tap "Yes, remove account" |  |
| 8. | Wait | Waiting on process to complete to get confirmation that deletion occurred and give the option to return to the wallet |
| 9. | Tap "Return to wallet" |  |
| 10. | Navigate to the "Digital" tab |  |
| 11. | Tap "Add an account" |  |
| 12. | Select the wallet provider |  |
| 13. | Tap "Continue" |  |
| 14. | Enter wallet account number |  |
| 15. | Tap "verify my account" | After waiting, the user should be able to proceed with linking |

---
