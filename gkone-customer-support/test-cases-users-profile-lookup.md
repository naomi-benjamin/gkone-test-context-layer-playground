# Test Cases — Users Profile-Lookup Endpoints

Source: [users-profile-lookup-endpoints.md](users-profile-lookup-endpoints.md). Playground investigation, not tied to a specific ADO story.

---

## Section 1 — GET /api/Users/data

### TEST CASE 1
Title: Verify that an authenticated user can retrieve their own profile via GET /data with no parameters

Tags: Users, Customer Support, API, Smoke

Pre Conditions:
The following should be true before proceeding:
• A valid authenticated session/token exists for a customer with a complete profile

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/data` with a valid auth token and no query/body parameters | Request is accepted |
| 2. | Inspect the response | `200 OK` returned with a `GkOneUserModel` body matching the authenticated user's own profile |

Post Conditions:
The following should be true after test completion:
• No profile data is modified by this read-only call

---

### TEST CASE 2
Title: Verify that GET /data returns the calling user's own profile and not another user's, when called under two different sessions

Tags: Users, Customer Support, API, Security

Pre Conditions:
The following should be true before proceeding:
• Two distinct customer accounts with valid auth tokens each

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Call `GET /api/Users/data` as User A | `200 OK`, profile belongs to User A |
| 2. | Call `GET /api/Users/data` as User B using a separate session | `200 OK`, profile belongs to User B, no fields leak from User A's session |

Post Conditions:
The following should be true after test completion:
• Each response is scoped strictly to the identity carried by its own auth token

---

## Section 2 — Single-identifier profile lookups (userProfile, getGkOneUserProfileById, userProfileById, userProfileByPhoneNumber, userProfileByEmail [GET], userProfileByEmailOrPhoneNumber, userProfileByTrn, userProfileForOperations)

These eight endpoints share the same request/response shape (one identifier in, one profile or 404 out), so the same four-case pattern is applied to each: valid match, no match, missing identifier, malformed identifier. `[UNCERTAIN]` markers on the missing/malformed cases are carried from the reference file — the spec doesn't declare required-ness or format constraints on any of these params.

### TEST CASE 3
Title: Verify that a user profile is returned when a valid, existing userId is supplied to GET /userProfile

Tags: Users, Customer Support, API

Pre Conditions:
The following should be true before proceeding:
• A customer profile exists with a known `userId`

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfile?userId=<existing userId>` | `200 OK` returned |
| 2. | Inspect the response body | Body is a `GkOneUserModel` matching the requested `userId` |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 4
Title: Verify that GET /userProfile returns 404 Not Found when the supplied userId does not match any profile

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• A syntactically valid `userId` value that does not correspond to any existing profile

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfile?userId=<non-existent userId>` | `404 Not Found` returned, not `200` with an empty body — this endpoint does not follow the `/customers/filter` empty-200 pattern (see [customer-filter.md](customer-filter.md)) |
| 2. | Inspect the response body | Body is a `ProblemDetails` object |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 5
Title: [UNCERTAIN] Verify system behaviour when GET /userProfile is called with no userId supplied

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• None — this exercises absence of a required-looking parameter

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfile` with the `userId` query parameter omitted entirely | `[UNCERTAIN]` — spec does not mark `userId` as required; confirm whether this returns `400 Bad Request` or is treated as a no-match `404` |
| 2. | Repeat with `userId=` (present but empty) | `[UNCERTAIN]` — confirm whether empty-string behaves the same as omitted |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 6
Title: [UNCERTAIN] Verify system behaviour when GET /userProfile is called with a malformed userId

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• A `userId` value in an unexpected format (e.g. not a GUID, if GUIDs are the real identifier format — confirm identifier format with a dev)

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfile?userId=not-a-real-id-format` | `[UNCERTAIN]` — spec shows no format constraint on `userId`; confirm whether this returns `400`, `404`, or a server error |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 7
Title: Verify that a user profile is returned when a valid, existing userId is supplied to GET /getGkOneUserProfileById

Tags: Users, Customer Support, API

Pre Conditions:
The following should be true before proceeding:
• A customer profile exists with a known `userId`

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/getGkOneUserProfileById?userId=<existing userId>` | `200 OK` returned |
| 2. | Inspect the response body | Body is a `GkOneUser` object (note: broader schema than `GkOneUserModel` — includes internal/auth fields such as `password`, `lockoutEnabled`, `entraExternalId`) |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 8
Title: Verify that GET /getGkOneUserProfileById returns 404 Not Found when the supplied userId does not match any profile

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• A syntactically valid `userId` value that does not correspond to any existing profile

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/getGkOneUserProfileById?userId=<non-existent userId>` | `404 Not Found` returned |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 9
Title: [UNCERTAIN] Verify system behaviour when GET /getGkOneUserProfileById is called with no userId supplied

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• None

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/getGkOneUserProfileById` with `userId` omitted | `[UNCERTAIN]` — confirm `400` vs `404` |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 10
Title: [UNCERTAIN] Verify system behaviour when GET /getGkOneUserProfileById is called with a malformed userId

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• A malformed `userId` value

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/getGkOneUserProfileById?userId=not-a-real-id-format` | `[UNCERTAIN]` — confirm response |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 11
Title: Verify that a user profile is returned when a valid, existing userId is supplied to GET /userProfileById

Tags: Users, Customer Support, API

Pre Conditions:
The following should be true before proceeding:
• A customer profile exists with a known `userId`

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfileById?userId=<existing userId>` | `200 OK` returned |
| 2. | Inspect the response body | Body is a `GkOneUserModel` matching the requested `userId` |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 12
Title: Verify that GET /userProfileById returns 404 Not Found when the supplied userId does not match any profile

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• A syntactically valid `userId` value that does not correspond to any existing profile

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfileById?userId=<non-existent userId>` | `404 Not Found` returned |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 13
Title: [UNCERTAIN] Verify system behaviour when GET /userProfileById is called with no userId supplied

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• None

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfileById` with `userId` omitted | `[UNCERTAIN]` — confirm `400` vs `404` |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 14
Title: [UNCERTAIN] Verify system behaviour when GET /userProfileById is called with a malformed userId

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• A malformed `userId` value

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfileById?userId=not-a-real-id-format` | `[UNCERTAIN]` — confirm response |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 15
Title: Verify that a user profile is returned when a valid, registered phoneNumber is supplied to GET /userProfileByPhoneNumber

Tags: Users, Customer Support, API

Pre Conditions:
The following should be true before proceeding:
• A customer profile exists with a known, registered `phoneNumber`

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfileByPhoneNumber?phoneNumber=<registered number>` | `200 OK` returned |
| 2. | Inspect the response body | Body is a `GkOneUserModel` matching the requested phone number |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 16
Title: Verify that GET /userProfileByPhoneNumber returns 404 Not Found when the supplied phone number is not registered

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• A syntactically valid phone number not registered to any profile

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfileByPhoneNumber?phoneNumber=<unregistered number>` | `404 Not Found` returned |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 17
Title: [UNCERTAIN] Verify system behaviour when GET /userProfileByPhoneNumber is called with no phoneNumber supplied

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• None

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfileByPhoneNumber` with `phoneNumber` omitted | `[UNCERTAIN]` — confirm `400` vs `404` |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 18
Title: [UNCERTAIN] Verify system behaviour when GET /userProfileByPhoneNumber is called with a malformed phone number

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• A malformed phone number value (letters, wrong length, missing country code)

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfileByPhoneNumber?phoneNumber=ABC123` | `[UNCERTAIN]` — confirm whether format is validated (`400`) or treated as simply no-match (`404`) |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 19
Title: Verify that a user profile is returned when a valid, registered email is supplied to GET /userProfileByEmail

Tags: Users, Customer Support, API

Pre Conditions:
The following should be true before proceeding:
• A customer profile exists with a known, registered email address

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfileByEmail?email=<registered email>` | `200 OK` returned |
| 2. | Inspect the response body | Body is a `GkOneUserModel` matching the requested email |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 20
Title: Verify that GET /userProfileByEmail returns 404 Not Found when the supplied email is not registered

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• A syntactically valid email not registered to any profile

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfileByEmail?email=<unregistered email>` | `404 Not Found` returned |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 21
Title: [UNCERTAIN] Verify system behaviour when GET /userProfileByEmail is called with no email supplied

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• None

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfileByEmail` with `email` omitted | `[UNCERTAIN]` — confirm `400` vs `404` |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 22
Title: [UNCERTAIN] Verify system behaviour when GET /userProfileByEmail is called with a malformed email

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• A malformed email value (e.g. `not-an-email`)

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfileByEmail?email=not-an-email` | `[UNCERTAIN]` — confirm whether email format is validated (`400`) or treated as no-match (`404`) |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 23
Title: Verify that a user profile is returned when a valid registered email is supplied as searchTerm to GET /userProfileByEmailOrPhoneNumber

Tags: Users, Customer Support, API

Pre Conditions:
The following should be true before proceeding:
• A customer profile exists with a known, registered email

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfileByEmailOrPhoneNumber?searchTerm=<registered email>` | `200 OK` returned |
| 2. | Inspect the response body | Body is a `GkOneUserModel` matching the profile owning that email |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 24
Title: Verify that a user profile is returned when a valid registered phone number is supplied as searchTerm to GET /userProfileByEmailOrPhoneNumber

