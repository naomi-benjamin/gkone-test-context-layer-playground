# GKOne UAT Test Data - gkone-customer-support API

`uat-pull-2026-09-24 · test-data-summary.md`

> This is the test data reference for the third-party team building an integration that answers user inquiries about GKOne users and transactions. Each customer below lists what you can look them up by, what their transaction history contains, and - where relevant - what an MTCN validation call against their transfers should return.
>
> Everything here comes from a single pull of GKOne's UAT environment. It's synthetic or masked test data - none of it represents a real customer or real financial activity - but it behaves like the real thing, including a couple of genuinely-observed failure cases (see the [MTCN validation reference](#mtcn-validation-reference)) rather than invented ones. UAT is refreshed periodically, so treat the specific IDs and MTCNs below as valid for this pull rather than permanent.

## Tags

**SYNTHETIC** a fabricated value, not tied to any real transaction or user

---

## Endpoints in Scope

```
POST    /api/v1/customers/filter
POST    /api/v1/users/{userId}/transactions/filter
GET     /api/v1/users/{userId}/transactions/{transactionId}
POST    /api/v1/remittances/{mtcn}/validation
PATCH   /api/v1/remittances/{mtcn}/receiver/name
```

> **Important:** a valid, well-formed request to the PATCH endpoint above currently returns `501 Not Implemented`. This is expected, documented behavior - please don't log it as a defect.

---

## How to read this

- **LOOKUP TYPES** - `/customers/filter` and `/remittances/{mtcn}/validation` both take one identifier per request: `GKO_NUMBER`, `TRN`, `ID_DOCUMENT`, or `EMAIL`. Each customer below lists which of these it actually has a value for, and what that value is. Don't try a lookup type marked "not available" - it'll just return empty. More details are included in the accompanying documentation.
- **STATUSES / PRODUCT TYPES** - `/users/{userId}/Transactions/Filter` lets you filter by `statuses` and `productTypes`. Each customer below lists the exact values their own transaction history contains, so you can build a filter test that's guaranteed to return something (or, by using a value they *don't* have, guaranteed to return nothing).
- **MTCNS** - where a customer's transactions include a settled Western Union transfer, its MTCN is listed. See the [MTCN validation reference](#mtcn-validation-reference) at the end for expected outcomes.

---

## Customers

### Dane Tester
- `userId`: `34e7bc04-3828-4093-a2e2-d5ad8d1626ee`
- **LOOKUP TYPES** `EMAIL` = `naomi.qatesting+dane@gmail.com` · `GKO_NUMBER` = `DT2024102387A607CFCCEA124609` · `ID_DOCUMENT` = `ID_CARD` / `123456703` · `TRN` - not available (blank in this data)
- **ID TYPE ON FILE** `ID_CARD`
- **CUSTOMER TERRITORY** `GY`
- **TRANSACTIONS** 2 (at recorded pull time)
- **STATUSES** `COMPLETED`, `SETTLED`
- **PRODUCT TYPES** `remittance.inbound`
- **MTCNS** `3524056646` (receiving side) - see reference table

### Danny Phantom
- `userId`: `053db63f-dbfd-45d1-8677-3bf18b28c093`
- **LOOKUP TYPES** `EMAIL` = `naomi.qatesting+danny@gmail.com` · `TRN` = `225421035` · `GKO_NUMBER` = `DP20250221951B6A5C4A52140754` · `ID_DOCUMENT` = `ID_CARD` / `5421035`
- **ID TYPE ON FILE** `ID_CARD`
- **CUSTOMER TERRITORY** `JM`
- **TRANSACTIONS** 14 (at recorded pull time)
- **STATUSES** `COMPLETED`, `FAILED`, `SETTLED`
- **PRODUCT TYPES** `bill-payment.notification`, `bill-payment.order-finalisation`, `bill-payment.receipt`, `bill-payment.settle`, `bill-payment.verify-account`, `remittance.outbound`, `remittance.outbound-quote`
- **MTCNS** `3524056646` - see reference table

### Jaelynn Watt
- `userId`: `c5709ac5-3343-47f7-a2e8-029c381adedd`
- **LOOKUP TYPES** `EMAIL` = `naomi.qatesting+jaelynn@gmail.com` · `TRN` = `124321029` · `GKO_NUMBER` = `JW202406180C0F0F36B3FD193524` · `ID_DOCUMENT` = `PASSPORT` / `A4321029`
- **ID TYPE ON FILE** `PASSPORT`
- **CUSTOMER TERRITORY** `JM`
- **TRANSACTIONS** 13 (at recorded pull time)
- **STATUSES** `COMPLETED`, `FAILED`, `SETTLED`
- **PRODUCT TYPES** `payment.card-capture`, `payment.card-charge`, `payment.preauth`, `remittance.outbound`, `remittance.outbound-quote`, `wallet.delete-card`
- **MTCNS** `0123243471`, `1160897583` - see reference table

### Jaisie Jones
- `userId`: `e867f245-74a3-4275-ae2e-30fb8ade9503`
- **LOOKUP TYPES** `EMAIL` = `naomi.qatesting+jaisie@gmail.com` · `TRN` = `228881938` · `ID_DOCUMENT` = `ID_CARD` / `4441033` · `GKO_NUMBER` - not available
- **ID TYPE ON FILE** `ID_CARD`
- **CUSTOMER TERRITORY** `JM`
- **TRANSACTIONS** 0
- **STATUSES** none
- **PRODUCT TYPES** none
- **MTCNS** none

### Jamie Testimony
- `userId`: `b2bf18cb-434f-4812-9877-d7d4924ca8b9`
- **LOOKUP TYPES** `EMAIL` = `naomi.qatesting+jamie@gmail.com` · `TRN` = `125649002` · `GKO_NUMBER` = `JT20240611142058E23BA3121819` · `ID_DOCUMENT` = `ID_CARD` / `5649002`
- **ID TYPE ON FILE** `ID_CARD`
- **CUSTOMER TERRITORY** `JM`
- **TRANSACTIONS** 0 - use for "customer exists, no transaction history" cases.
- **STATUSES** none
- **PRODUCT TYPES** none
- **MTCNS** none

### Jordanne Testimony
- `userId`: `f9f49e15-1fc9-43c3-bf33-9342d7d495aa`
- **LOOKUP TYPES** `EMAIL` = `naomi.qatesting+jordanne@gmail.com` · `TRN` = `125649003` · `GKO_NUMBER` = `JT20240611375F5BD5FFC1124736` · `ID_DOCUMENT` = `ID_CARD` / `5649003`
- **ID TYPE ON FILE** `ID_CARD`
- **CUSTOMER TERRITORY** `JM`
- **TRANSACTIONS** 0
- **STATUSES** none
- **PRODUCT TYPES** none
- **MTCNS** none

### May Banks
- `userId`: `fcc75c1d-0f37-477c-a987-922ce38bb0c6`
- **LOOKUP TYPES** `EMAIL` = `naomi.qatesting+may02@gmail.com` · `TRN` = `424321009` · `GKO_NUMBER` = `MB20240327D2C4B69B0F2D103854` · `ID_DOCUMENT` = `DRIVER_LICENSE` / `424321009`
- **ID TYPE ON FILE** `DRIVER_LICENSE`
- **CUSTOMER TERRITORY** `JM`
- **TRANSACTIONS** 19 (at recorded pull time)
- **STATUSES** `COMPLETED`, `FAILED`, `SETTLED`
- **PRODUCT TYPES** `bill-payment.notification`, `bill-payment.order-finalisation`, `bill-payment.receipt`, `bill-payment.settle`, `bill-payment.verify-account`, `payment.card-capture`, `remittance.inbound-validate`, `remittance.outbound`, `remittance.outbound-quote`
- **MTCNS** `4773916423`, `8553916423` - see reference table

### Naomi Benjamin
- `userId`: `7d1c3b30-223b-43fb-9652-74bb4a043479`
- **LOOKUP TYPES** `EMAIL` = `naomi.qatesting+naomitt@gmail.com` · `GKO_NUMBER` = `NB202508270C1CF4182345153113` · `ID_DOCUMENT` = `PASSPORT` / `A6948561` · `TRN` - not available (blank in this data)
- **ID TYPE ON FILE** `PASSPORT`
- **CUSTOMER TERRITORY** `TT`
- **TRANSACTIONS** 3 (at recorded pull time)
- **STATUSES** `COMPLETED`, `FAILED`, `SETTLED`
- **PRODUCT TYPES** `remittance.inbound`
- **MTCNS** `8454322287` (receiving side), `7042358185` - see reference table

### Nicoreen Test
- `userId`: `3a4663ac-9e22-447b-9b63-8e3a29ced6f6`
- **LOOKUP TYPES** `EMAIL` = `naomi.qatesting+vailie@gmail.com` · `GKO_NUMBER` = `NT20241022CF2A196E1824164757` · `ID_DOCUMENT` = `PASSPORT` / `A3020192` · `TRN` - not available (blank in this data)
- **ID TYPE ON FILE** `PASSPORT`
- **CUSTOMER TERRITORY** `KY`
- **TRANSACTIONS** 4 (at recorded pull time)
- **STATUSES** `COMPLETED`, `SETTLED`
- **PRODUCT TYPES** `remittance.outbound`, `remittance.outbound-quote`
- **MTCNS** `8454322287` - see reference table

### Sally Bryce
- `userId`: `b2d86d8f-52da-413d-ad49-aa91906f8daf`
- **LOOKUP TYPES** `EMAIL` = `naomi.qatesting+sally@gmail.com` only - `TRN`, `GKO_NUMBER`, `ID_DOCUMENT` all not available (unregistered/unverified customer)
- **ID TYPE ON FILE** none on file (unregistered/unverified customer)
- **CUSTOMER TERRITORY** `JM`
- **TRANSACTIONS** 0
- **STATUSES** none
- **PRODUCT TYPES** none
- **MTCNS** none

### Shaggy Rogers
- `userId`: `788c70d5-e292-444b-bbf4-ab49bbf70d33`
- **LOOKUP TYPES** `EMAIL` = `naomi.qatesting+shaggy@gmail.com` · `TRN` = `225421036` · `GKO_NUMBER` = `SR2025022161DBC271FFE2142237` · `ID_DOCUMENT` = `ID_CARD` / `5421036`
- **ID TYPE ON FILE** `ID_CARD`
- **CUSTOMER TERRITORY** `JM`
- **TRANSACTIONS** 0
- **STATUSES** none
- **PRODUCT TYPES** none
- **MTCNS** none

---

## Other transaction activity (no linked customer profile in this pull)

These `userId`s appear in the transaction data but don't have a matching record in the customer data above - use their transaction history directly.

### Devin Jackson
- `userId`: `ad61ad30-c4c9-4f86-9549-f30d13e72a45`
- **CONTACT** Email: `naomi.qatesting+devin@gmail.com` · Phone: `+18764321018`
- **TRANSACTIONS** 5
- **STATUSES** `COMPLETED`, `FAILED`
- **PRODUCT TYPES** `bill-payment.verify-account`, `remittance.outbound`, `remittance.outbound-quote`

### Fred Flinstone
- `userId`: `5663542d-1093-472d-b5d2-37f1ce149e19`
- **CONTACT** Email: `naomi.qatesting+fred@gmail.com` · Phone: `+18764321136`
- **TRANSACTIONS** 31 - the largest set in this data; best candidate for paging tests.
- **STATUSES** `COMPLETED`, `FAILED`, `SETTLED`
- **PRODUCT TYPES** `bill-payment.notification`, `bill-payment.order-finalisation`, `bill-payment.receipt`, `bill-payment.settle`, `bill-payment.verify-account`, `remittance.outbound`, `remittance.outbound-quote`

---

## Non-existent User (negative test value)

- `userId`: `222a82f1-b5ee-46cd-9610-ef5c31e9e048`
- **SYNTHETIC** this is a well-formed GUID that has no customer record and no transaction history anywhere in this data set. Use it for negative tests that need a userId to genuinely not exist, as distinct from Fred Flinstone/Devin Jackson above (who *do* have transaction history, just no linked customer profile).

---

## MTCN Validation Reference

| MTCN | Sender | Receiver | Expected outcome | Notes |
|---|---|---|---|---|
| `3524056646` | Danny Phantom | Dane Tester | already paid | Outbound + inbound legs both settled - fully paid out. |
| `8454322287` | Nicoreen Test | Naomi Benjamin | already paid | Outbound + inbound legs both settled - fully paid out. |
| `8553916423` | May Banks | Naomi Benjamin | valid / not yet collected | Outbound settled, no inbound record in this pull - collectible for at least the next 30 days. |
| `4773916423` | May Banks | Dane Tester | valid / not yet collected | Outbound settled, no inbound record in this pull - collectible for at least the next 30 days. |
| `0123243471` | Jaelynn Watt | Red McRaith (external - no GKOne profile) | valid / not yet collected | Outbound settled; recipient isn't a GKOne customer, so no inbound leg exists in our data by design. |
| `1160897583` | Jaelynn Watt | Christopher Witherspoon (external - no GKOne profile) | valid / not yet collected | Outbound settled; recipient isn't a GKOne customer, so no inbound leg exists in our data by design. |
| `7042358185` | N/A | Naomi Benjamin | invalid format (422 "MTCN INVALID") | Real observed failure - an actual inbound validation attempt against this MTCN returned WU code U0102 (MTCN INVALID). Sender identity wasn't captured in this record. Unlike the synthetic rows below, this shows a normal-looking 10-digit MTCN can still be rejected as invalid by WU. |
| `0221925872` | N/A | N/A | **SYNTHETIC** receiver name mismatch (422) | Doesn't belong to any test user in this package. Validate it against any test user's identity to deliberately draw a receiver-name-mismatch error. |
| `0000000000` | N/A | N/A | **SYNTHETIC** invalid format (422 "MTCN INVALID") | Not tied to any real transaction - use for format-validation testing. |
| `0000000001` | N/A | N/A | **SYNTHETIC** not found | Well-formed but unknown - use for a clean "unknown MTCN" negative case. |

> **Caution:** if you validate the same MTCN twice within a 15-minute window, expect the second call to come back `record locked to another terminal`, regardless of what the first call returned (mismatch or otherwise). Avoid repeat validation calls against the same MTCN within that window.