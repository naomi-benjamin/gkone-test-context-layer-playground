//pre-req

// Unlike customer-filter-scripts.js / validate-inbound-scripts.js (one fixed endpoint per request,
// only the body varies), this dataset spans 14 different endpoints/methods. So this script drives a
// single dynamic Postman request: it sets pm.request.url, pm.request.method, and pm.request.body
// itself from each row, instead of relying on a fixed URL/method configured on the request and just
// swapping {{requestBody}}. Point the request at any placeholder URL/method — both get overwritten here.

const row = pm.iterationData.toObject();

const baseUrl = pm.variables.get("user_profileurl.dev") || pm.environment.get("user_profileurl.dev");

// Which query params apply per path+method, and how the body (if any) is built.
const CONFIG = {
  "GET /api/Users/data": { query: [] },
  "GET /api/Users/userProfile": { query: ["userId"] },
  "GET /api/Users/getGkOneUserProfileById": { query: ["userId"] },
  "GET /api/Users/userProfileById": { query: ["userId"] },
  "GET /api/Users/userProfileByPhoneNumber": { query: ["phoneNumber"] },
  "GET /api/Users/userProfileByEmail": { query: ["email"] },
  "DELETE /api/Users/userProfileByEmail": {
    query: [],
    body: () => ({
      email: row.email,
      azureDeleteOnly: row.azureDeleteOnly === true || row.azureDeleteOnly === "true"
    })
  },
  "POST /api/Users/userProfilesByPhoneNumbers": {
    query: [],
    body: () => (Array.isArray(row.phoneNumbers) ? row.phoneNumbers : [])
  },
  "GET /api/Users/userProfileByEmailOrPhoneNumber": { query: ["searchTerm"] },
  "GET /api/Users/userProfileByTrn": { query: ["trn"] },
  "POST /api/Users/userProfileByName": {
    query: [],
    body: () => {
      const b = {};
      if (row.firstName !== undefined && row.firstName !== "") b.firstName = row.firstName;
      if (row.lastName !== undefined && row.lastName !== "") b.lastName = row.lastName;
      return b;
    }
  },
  "GET /api/Users/search": { query: ["q", "filterBy", "page", "pageSize", "archived", "hasTrn", "tenantId"] },
  "GET /api/Users/userProfileForOperations": { query: ["phoneNumber"] },
  "GET /api/v1/users/external-wallet-id/{externalWalletId}": { query: [], pathParams: ["externalWalletId"] },
  "GET /api/v1/users/external-wallet-id/{externalWalletId}/exists": { query: [], pathParams: ["externalWalletId"] }
};

const configKey = `${row.method} ${row.path}`;
const config = CONFIG[configKey];

if (!config) {
  throw new Error(`No request config for "${configKey}" — add an entry to CONFIG in users-profile-lookup-scripts.js`);
}

// Build the path, substituting any {param} placeholders from the row.
let path = row.path;
(config.pathParams || []).forEach(p => {
  path = path.replace(`{${p}}`, encodeURIComponent(row[p] || ""));
});

// Build the query string from whichever fields this endpoint actually accepts.
const queryParts = [];
config.query.forEach(k => {
  const v = row[k];
  if (v !== undefined && v !== null && v !== "") {
    queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  }
});
const queryString = queryParts.length ? `?${queryParts.join("&")}` : "";

pm.request.url = `${baseUrl}${path}${queryString}`;
pm.request.method = row.method;

if (config.body) {
  pm.request.headers.upsert({ key: "Content-Type", value: "application/json" });
  pm.request.body.update({ mode: "raw", raw: JSON.stringify(config.body()) });
} else {
  pm.request.body.update({ mode: "raw", raw: "" });
}

//post-res

const row = pm.iterationData.toObject();
const expectedStatus = Number(row.expectedStatus);
const expectedDetail = (row.expectedDetail === undefined || row.expectedDetail === null || row.expectedDetail === "")
  ? null
  : String(row.expectedDetail);
const matchFound = row.matchFound === "true" ? true : (row.matchFound === "false" ? false : null);

if (row.note && String(row.note).includes("[UNCERTAIN]")) {
  console.warn(`[${row.testCase}] UNCERTAIN assumption baked into this row's expectations: ${row.note}`);
}
if (row.note && String(row.note).includes("[VERIFY]")) {
  console.warn(`[${row.testCase}] Needs verification: ${row.note}`);
}

pm.test(`[${row.testCase}] Status code is ${expectedStatus}`, () => {
  pm.response.to.have.status(expectedStatus);
});

if (expectedStatus === 200) {
  const json = pm.response.json();

  if (matchFound !== null) {
    if (Array.isArray(json)) {
      // userProfilesByPhoneNumbers
      pm.test(`[${row.testCase}] Result array is ${matchFound ? "non-empty" : "empty"}`, () => {
        if (matchFound) {
          pm.expect(json.length).to.be.greaterThan(0);
        } else {
          pm.expect(json.length).to.eql(0);
        }
      });
    } else if (json && Array.isArray(json.items)) {
      // /search's paginated response
      pm.test(`[${row.testCase}] Paginated items are ${matchFound ? "non-empty" : "empty"}`, () => {
        if (matchFound) {
          pm.expect(json.items.length).to.be.greaterThan(0);
        } else {
          pm.expect(json.items.length).to.eql(0);
        }
      });
      pm.test(`[${row.testCase}] Pagination metadata is present`, () => {
        pm.expect(json).to.have.property("page");
        pm.expect(json).to.have.property("pageSize");
        pm.expect(json).to.have.property("totalCount");
        pm.expect(json).to.have.property("totalPages");
      });
    } else if (json && typeof json.exists === "boolean") {
      // the two external-wallet-id endpoints
      pm.test(`[${row.testCase}] exists is ${matchFound}`, () => {
        pm.expect(json.exists).to.eql(matchFound);
      });
    } else {
      // single-profile endpoints (GkOneUserModel / GkOneUser / AzureB2CUser)
      pm.test(`[${row.testCase}] Response body is a populated profile object`, () => {
        pm.expect(json, "expected an object").to.be.an("object");
        pm.expect(Object.keys(json).length, "expected a non-empty object").to.be.greaterThan(0);
      });
    }
  } else {
    pm.test.skip(`[${row.testCase}] Result shape check`, () => {
      // No matchFound expectation set for this row — skipped
    });
  }
} else {
  pm.test(`[${row.testCase}] Error response has a message`, () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("detail");
  });

  if (expectedDetail != null) {
    pm.test(`[${row.testCase}] Error response detail matches expected`, () => {
      const json = pm.response.json();
      pm.expect(json.detail).to.eql(expectedDetail);
    });
  } else {
    pm.test.skip(`[${row.testCase}] Error response detail matches expected`, () => {
      // Skip this test if no expected detail is provided
    });
  }
}