Tags: Users, Customer Support, API

Pre Conditions:
The following should be true before proceeding:
• A customer profile exists with a known, registered phone number

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfileByEmailOrPhoneNumber?searchTerm=<registered phone number>` | `200 OK` returned |
| 2. | Inspect the response body | Body is a `GkOneUserModel` matching the profile owning that phone number |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 25
Title: Verify that GET /userProfileByEmailOrPhoneNumber returns 404 Not Found when searchTerm matches neither an email nor a phone number on file

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• A syntactically valid email or phone number not registered to any profile

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfileByEmailOrPhoneNumber?searchTerm=<unregistered value>` | `404 Not Found` returned |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 26
Title: [UNCERTAIN] Verify system behaviour when GET /userProfileByEmailOrPhoneNumber is given a searchTerm that is neither a valid email nor a valid phone number shape

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• A `searchTerm` value that doesn't parse as either an email or a phone number (e.g. `"hello123"`)

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfileByEmailOrPhoneNumber?searchTerm=hello123` | `[UNCERTAIN]` — spec doesn't document how the endpoint decides which lookup path to take; confirm whether this is a `400`, a `404`, or matched against both fields literally |
| 2. | Send the request with `searchTerm` omitted | `[UNCERTAIN]` — confirm `400` vs `404` |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 27
Title: Verify that a user profile is returned when a valid, existing TRN is supplied to GET /userProfileByTrn

Tags: Users, Customer Support, API

Pre Conditions:
The following should be true before proceeding:
• A customer profile exists with a known TRN

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfileByTrn?trn=<existing TRN>` | `200 OK` returned |
| 2. | Inspect the response body | Body is a `GkOneUserModel` matching the requested TRN |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 28
Title: Verify that GET /userProfileByTrn returns 404 Not Found when the supplied TRN does not match any profile

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• A syntactically valid TRN not associated with any profile

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfileByTrn?trn=<non-existent TRN>` | `404 Not Found` returned |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 29
Title: [UNCERTAIN] Verify that GET /userProfileByTrn applies the same 9-digit TRN format validation as /customers/filter

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• Familiarity with `/customers/filter`'s documented rule: TRN must be exactly 9 digits (see [customer-filter.md](customer-filter.md))

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfileByTrn?trn=12345` (short) | `[UNCERTAIN]` — confirm whether this endpoint validates TRN length the same way `/customers/filter` does (`400`), or simply treats it as no-match (`404`) since there's no `country` param here to pair with |
| 2. | Send `GET /api/Users/userProfileByTrn?trn=12345ABCD` (non-numeric) | `[UNCERTAIN]` — confirm response |
| 3. | Send `GET /api/Users/userProfileByTrn` with `trn` omitted | `[UNCERTAIN]` — confirm `400` vs `404` |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 30
Title: Verify that a user profile is returned when a valid, registered phoneNumber is supplied to GET /userProfileForOperations

