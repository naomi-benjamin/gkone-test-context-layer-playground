# Changelog

## v1.0 - 2026-09-24

Initial release of the GKOne UAT test data package for the external transaction-inquiry integration.

- 12 customer profiles (`data/customers.json`), 77 transaction records (`data/transactions.json`).
- 5 MTCNs documented (`data/mtcns.csv`): 2 confirmed already-paid, 1 confirmed receiver-name-mismatch (real observed failure), 1 uncertain valid/unpaid, 1 uncertain not-found/mismatch, plus 2 synthetic values for invalid-format and not-found negative cases.
- 45 test scenarios (`scenarios/test-scenarios.csv`) across all 5 in-scope endpoints, including required negative cases (non-existent IDs, cross-user access control, malformed bodies, invalid/unknown MTCN, missing auth, PATCH 501).
- Postman collection and placeholder environment template (`api/`).
