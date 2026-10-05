const row = pm.iterationData.toObject();
const expectedStatus = Number(row.expectedStatus);
const expectedDetail = (row.expectedDetail === undefined || row.expectedDetail === null || row.expectedDetail === "")
  ? null
  : String(row.expectedDetail);

const parseIfString = (value) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
};

pm.test(`[${row.testCase}] Status code is ${expectedStatus}`, () => {
  pm.response.to.have.status(expectedStatus);
});

if (expectedStatus === 200) {
  const json = pm.response.json();
  const results = json.data || [];
  const shouldBeEmpty = row.expectEmpty === "true";

  pm.test(`[${row.testCase}] Result set is ${shouldBeEmpty ? "empty" : "non-empty"}`, () => {
    if (shouldBeEmpty) {
      pm.expect(results.length).to.eql(0);
    } else {
      pm.expect(results.length).to.be.greaterThan(0);
    }
  });

  const canCheckFilters = !shouldBeEmpty;

  const requestedReferences = parseIfString(row.references);
    if (canCheckFilters && Array.isArray(requestedReferences) && requestedReferences.length > 0) {
    pm.test(`[${row.testCase}] A step in the journey contains the requested reference(s)`, () => {
        results.forEach(r => {
        const allRefs = [
            ...(r.references || []),
            ...((r.journey?.steps || []).flatMap(s => s.references || []))
        ];
        requestedReferences.forEach(reqRef => {
            const match = allRefs.some(
            ref => String(ref.key).toLowerCase() === String(reqRef.key).toLowerCase() && ref.value === reqRef.value
            );
            pm.expect(match, `Missing reference ${reqRef.key}:${reqRef.value}`).to.be.true;
        });
        });
    });
    }


  const requestedJourneyTypes = parseIfString(row.journeyTypes);
  if (canCheckFilters && Array.isArray(requestedJourneyTypes) && requestedJourneyTypes.length > 0) {
    pm.test(`[${row.testCase}] Results have the requested journeyType`, () => {
      results.forEach(r => {
        pm.expect(requestedJourneyTypes).to.include(r.journey?.journeyType);
      });
    });
  }

  const requestedStatuses = parseIfString(row.statuses);
  if (canCheckFilters && Array.isArray(requestedStatuses) && requestedStatuses.length > 0) {
    const normalizedStatuses = requestedStatuses.map(s => String(s).trim().toUpperCase());
    pm.test(`[${row.testCase}] Results have the requested rolled-up status`, () => {
      results.forEach(r => {
        pm.expect(normalizedStatuses).to.include(r.status?.current);
      });
    });
  }

  if (canCheckFilters && row.expectedPaymentOutcome) {
    pm.test(`[${row.testCase}] status.payment.outcome matches expected`, () => {
      results.forEach(r => {
        pm.expect(r.status?.payment?.outcome).to.eql(row.expectedPaymentOutcome);
      });
    });
  } else if (canCheckFilters) {
    pm.test.skip(`[${row.testCase}] status.payment.outcome matches expected`, () => {
      // Skip when no expectedPaymentOutcome is provided for this row
    });
  }

  if (canCheckFilters && row.expectedDeliveryOutcome) {
    pm.test(`[${row.testCase}] status.delivery.outcome matches expected`, () => {
      results.forEach(r => {
        pm.expect(r.status?.delivery?.outcome).to.eql(row.expectedDeliveryOutcome);
      });
    });
  } else if (canCheckFilters) {
    pm.test.skip(`[${row.testCase}] status.delivery.outcome matches expected`, () => {
      // Skip when no expectedDeliveryOutcome is provided for this row
    });
  }

  const expectedRelatedJourneys = parseIfString(row.expectedRelatedJourneys);
  if (canCheckFilters && Array.isArray(expectedRelatedJourneys) && expectedRelatedJourneys.length > 0) {
    pm.test(`[${row.testCase}] relatedJourneys contains the expected relation(s)`, () => {
      results.forEach(r => {
        const actualRelated = r.journey?.relatedJourneys || [];
        expectedRelatedJourneys.forEach(expected => {
          const match = actualRelated.some(
            rel => rel.relation === expected.relation && rel.journeyType === expected.journeyType
          );
          pm.expect(match, `Missing related journey ${expected.relation}:${expected.journeyType}`).to.be.true;
        });
      });
    });
  } else if (canCheckFilters && Array.isArray(expectedRelatedJourneys)) {
    pm.test(`[${row.testCase}] relatedJourneys is empty`, () => {
      results.forEach(r => {
        const actualRelated = r.journey?.relatedJourneys || [];
        pm.expect(actualRelated.length, `Expected relatedJourneys to be empty but found ${actualRelated.length} entries`).to.eql(0);
      });
    });
  } else if (canCheckFilters) {
    pm.test.skip(`[${row.testCase}] relatedJourneys matches expected`, () => {
      // Skip when no expectedRelatedJourneys is provided for this row (null = untested, not an assertion either way)
    });
  }

  const expectedTags = parseIfString(row.expectedTags);
  if (canCheckFilters && Array.isArray(expectedTags) && expectedTags.length > 0) {
    pm.test(`[${row.testCase}] tags[] exactly matches expectedTags`, () => {
      results.forEach(r => {
        const actualSorted = [...(r.tags || [])].sort();
        const expectedSorted = [...expectedTags].sort();
        pm.expect(actualSorted).to.eql(expectedSorted);
      });
    });
  } else if (canCheckFilters) {
    pm.test.skip(`[${row.testCase}] tags[] exactly matches expectedTags`, () => {
      // Skip when no expectedTags is provided for this row
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
