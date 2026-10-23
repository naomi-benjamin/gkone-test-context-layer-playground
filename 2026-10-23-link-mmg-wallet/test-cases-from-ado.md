# Link Wallet (imported from ADO)

**Source:** ADO test plan "Market Expansion" (#26234), suite "MVP 1 / MMG / Link Wallet" (#26285). Imported 2026-10-23. [Open in ADO](https://dev.azure.com/GKDigital/GKOne/_testPlans/define?planId=26234&suiteId=26285)

**Origin:** written in ADO, not generated from the test-context repo. See `notes.md` for cases that didn't convert cleanly.

---

## Test cases

TEST CASE 1
Title: Verify that a user with an existing MMG wallet and completed KYC can initiate the MMG Link Wallet flow

ADO: [#26286](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26286) · Ready · tests #20457

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user has an existing MMG wallet.
• The user has successfully completed the KYC process.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Tap 'Add an account' |  |
| 5. | Select 'MMG' from the list of available external wallets |  |
| 6. | Confirm selection | The user is directed to the MMG Link Wallet flow, where they can proceed with linking their MMG wallet to the GKOne app. |

---

TEST CASE 2
Title: Verify that a user with an existing MMG wallet but without completed KYC cannot initiate the MMG Link Wallet flow

ADO: [#26287](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26287) · Ready · tests #20457

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user has an existing MMG wallet.
• The user has not completed the KYC process.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Tap 'Add an account' | The user should not be able to proceed with flow and should be prompted to start the ondato process |

---

TEST CASE 3
Title: Verify that an appropriate error message is displayed when a user enters incorrect details for their MMG wallet during the linking process

ADO: [#26288](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26288) · Ready · tests #20457

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user has an existing MMG wallet.
• The user has completed the KYC process.
• The user has initiated the process to link the MMG wallet.
• The user’s full name and date of birth on file with GKOne match those associated with the MMG account.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Tap 'Add an account' |  |
| 5. | Select 'MMG' from the list of available external wallets |  |
| 6. | Confirm selection |  |
| 7. | Enter incorrect MMG wallet details (Wrong account number) |  |
| 8. | Submit entered data | User should see an error message letting them know that the number they have entered is not correct |

---

TEST CASE 4
Title: Verify that the absence of linked wallets is correctly represented in the digital tab

ADO: [#26289](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26289) · Ready · tests #20457

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user should have no linked MMG accounts

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab | User should see no wallets listed and the option to add one |

---

TEST CASE 5
Title: Verify that the linked MMG wallet is appropriately displayed on the wallet dashboard

ADO: [#26290](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26290) · Ready · tests #20457

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user has successfully linked their MMG wallet to the GKOne account.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab | Any linked MMG wallets should be appropriately displayed in the Digital tab |

---

TEST CASE 6
Title: Verify that details on their MMG wallet are appropriately visible to the user

ADO: [#26291](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26291) · Ready · tests #20457

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user has successfully linked their MMG wallet to the GKOne account.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Tap any listed MMG wallet | The user should see the last 4 digits of their account number and the type of wallet (digital) |

---

TEST CASE 7
Title: Verify that a user is able to successfully link an MMG wallet

ADO: [#26292](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26292) · Ready · tests #20457

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user has an existing MMG wallet.
• The user has completed the KYC process.
• The full name and date of birth (DOB) on file with GKOne match the name and DOB associated with the MMG account.
• The user has not exceeded the maximum number of MMG wallets that can be linked (e.g., less than 2, if the limit is configured).

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Tap 'Add an account' |  |
| 5. | Select 'MMG' from the list of available external wallets |  |
| 6. | Confim selection |  |
| 7. | Enter the users MMG wallet number |  |
| 8. | Submit |  |
| 9. | Wait for OTP |  |
| 10. | Enter correct OTP |  |
| 11. | Submit | The user should see a success message letting them know that their MMG account has been linked |

---

TEST CASE 8
Title: Verify that a user cannot link an MMG wallet if the full name and date of birth do not match those on file

ADO: [#26293](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26293) · Ready · tests #20457

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user has an existing MMG wallet with a correct account number.
• The user has completed the KYC process.
• The full name and date of birth on file with GKOne do not match those associated with the MMG account.
• The user has not exceeded the maximum number of MMG wallets that can be linked (e.g., less than 2, if the limit is configured).

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Tap 'Add an account' |  |
| 5. | Select 'MMG' from the list of available external wallets |  |
| 6. | Confim selection |  |
| 7. | Enter a correct MMG account number |  |
| 8. | Submit | The system should detect that though the account number is correct the other details do not match and throw the appropriate error message. User should not be able to continue with the provided account number |

---

TEST CASE 9
Title: Verify that a user cannot link an MMG wallet if the full name matches but the DOB does not match

ADO: [#26294](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26294) · Ready · tests #20457

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user has an existing MMG wallet with a correct account number.
• The user has completed the KYC process.
• The full name on file with GKOne matches the MMG account, but the date of birth does not match.
• The user has not exceeded the maximum number of MMG wallets that can be linked (e.g., less than 2, if the limit is configured).

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Tap 'Add an account' |  |
| 5. | Select 'MMG' from the list of available external wallets |  |
| 6. | Confim selection |  |
| 7. | Enter a correct MMG account number |  |
| 8. | Submit | The system detects that the date of birth provided does not match the date of birth on file with the MMG account, even though the full name matches. User should not be able to continue with the provided account number |

---

TEST CASE 10
Title: Verify that a user cannot link an MMG wallet if the DOB matches but the full name does not match

ADO: [#26295](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26295) · Ready · tests #20457

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user has an existing MMG wallet with a correct account number.
• The user has completed the KYC process.
• The full name on file with GKOne matches the MMG account, but the full name does not match.
• The user has not exceeded the maximum number of MMG wallets that can be linked (e.g., less than 2, if the limit is configured).

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Tap 'Add an account' |  |
| 5. | Select 'MMG' from the list of available external wallets |  |
| 6. | Confim selection |  |
| 7. | Enter a correct MMG account number |  |
| 8. | Submit | The system detects that the full name provided does not match the full name on file with the MMG account, even though the DOB matches. User should not be able to continue with the provided account number |

---

TEST CASE 11
Title: Verify that no MMG wallet is displayed on the wallet dashboard after a failed linking attempt

ADO: [#26296](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26296) · Ready · tests #20457

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user has attempted to link an MMG wallet but has received an error message due to a failed attempt.
• The MMG wallet has not been successfully linked.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Attempt to link an MMG wallet with incorrect details or invalid information to trigger a failure |  |
| 5. | Verify that an appropriate error message is displayed indicating the failure of the linking process |  |
| 6. | Navigate to the wallet dashboard |  |
| 7. | Navigate to the "My Wallet" tab |  |
| 8. | Navigate to the "Digital" tab | The user should not see any new MMG wallet displayed on the wallet dashboard. |

---

TEST CASE 12
Title: Verify that users cannot enter letters in the MMG account number field

ADO: [#26297](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26297) · Ready · tests #20457

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user is on the MMG wallet linking screen where the user is being prompted to enter the account number.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Select 'MMG' from the list of available external wallets |  |
| 5. | Confim selection |  |
| 6. | Attempt to enter a MMG account number containing letters (AB12345) | The system should prevent the user form entering letters in the account field |

---

TEST CASE 13
Title: Verify that the MMG account number must be exactly 7 characters long

ADO: [#26298](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26298) · Ready · tests #20457

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user is on the MMG wallet linking screen where the user is being prompted to enter the account number.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Select 'MMG' from the list of available external wallets |  |
| 5. | Confim selection |  |
| 6. | Attempt to enter a MMG account number that is not exactly 7 characters long (@accNum26298) | The user should be prevented from proceeding if the account number is not exactly 7 characters long |

---

TEST CASE 14
Title: Verify that the user must provide a correct OTP before the MMG wallet linking process can be completed

ADO: [#26300](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26300) · Ready

Tags: 

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Tap 'Add an account' |  |
| 5. | Select 'MMG' from the list of available external wallets |  |
| 6. | Confim selection |  |
| 7. | Enter the users MMG wallet number |  |
| 8. | Submit |  |
| 9. | Wait for OTP |  |
| 10. | Enter incorrect OTP | If OTP is incorrect (or not provided) user should not be able to proceed and should get an appropriate error message if necessary. |

---

TEST CASE 15
Title: Verify that the user cannot proceed with the MMG wallet linking process after providing an expired OTP

ADO: [#26301](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26301) · Ready · tests #23680

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user has a valid and active MMG wallet.
• The user has completed the KYC process.
• OTP (One-Time Password) is required to complete the linking process.
• The OTP expires after a specified period (2 minutes).

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Tap 'Add an account' |  |
| 5. | Select 'MMG' from the list of available external wallets |  |
| 6. | Confim selection |  |
| 7. | Enter the users MMG wallet number |  |
| 8. | Submit |  |
| 9. | Wait for OTP |  |
| 10. | Wait past the allowed time limit |  |
| 11. | Enter expired OTP | The system should detect that the OTP has expired and the user should be unable to proceed. User should have option to have OTP resent |

---

TEST CASE 16
Title: Verify that a user has only 3 attempts to enter the correct OTP before being locked out

ADO: [#26303](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26303) · Ready

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user has a valid and active MMG wallet.
• The user has completed the KYC process.
• OTP (One-Time Password) is required to complete the linking process.
• The system is configured to allow a maximum of 3 OTP attempts.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Tap 'Add an account' |  |
| 5. | Select 'MMG' from the list of available external wallets |  |
| 6. | Confim selection |  |
| 7. | Enter the users MMG wallet number |  |
| 8. | Submit |  |
| 9. | Wait for OTP |  |
| 10. | Enter OTP incorrectly for the first attempt & submit | Error message letting them know that the OTP is incorrect and that they have 2 attempts left |
| 11. | Enter OTP incorrectly for the second attempt & submit | Error message letting them know that the OTP is incorrect and that they have 1 attempt left |
| 12. | Enter OTP incorrectly for the third attempt & submit | Error message letting them know that the we cannot validate |

---

TEST CASE 17
Title: Verify that if the user already has an MMG account linked, they cannot link the same account again.

ADO: [#26304](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26304) · Ready · tests #29730

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user has already linked an MMG wallet to their GKOne account.
• The user is on the MMG wallet linking screen.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Tap 'Add an account' |  |
| 5. | Select 'MMG' from the list of available external wallets |  |
| 6. | Confim selection |  |
| 7. | Enter the the MMG account number of an account that is already linked |  |
| 8. | Submit | The system should detect that that MMG account is already linked to this user and prevent the user from completing the linking process. |

---

TEST CASE 18
Title: Verify that a user cannot link an MMG account that is stopped, frozen, locked or suspended

ADO: [#26305](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26305) · Ready

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user has access to MMG wallet details.
• The MMG account in question is stopped, frozen, or suspended due to inactivity, regulatory reasons, or other issues.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Navigate to the "Digital" tab |  |
| 4. | Tap 'Add an account' |  |
| 5. | Select 'MMG' from the list of available external wallets |  |
| 6. | Confim selection |  |
| 7. | Enter account number of the stopped/frozen/suspended MMG account |  |
| 8. | Submit | The user should be prevented from completing the linking process and told that we cannot validate their account |

---

TEST CASE 19
Title: Verify that a user is unable to add a third MMG account

ADO: [#26615](https://dev.azure.com/GKDigital/GKOne/_workitems/edit/26615) · Ready · tests #26624

Tags: 

Pre Conditions:
The following should be true before proceeding:
• The user has an active GKOne account.
• The user has an existing MMG wallet with a correct account number.
• The user has completed the KYC process.
• The user has 2 MMG accounts linked.

Steps:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1. | Login to the GKOne application |  |
| 2. | Navigate to the "My Wallet" tab |  |
| 3. | Tap the external account that is to be deleted |  |
| 4. | Tap "Manage" |  |
| 5. | Tap "Remove account" |  |
| 6. | Tap "Yes, remove account" |  |
| 7. | Wait |  |
| 8. | Tap "Return to wallet" |  |
| 9. | Navigate to the "Digital" tab |  |
| 10. | Tap "Add an account" |  |
| 11. | Select the wallet provider |  |
| 12. | Tap "Continue" |  |
| 13. | Enter wallet account number |  |
| 14. | Tap "verify my account" | User should see an error telling them that their limit has been exceeded |

---