Tags: Users, Customer Support, API

Pre Conditions:
The following should be true before proceeding:
• A customer profile exists with a known, registered `phoneNumber`

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfileForOperations?phoneNumber=<registered number>` | `200 OK` returned |
| 2. | Inspect the response body | Body is a `GkOneUserModel` matching the requested phone number |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 31
Title: Verify that GET /userProfileForOperations returns 404 Not Found when the supplied phone number is not registered

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• A syntactically valid phone number not registered to any profile

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/userProfileForOperations?phoneNumber=<unregistered number>` | `404 Not Found` returned |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 32
Title: [UNCERTAIN] Verify whether GET /userProfileForOperations behaves identically to GET /userProfileByPhoneNumber for the same input, or differs by auth context only

Tags: Users, Customer Support, API, Regression

Pre Conditions:
The following should be true before proceeding:
• A customer profile exists with a known, registered `phoneNumber`
• Access to call both endpoints under the same and under different auth contexts (e.g. internal/operations token vs. standard token)

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Call `GET /api/Users/userProfileByPhoneNumber?phoneNumber=<number>` with a standard token | `200 OK`, profile returned |
| 2. | Call `GET /api/Users/userProfileForOperations?phoneNumber=<same number>` with the same token | `[UNCERTAIN]` — confirm whether this succeeds identically, or requires an operations-scoped token/role and `401`/`403`s otherwise. Ask a dev what the intended distinction between these two endpoints is |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

