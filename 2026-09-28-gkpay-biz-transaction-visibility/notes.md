# Transaction visibility — customer & payment details (story review)

## Story 37333 
As a merchant
I want to see which customer made a payment and relevant payment details
so that I can confirm and reconcile transactions.

## Acceptance criteria (as written)
1. Given I open a transaction entry
   When details expand
   Then I should see customer name, payment method, and reference ID and payment Channels

2. Given I download/export
   When I open the file
   Then customer details should be included in the report.

## Status
2026-09-28 — reviewing for gaps before test design. Open questions in `questions.md`.

## Story 32622
As a merchant
I want to view all incoming transactions in real time 
so that I can monitor cash flow independently.

## Acceptance criteria (as written)
1. Given a customer makes a payment
   When I refresh or open the Transactions page
   Then the transaction should appear instantly.

2. Given a transaction is pending
   When I view the dashboard
   Then its status should show as “Pending” until completed.

## Story 37331
As a merchant
I want to export transaction history reports
so that I can reconcile my records externally.

## Acceptance criteria (as written)
1. Given I click “Export,”
   When I select CSV or PDF
   Then the file should download with all transaction details.

2. Given I export filtered results
   When the file downloads
   Then only the filtered transactions should be included.

## Story 37325
As a merchant
I want to filter transactions by date, payment channel, or amount
so that I can analyze specific sets of payments.

## Acceptance criteria (as written)
1. Given I select a filter (e.g., date range, channel, amount)
   When I apply it
   Then only matching transactions should display.

2. Given I clear filters
   When results reload
   Then all transactions should be visible again.

## Story 37332
As a merchant
I want to see the status of each transaction (pending, completed, failed)
so that I can confirm payment outcomes.

## Acceptance criteria (as written)
1. Given a transaction is processed
   When I view its entry
   Then the status should reflect its current state (Pending, Completed, Failed).

2. Given a failed transaction
   When I click details
   Then I should see error information or reason for failure.