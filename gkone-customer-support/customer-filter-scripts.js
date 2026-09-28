//Pre-req
const row = pm.iterationData.toObject(); 
const localPart = "a".repeat(64);
const domain = "b".repeat(63) + "." + "c".repeat(63) + "." + "d".repeat(57) + ".com";
const email254 = `${localPart}@${domain}`;
const email255 = `${localPart}5@${domain}`;

const body = {
  source: row.source,
  type: row.lookupType,
  country: row.country,
  gkoNumber: row.gkoNumber,
  trn: row.trn,
  idDocumentType: row.idDocumentType,
  idDocumentNumber: row.idDocumentNumber,
  emailAddress: row.emailAddress
};


Object.keys(body).forEach(key => {
  if (body[key] === undefined || body[key] === "" || body[key] === null) delete body[key];
});

pm.variables.set("requestBody", JSON.stringify(body));
pm.variables.set("email254", email254);
pm.variables.set("email255", email255);

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

  const canCheckFilters = !shouldBeEmpty;

  if (canCheckFilters && row.source) {
    pm.test(`[${row.testCase}] Results match the requested source`, () => {
      results.forEach(r => pm.expect(r.source).to.eql(row.source));
    });
  } else if (row.source) {
    pm.test.skip(`[${row.testCase}] Results match the requested source`, () => {
      // Skip this test when no results are expected
    });
  }

  const isActiveField = (lookupTypes) => lookupTypes.includes(row.lookupType);

  if (canCheckFilters && row.gkoNumber && isActiveField(["GKO_NUMBER"])) {
    pm.test(`[${row.testCase}] Results match the requested gkoNumber`, () => {
      results.forEach(r => pm.expect(r.gkoNumber).to.eql(row.gkoNumber));
    });
  } else if (row.gkoNumber && isActiveField(["GKO_NUMBER"])) {
    pm.test.skip(`[${row.testCase}] Results match the requested gkoNumber`, () => {
      // Skip this test when no results are expected
    });
  }

  if (canCheckFilters && row.trn && isActiveField(["TRN"])) {
    pm.test(`[${row.testCase}] Results match the requested trn`, () => {
      results.forEach(r => pm.expect(r.trn).to.eql(row.trn));
    });
  } else if (row.trn && isActiveField(["TRN"])) {
    pm.test.skip(`[${row.testCase}] Results match the requested trn`, () => {
      // Skip this test when no results are expected
    });
  }

  if (canCheckFilters && row.country && isActiveField(["TRN", "EMAIL"])) {
    pm.test(`[${row.testCase}] Results match the requested country`, () => {
      results.forEach(r => pm.expect(r.territory).to.eql(row.country));
    });
  } else if (row.country && isActiveField(["TRN", "EMAIL"])) {
    pm.test.skip(`[${row.testCase}] Results match the requested country`, () => {
      // Skip this test when no results are expected
    });
  }

  if (canCheckFilters && row.emailAddress && isActiveField(["EMAIL"])) {
    pm.test(`[${row.testCase}] Results match the requested emailAddress`, () => {
      results.forEach(r => pm.expect(r.emailAddress).to.eql(row.emailAddress));
    });
  } else if (row.emailAddress && isActiveField(["EMAIL"])) {
    pm.test.skip(`[${row.testCase}] Results match the requested emailAddress`, () => {
      // Skip this test when no results are expected
    });
  }

  if (canCheckFilters && row.idDocumentType && row.idDocumentNumber && isActiveField(["ID_DOCUMENT"])) {
    pm.test(`[${row.testCase}] Results contain the requested ID document`, () => {
      results.forEach(r => {
        const match = (r.idDocuments || []).some(
          doc => doc.documentType === row.idDocumentType && doc.documentNumber === row.idDocumentNumber
        );
        pm.expect(match, `Result is missing expected document ${row.idDocumentType} ${row.idDocumentNumber}`).to.be.true;
      });
    });
  } else if (row.idDocumentType && row.idDocumentNumber && isActiveField(["ID_DOCUMENT"])) {
    pm.test.skip(`[${row.testCase}] Results contain the requested ID document`, () => {
      // Skip this test when no results are expected
    });
  }
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