## Section 3 — Cross-endpoint consistency (userProfile, getGkOneUserProfileById, userProfileById)

### TEST CASE 33
Title: [UNCERTAIN] Verify that userProfile, getGkOneUserProfileById, and userProfileById agree on match/no-match for the same userId

Tags: Users, Customer Support, API, Regression

Pre Conditions:
The following should be true before proceeding:
• A known existing `userId` and a known non-existent `userId`

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Call all three endpoints with the same existing `userId`: `GET /userProfile`, `GET /getGkOneUserProfileById`, `GET /userProfileById` | All three return `200 OK` |
| 2. | Compare the identifying fields common across their response schemas (e.g. `id`/`userId`, `email`, `phoneNumber`, `trn`) | All three agree on which profile they resolved to |
| 3. | Repeat steps 1–2 with the same non-existent `userId` | All three return `404 Not Found` consistently — `[UNCERTAIN]` whether any one of the three diverges (e.g. returns `200` with a partial/null object instead) given they're backed by different response schemas |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

## Section 4 — DELETE /api/Users/userProfileByEmail

### TEST CASE 34
Title: Verify that a customer profile can be deleted by a valid, existing email via DELETE /userProfileByEmail

Tags: Users, Customer Support, API, Destructive

Pre Conditions:
The following should be true before proceeding:
• A disposable/test customer profile exists with a known, registered email — do not run against a real customer record
• `azureDeleteOnly` set to `false`

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `DELETE /api/Users/userProfileByEmail` with body `{ "email": "<test profile email>", "azureDeleteOnly": false }` | `200 OK` returned |
| 2. | Inspect the response body | Body is an `AzureB2CUser` reflecting the deleted account |
| 3. | Attempt `GET /api/Users/userProfileByEmail?email=<same email>` | `404 Not Found` — profile no longer resolvable |

Post Conditions:
The following should be true after test completion:
• The test profile is fully removed from both GKOne and Azure B2C (per `azureDeleteOnly: false`)

---

### TEST CASE 35
Title: [UNCERTAIN] Verify that DELETE /userProfileByEmail with azureDeleteOnly=true removes only the Azure B2C record, not the GKOne profile

