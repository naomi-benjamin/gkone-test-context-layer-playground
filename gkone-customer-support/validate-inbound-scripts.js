//pre-req

const row = pm.iterationData.toObject();

const body = {
  source: row.source,
  type: row.lookupType,
  relationship: row.relationship,
  purposeOfTransaction: row.purposeOfTransaction,
  country: row.country,
  gkoNumber: row.gkoNumber,
  trn: row.trn,
  idDocumentType: row.idDocumentType,
  idDocumentNumber: row.idDocumentNumber,
  emailAddress: row.emailAddress
};
if (body.trn !== undefined && body.trn !== null) {
  body.trn = String(body.trn);
}


Object.keys(body).forEach(key => {
  if (body[key] === undefined || body[key] === "" || body[key] === null) delete body[key];
});

pm.variables.set("requestBody", JSON.stringify(body));
pm.variables.set("mtcn", String(row.mtcn));

//post-res
const row = pm.iterationData.toObject();
const expectedStatus = Number(row.expectedStatus);
const expectedDetail = (row.expectedDetail === undefined || row.expectedDetail === null || row.expectedDetail === "")
  ? null
  : String(row.expectedDetail);

pm.test(`[${row.testCase}] Status code is ${expectedStatus}`, () => {
  pm.response.to.have.status(expectedStatus);
});

if (expectedStatus === 200) {
  const json = pm.response.json();
  const results = Array.isArray(json) ? json : (json.results || json.data || []);
  const shouldBeEmpty = row.expectEmpty === "true";

  pm.test(`[${row.testCase}] Result set is ${shouldBeEmpty ? "empty" : "non-empty"}`, () => {
    if (shouldBeEmpty) {
      pm.expect(results.length).to.eql(0);
    } else {
      pm.expect(results.length).to.be.greaterThan(0);
    }
  });
} else {
    pm.test(`[${row.testCase}] Error response has a message`, () => {
        const json = pm.response.json();
        pm.expect(json).to.have.property("detail");
    });

    if (expectedDetail != null){
        pm.test(`[${row.testCase}] Error response detail matches expected`, () => {
            const json = pm.response.json();
            pm.expect(json.detail).to.eql(expectedDetail);
        });
    } else {
        pm.test.skip(`[${row.testCase}] Error response detail matches expected`, () => {
            // Skip this test if no expected detail is provided
        })
    }
}