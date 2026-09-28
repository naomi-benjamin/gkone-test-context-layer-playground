TITLE
Identity Conflict Detail Page Displays Identical Recent Login Data for Both Conflicted and Existing Users

REPRO STEPS
1. Log in to the admin portal with the appropriate admin permissions
2. Navigate to User Management → Identity Conflicts
3. Open any conflict from any tab (New, Waiting for Approval, or Finished)
4. On the Identity Conflict Detail page, select the "Recent Logins" tab for the Conflicted User panel (left)
5. Note the Request ID, IP Address, Date and Time, Status, and Location shown
6. Select the "Recent Logins" tab for the Existing User panel (right)
7. Compare the data shown to the Conflicted User's recent login data

NB: Screenshot available showing both panels with identical Request ID (3xrq-4f35h-jkxwk-1048q), IP (66.555.4.333), timestamp (18/09/2024 6:55:00 AM), and location (Kingston, Jamaica) for both users. Conflict: TRN 1905728787, Shari-Gaye Soares vs. Shari-Ann Soares.

EXPECTED BEHAVIOUR
The Recent Logins tab on each user panel should display login history specific to that individual account:
• Conflicted User panel → login history belonging to the Conflicted User only
• Existing User panel → login history belonging to the Existing User only
The two accounts are separate identities and their login histories should differ.

ACTUAL BEHAVIOUR / DESCRIPTION OF DEFECT
• Both the Conflicted User panel and the Existing User panel display identical Recent Login data — the same Request ID, IP address, timestamp, status, and location appear in both panels
• The data appears to be duplicated from one account and rendered for both, rather than fetching each account's own login history independently
• It is unclear which user's actual data (if either) is being correctly displayed

Note: This may indicate the Recent Logins query is using the wrong identifier for one of the panels (e.g. fetching by TRN rather than by account ID, returning data that matches both), or that the same API response is being rendered into both panels without re-fetching.

SYSTEM INFO
N/A — please fill in before raising: environment (staging/prod), browser, admin portal build version. Screenshot attached (30/06/2026 session, TRN 1905728787).

SEVERITY: Major
JUSTIFICATION: Classified as Major — the Recent Logins panel is a key data point for admin decision-making on identity conflicts (assessing which account is the legitimate one, detecting suspicious login patterns, identifying geographic anomalies). If the displayed data is duplicated or assigned to the wrong account, admins may make conflict resolution decisions based on incorrect login history, with potential compliance and fraud-detection implications.