Tags: Users, Customer Support, API, Destructive

Pre Conditions:
The following should be true before proceeding:
• A disposable/test customer profile exists with a known, registered email

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `DELETE /api/Users/userProfileByEmail` with body `{ "email": "<test profile email>", "azureDeleteOnly": true }` | `200 OK` returned |
| 2. | Attempt `GET /api/Users/userProfileByEmail?email=<same email>` | `[UNCERTAIN]` — per the field name, expect the GKOne profile to still resolve (`200`) since only the Azure record was removed; confirm this with a dev, since `[UNCERTAIN]` semantics in the reference doc |

Post Conditions:
The following should be true after test completion:
• Only the Azure B2C record is removed; GKOne profile state is confirmed against expectations from step 2

---

### TEST CASE 36
Title: Verify that DELETE /userProfileByEmail returns 404 Not Found when the supplied email does not match any profile

Tags: Users, Customer Support, API, Negative, Destructive

Pre Conditions:
The following should be true before proceeding:
• A syntactically valid email not registered to any profile

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `DELETE /api/Users/userProfileByEmail` with body `{ "email": "<unregistered email>", "azureDeleteOnly": false }` | `404 Not Found` returned |

Post Conditions:
The following should be true after test completion:
• No data is modified — nothing existed to delete

---

### TEST CASE 37
Title: [UNCERTAIN] Verify system behaviour when DELETE /userProfileByEmail is called with an empty or missing email in the request body

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• None

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `DELETE /api/Users/userProfileByEmail` with body `{ "email": "", "azureDeleteOnly": false }` | `[UNCERTAIN]` — confirm `400` vs `404` |
| 2. | Send `DELETE /api/Users/userProfileByEmail` with the `email` field omitted from the body entirely | `[UNCERTAIN]` — confirm response |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

## Section 5 — POST /api/Users/userProfilesByPhoneNumbers

### TEST CASE 38
Title: Verify that profiles are returned for all matching numbers when a valid array of registered phone numbers is posted to /userProfilesByPhoneNumbers

Tags: Users, Customer Support, API

Pre Conditions:
The following should be true before proceeding:
• At least two customer profiles exist with known, registered phone numbers

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `POST /api/Users/userProfilesByPhoneNumbers` with body `["<number 1>", "<number 2>"]` | `200 OK` returned |
| 2. | Inspect the response body | Array of `GkOneUserModel` containing both matching profiles |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 39
Title: Verify system behaviour when POST /userProfilesByPhoneNumbers is called with an empty array

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• None

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `POST /api/Users/userProfilesByPhoneNumbers` with body `[]` | `[UNCERTAIN]` — confirm whether this returns `200` with an empty array, or a `400`/`404` |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 40
Title: [UNCERTAIN] Verify system behaviour when POST /userProfilesByPhoneNumbers is called with a mix of registered and unregistered numbers

Tags: Users, Customer Support, API, Edge Case

Pre Conditions:
The following should be true before proceeding:
• At least one registered phone number and one unregistered phone number

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `POST /api/Users/userProfilesByPhoneNumbers` with body `["<registered number>", "<unregistered number>"]` | `[UNCERTAIN]` — confirm whether the response array simply omits the unmatched number (returning only the matched profile), or whether the whole request errors/404s because one entry didn't match |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 41
Title: [UNCERTAIN] Verify system behaviour when POST /userProfilesByPhoneNumbers is called with a duplicated number in the array

Tags: Users, Customer Support, API, Edge Case

Pre Conditions:
The following should be true before proceeding:
• A registered phone number

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `POST /api/Users/userProfilesByPhoneNumbers` with body `["<registered number>", "<registered number>"]` (same number twice) | `[UNCERTAIN]` — confirm whether the response array contains the matching profile once or twice |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

## Section 6 — POST /api/Users/userProfileByName

### TEST CASE 42
Title: Verify that a user profile is returned when a valid firstName and lastName combination is posted to /userProfileByName

