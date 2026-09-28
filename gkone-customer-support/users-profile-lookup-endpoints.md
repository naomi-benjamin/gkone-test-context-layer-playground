# Users Profile-Lookup Endpoints

Source: `/Users/naomi.silvera/Documents/Postman/user-profile-swagger-def.json` (GKOne IAM OpenAPI spec), 2026-09-08

Scope: the 14 "find/return a user profile" endpoints under the `Users` tag. (The `Users` tag has ~55 endpoints total — auth/signin, account management, etc. are out of scope here.)

## Notable differences from `/customers/filter`

See [customer-filter.md](customer-filter.md) for the previously-documented `/api/v1/customers/filter` endpoint. Key contrast:

- **`/customers/filter` returns `200` with an empty result when nothing matches.** Every endpoint below (except `/search` and the two `external-wallet-id` endpoints) **returns `404 Not Found`** on no-match instead. A tester assuming the same empty-200 pattern across both endpoint families will write the wrong expected-status assertion.
- `/customers/filter` takes one unified request body with a `lookupType` discriminator. These endpoints are one-identifier-per-endpoint — there's no discriminator field to get wrong, but there's no shared validation behavior to lean on either.
- None of these endpoints declare `required` or format constraints on their identifier params in the spec (no phone/email/TRN regex visible) — `[UNCERTAIN]` whether missing/malformed identifiers 400 or just no-match/404. Flagged per-endpoint below.

## Endpoints

### `GET /api/Users/data`
No parameters (identity presumably comes from auth context/token).
- `200` → `GkOneUserModel`

### `GET /api/Users/userProfile`
| Param | In | Type |
|---|---|---|
| `userId` | query | string |

- `200` → `GkOneUserModel`
- `400` Bad Request → `ProblemDetails`
- `404` Not Found → `ProblemDetails`
- `[UNCERTAIN]` whether `400` fires on missing `userId` or malformed `userId` (format not specified) — needs a test to confirm which.

### `GET /api/Users/getGkOneUserProfileById`
| Param | In | Type |
|---|---|---|
| `userId` | query | string |