Tags: Users, Customer Support, API

Pre Conditions:
The following should be true before proceeding:
• A customer profile exists with a known `firstName`/`lastName` combination that is unique in the test environment

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `POST /api/Users/userProfileByName` with body `{ "firstName": "<first>", "lastName": "<last>" }` | `200 OK` returned |
| 2. | Inspect the response body | Body is a single `GkOneUserModel` matching the requested name |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 43
Title: Verify that POST /userProfileByName returns 404 Not Found when no profile matches the supplied name

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• A firstName/lastName combination that does not match any profile

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `POST /api/Users/userProfileByName` with body `{ "firstName": "Nonexistent", "lastName": "Person" }` | `404 Not Found` returned |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 44
Title: [UNCERTAIN] Verify system behaviour when POST /userProfileByName is called with firstName or lastName missing

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• None

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `POST /api/Users/userProfileByName` with body `{ "lastName": "<last>" }` (`firstName` omitted) | `[UNCERTAIN]` — confirm `400` vs treating the missing field as an open wildcard |
| 2. | Send `POST /api/Users/userProfileByName` with body `{ "firstName": "<first>" }` (`lastName` omitted) | `[UNCERTAIN]` — confirm response |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 45
Title: [UNCERTAIN] Verify system behaviour when POST /userProfileByName matches more than one customer profile

Tags: Users, Customer Support, API, Edge Case

Pre Conditions:
The following should be true before proceeding:
• Two or more customer profiles exist that share the exact same `firstName`/`lastName` combination (may require test data setup)

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `POST /api/Users/userProfileByName` with the shared name | `[UNCERTAIN]` — response schema (`GkOneUserModel`, a single object) suggests only one profile is returned; confirm which one is chosen (e.g. most recent, first created) and whether that's documented/intentional behavior worth flagging to devs |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

## Section 7 — GET /api/Users/search

### TEST CASE 46
Title: Verify that GET /search returns a paginated result set for a baseline query term

Tags: Users, Customer Support, API

Pre Conditions:
The following should be true before proceeding:
• Multiple customer profiles exist in the test environment matching a common query term

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/search?q=<common term>` with no other parameters | `200 OK` returned |
| 2. | Inspect the response body | Body is a `GkOneUserModelPaginatedSearchResponse` with `items`, `page`, `pageSize`, `totalCount`, `totalPages`, `hasNextPage`, `hasPreviousPage` all populated and internally consistent (e.g. `items.length <= pageSize`, `totalPages == ceil(totalCount / pageSize)`) |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 47
Title: [UNCERTAIN] Verify system behaviour when GET /search matches zero results

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• A query term guaranteed to match no profiles

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/search?q=<term guaranteed to match nothing>` | `[UNCERTAIN]` — given the paginated-response shape, expect `200 OK` with `items: []`, `totalCount: 0`; confirm this rather than a `404`, since `404` is also a declared response for this endpoint and its trigger condition isn't specified |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 48
Title: Verify that GET /search page boundary values are handled correctly (page=0, page=1)

Tags: Users, Customer Support, API, Boundary

Pre Conditions:
The following should be true before proceeding:
• Enough matching profiles to span at least 2 pages at a small pageSize

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/search?q=<term>&page=1&pageSize=5` | `200 OK`, first page of results returned, `hasPreviousPage: false` |
| 2. | Send `GET /api/Users/search?q=<term>&page=0&pageSize=5` | `[UNCERTAIN]` — confirm whether `page=0` is treated as `400`, clamped to page 1, or returns an empty/invalid page |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 49
Title: [UNCERTAIN] Verify GET /search pageSize boundary values (pageSize=0, pageSize negative)

Tags: Users, Customer Support, API, Boundary, Negative

Pre Conditions:
The following should be true before proceeding:
• At least one matching profile

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/search?q=<term>&pageSize=0` | `[UNCERTAIN]` — confirm whether this is `400`, defaults to a standard page size, or returns zero items |
| 2. | Send `GET /api/Users/search?q=<term>&pageSize=-1` | `[UNCERTAIN]` — confirm response |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 50
Title: Verify that GET /search filters results correctly when filterBy is supplied

Tags: Users, Customer Support, API

Pre Conditions:
The following should be true before proceeding:
• Known valid value(s) for `filterBy` — `[VERIFY: valid filterBy values / ask a dev]`, spec types it as an unconstrained string

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/search?q=<term>&filterBy=<valid filter value>` | `200 OK`, results restricted to profiles matching the filter |
| 2. | Send `GET /api/Users/search?q=<term>&filterBy=not-a-real-filter` | `[UNCERTAIN]` — confirm whether an invalid `filterBy` value returns `400` or is silently ignored |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 51
Title: Verify that GET /search archived toggle correctly includes or excludes archived profiles

Tags: Users, Customer Support, API

Pre Conditions:
The following should be true before proceeding:
• At least one archived and one active profile matching the query term

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/search?q=<term>&archived=false` | `200 OK`, only active (non-archived) profiles returned |
| 2. | Send `GET /api/Users/search?q=<term>&archived=true` | `200 OK`, archived profiles are included/returned |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 52
Title: Verify that GET /search hasTrn toggle correctly filters profiles with and without a TRN on file

Tags: Users, Customer Support, API

Pre Conditions:
The following should be true before proceeding:
• At least one profile with a TRN and one without, both matching the query term

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/search?q=<term>&hasTrn=true` | `200 OK`, only profiles with a TRN on file are returned |
| 2. | Send `GET /api/Users/search?q=<term>&hasTrn=false` | `200 OK`, only profiles without a TRN on file are returned |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 53
Title: Verify that GET /search tenantId correctly scopes results to a single tenant

Tags: Users, Customer Support, API, Multi-Tenancy

Pre Conditions:
The following should be true before proceeding:
• Profiles matching the query term exist across at least two different tenants

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/search?q=<term>&tenantId=<tenant A>` | `200 OK`, only profiles belonging to tenant A are returned |
| 2. | Send `GET /api/Users/search?q=<term>&tenantId=<tenant B>` | `200 OK`, only profiles belonging to tenant B are returned — no cross-tenant leakage between the two calls |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 54
Title: Verify that GET /search returns correctly filtered results when multiple filter parameters are combined

Tags: Users, Customer Support, API