- `200` → `GkOneUser` (note: different schema than `userProfile`'s `GkOneUserModel` — has more internal/auth fields, e.g. `password`, `lockoutEnabled`, `entraExternalId`)
- `400` Bad Request, `404` Not Found → `ProblemDetails`

### `GET /api/Users/userProfileById`
| Param | In | Type |
|---|---|---|
| `userId` | query | string |

- `200` → `GkOneUserModel`
- `400` Bad Request, `404` Not Found → `ProblemDetails`
- Functionally overlaps with `userProfile` and `getGkOneUserProfileById` above — same identifier (`userId`), different response schemas. Worth a comparison test across all three with the same `userId` to confirm they agree on match/no-match.

### `GET /api/Users/userProfileByPhoneNumber`
| Param | In | Type |
|---|---|---|
| `phoneNumber` | query | string |

- `200` → `GkOneUserModel`
- `400` Bad Request, `404` Not Found → `ProblemDetails`

### `GET /api/Users/userProfileByEmail`
| Param | In | Type |
|---|---|---|
| `email` | query | string |

- `200` → `GkOneUserModel`
- `400` Bad Request, `404` Not Found → `ProblemDetails`

### `DELETE /api/Users/userProfileByEmail`
Same path as above, different verb and a **request body** instead of a query param:

Request body → `GkOneUserDelete`:
| Field | Type |
|---|---|
| `email` | string |
| `azureDeleteOnly` | boolean — `[UNCERTAIN]` exact semantics; presumably scopes the delete to the Azure B2C record only vs. also the GKOne profile |

- `200` → `AzureB2CUser` (`id`, `displayName`, `phoneNumber`, `email`, `lockoutEnabled`, `lockoutReason`)
- `400` Bad Request, `404` Not Found → `ProblemDetails`

### `POST /api/Users/userProfilesByPhoneNumbers`
Request body: raw JSON array of strings (phone numbers), not a wrapped object.
- `200` → array of `GkOneUserModel`
- `400` Bad Request, `404` Not Found → `ProblemDetails`
- `[UNCERTAIN]` whether an unmatched number in the array is silently dropped from the response array or causes a `404`/error for the whole batch.

### `GET /api/Users/userProfileByEmailOrPhoneNumber`
| Param | In | Type |
|---|---|---|
| `searchTerm` | query | string |

- `200` → `GkOneUserModel`
- `400` Bad Request, `404` Not Found → `ProblemDetails`
- `[UNCERTAIN]` how the endpoint decides whether `searchTerm` is an email or a phone number (format sniffing, presumably) — worth a test with an ambiguous/malformed value that's neither.

### `GET /api/Users/userProfileByTrn`
| Param | In | Type |
|---|---|---|
| `trn` | query | string |

- `200` → `GkOneUserModel`
- `400` Bad Request, `404` Not Found → `ProblemDetails`
- Compare against `/customers/filter`'s TRN lookup (which requires a `country` and validates TRN as exactly 9 digits, per [customer-filter.md](customer-filter.md)) — `[UNCERTAIN]` whether this endpoint applies the same 9-digit validation since there's no `country` param here at all.

### `POST /api/Users/userProfileByName`
Request body → `GkOneUserGivenNames`:
| Field | Type |
|---|---|
| `firstName` | string |
| `lastName` | string |

- `200` → `GkOneUserModel` (single object, not an array — `[UNCERTAIN]` what happens when multiple customers share the same first+last name; the response shape suggests only one is returned)
- `400` Bad Request, `404` Not Found → `ProblemDetails`

### `GET /api/Users/search`
| Param | In | Type |
|---|---|---|
| `q` | query | string |
| `filterBy` | query | string |
| `page` | query | integer |
| `pageSize` | query | integer |
| `archived` | query | boolean |
| `hasTrn` | query | boolean |
| `tenantId` | query | string |

- `200` → `GkOneUserModelPaginatedSearchResponse` (`items`, `page`, `pageSize`, `totalCount`, `totalPages`, `hasNextPage`, `hasPreviousPage`)
- `400` Bad Request → `ProblemDetails`
- `404` Not Found → `ProblemDetails` — `[UNCERTAIN]`: unlike the other endpoints, a search returning zero results seems more naturally a `200` with an empty `items` array given the paginated-response shape; needs confirmation whether `404` is reserved for a different failure (e.g. invalid `filterBy` value) rather than "no results."
- The only endpoint in this group with pagination and multiple independent filters — highest combinatorial surface area of the set.

### `GET /api/Users/userProfileForOperations`
| Param | In | Type |
|---|---|---|
| `phoneNumber` | query | string |

- `200` → `GkOneUserModel`
- `400` Bad Request, `404` Not Found → `ProblemDetails`
- `[UNCERTAIN]` how this differs from `userProfileByPhoneNumber` — same param, same response schema, different path. Possibly scoped to an "operations"/internal-tooling auth context rather than a behavioral difference; worth asking a dev.

### `GET /api/v1/users/external-wallet-id/{externalWalletId}`
| Param | In | Type |
|---|---|---|
| `externalWalletId` | path, required | string |

- `200` → `DoesExternalWalletIdExistQueryResponse` (`exists`: boolean)
- `400` Bad Request → `ProblemDetails`
- No `404` declared — this endpoint appears designed to always `200` with `exists: true/false` rather than 404ing on no-match, unlike the rest of this group. `[UNCERTAIN]` given the response schema (`DoesExternalWalletIdExistQueryResponse`) is boolean-only — despite the path suggesting it returns the profile, it may only confirm existence, not return user data. Needs verification against actual response.

### `GET /api/v1/users/external-wallet-id/{externalWalletId}/exists`
Identical parameters and response schema to the endpoint above (`DoesExternalWalletIdExistQueryResponse`). `[UNCERTAIN]` why both exist — possibly one is deprecated/an alias of the other. Worth a test confirming both return identical results for the same `externalWalletId`, and asking a dev which one is canonical.