Pre Conditions:
The following should be true before proceeding:
• Test data with varied combinations of `archived`, `hasTrn`, and `tenantId` so combined filtering is distinguishable from any single filter alone

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/Users/search?q=<term>&archived=false&hasTrn=true&tenantId=<tenant A>` | `200 OK`, results satisfy all three conditions simultaneously (active, has a TRN, belongs to tenant A) |
| 2. | Compare against the result sets from the single-filter cases (TEST CASE 51–53) | Combined result is the intersection of the individual filters, not a superset |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

## Section 8 — GET /api/v1/users/external-wallet-id/{externalWalletId} and /exists

### TEST CASE 55
Title: Verify that GET /external-wallet-id/{id} returns exists=true for a wallet ID that is linked to a profile

Tags: Users, Customer Support, API

Pre Conditions:
The following should be true before proceeding:
• A profile exists with a known `externalWalletReferenceNo`/external wallet ID linked

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/v1/users/external-wallet-id/<linked externalWalletId>` | `200 OK` returned |
| 2. | Inspect the response body | `DoesExternalWalletIdExistQueryResponse` with `exists: true` — `[UNCERTAIN]` whether any profile data is included beyond the boolean, despite the path implying a profile lookup; confirm actual response shape |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 56
Title: Verify that GET /external-wallet-id/{id} returns exists=false (still 200, not 404) for a wallet ID with no linked profile

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• A syntactically valid external wallet ID that is not linked to any profile

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/v1/users/external-wallet-id/<unlinked externalWalletId>` | `200 OK` returned — no `404` is declared for this endpoint, unlike the rest of this group |
| 2. | Inspect the response body | `DoesExternalWalletIdExistQueryResponse` with `exists: false` |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 57
Title: [UNCERTAIN] Verify system behaviour when GET /external-wallet-id/{id} is called with a malformed externalWalletId

Tags: Users, Customer Support, API, Negative

Pre Conditions:
The following should be true before proceeding:
• A malformed external wallet ID value

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Send `GET /api/v1/users/external-wallet-id/not-a-real-id` | `[UNCERTAIN]` — confirm whether this returns `400` or `200` with `exists: false` |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

### TEST CASE 58
Title: [UNCERTAIN] Verify that GET /external-wallet-id/{id} and its /exists sibling return identical results for the same externalWalletId

Tags: Users, Customer Support, API, Regression

Pre Conditions:
The following should be true before proceeding:
• A known linked external wallet ID and a known unlinked external wallet ID

Steps:
| Step | Action | Expected Result |
|------|--------|------------------|
| 1. | Call `GET /api/v1/users/external-wallet-id/<linked id>` and `GET /api/v1/users/external-wallet-id/<linked id>/exists` | Both return `200 OK` with `exists: true` |
| 2. | Repeat with an unlinked id on both endpoints | Both return `200 OK` with `exists: false` |
| 3. | `[UNCERTAIN]` — the two endpoints appear to be functional duplicates; ask a dev which is canonical and whether one is deprecated, since maintaining test coverage for both may be unnecessary going forward |

Post Conditions:
The following should be true after test completion:
• No data is modified

---

## Summary

**58 test cases** across 8 sections:
- Happy path / alternate valid paths: 24 (one per endpoint's valid-match case, plus `/search`'s filter-specific happy paths and the two-lookup-path cases for `userProfileByEmailOrPhoneNumber`)
- Negative / error cases (404 no-match, missing/malformed identifiers, boundary values): 30
- Edge cases (batch duplicates/partial matches, name-collision, endpoint-pair consistency checks): 4

### Assumptions made due to gaps in the input
- The identifier format for `userId` (GUID vs. other) is assumed but not confirmed — flagged `[UNCERTAIN]` wherever it matters.
- `filterBy`'s valid values are unknown; flagged `[VERIFY]` rather than guessed.
- Auth/authorization behavior (401/403) is out of scope for these cases since none of the 14 endpoints in the reference file declare 401 responses except by omission — TEST CASE 32 flags this as a specific open question for `userProfileForOperations` given its name implies a scoped/internal use case.

### Context applied
- **users-profile-lookup-endpoints.md** (primary source) — every endpoint's params, response schemas, and status codes came from here; the `[UNCERTAIN]` items in that file (required-ness/format constraints, batch/name-collision behavior, the two external-wallet-id endpoints' relationship) drove roughly half of this suite's negative and edge cases.
- **customer-filter.md** — used specifically for the 404-vs-empty-200 contrast (TEST CASE 4 and throughout Section 2's no-match cases) and for the TRN 9-digit format rule referenced in TEST CASE 29.
- **_global/domain-gloassary.md** — confirmed `kycStatus` and `kycTier` are distinct fields, relevant since both appear in `GkOneUserModel`/`GkOneUser`, though no case here specifically exercises them (out of scope — these endpoints return the fields, they don't filter or validate on them, except `/search`'s `hasTrn`).
- **_global/cross-cutting-concerns.md** — confirmed multi-tenancy is a real cross-cutting concern in this system, supporting TEST CASE 53's `tenantId` scoping case.
- **_global/personas-and-accounts.md** — checked, currently empty; no persona-specific data available to ground the "existing profile" preconditions in named test accounts. Flagged as a gap — Pre Conditions throughout this suite use generic placeholders (`<existing userId>`, `<registered email>`) rather than named test accounts as a result.

Want me to add cases for any specific scenario (e.g. concurrent DELETE + GET race conditions, or authorization boundaries for `userProfileForOperations`), or adjust the Pre/Post Conditions on any of these?
