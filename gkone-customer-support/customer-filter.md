### `{{user_profileurl.dev}}/api/v1/customers/filter`

```json
{
  "source": "GKONE",
  "lookupType": "TRN",
  "country": "string",
  "gkoNumber": "string",
  "trn": "string",
  "idDocumentType": "DRIVERS_LICENSE",
  "idDocumentNumber": "string",
  "emailAddress": "string"
}
```

#### Note the following:

- The following are the allowed look up types for the aforementioned endpoint
    
    | LOOKUP TYPES            | PROFILE FIELD             |
    | ----------------------- | ------------------------- |
    | GKO_NUMBER              | GkoNumber                 |
    | TRN                     | TRN                       |
    | ID_DOCUMENT             | DocumentId.DocumentNumber |
    | DocumentId.DocumentType |
    | EMAIL                   | Email Address             |

- Only one look up type can be specified
    - For `ID_DOCUMENT` both fields listed should be provided for that filter
    - If identifier fields for multiple lookup types are provided in the same request, the filter only uses whichever field is required by the specified `lookupType` and ignores the rest
- The following are the current list of sources:
    - **CMS**
    - **GKONE**
- If you select to search by TRN but then specify a country that does not have the identifier the filter will run but will come back empty.
- For country ISO2 is what needs to be provided [ **JM, GY, TT, KY** ]. The filter does not care if the ISO2 code is not in the list above, will just run and come back empty.
- TRN has to be 9 digits exactly, not the same for GKONumber

---

### Test Cases
```json
[
  {
    "testCase": "GKONE_GKONUMBER_valid",
    "source": "GKONE",
    "lookupType": "GKO_NUMBER",
    "gkoNumber": "GK00012345",
    "expectedStatus": 200,
    "expectEmpty": "false"
  },
  {
    "testCase": "GKONE_TRN_JM_valid",
    "source": "GKONE",
    "lookupType": "TRN",
    "country": "JM",
    "trn": "128834170",
    "expectedStatus": 200,
    "expectEmpty": "false"
  },
  {
    "testCase": "GKONE_IDDOC_valid",
    "source": "GKONE",
    "lookupType": "ID_DOCUMENT",
    "idDocumentType": "DRIVERS_LICENSE",
    "idDocumentNumber": "DL123456",
    "expectedStatus": 200,
    "expectEmpty": "false"
  },
  {
    "testCase": "GKONE_EMAIL_valid",
    "source": "GKONE",
    "lookupType": "EMAIL",
    "emailAddress": "naomi.qatesting+princess@gmail.com",
    "expectedStatus": 200,
    "expectEmpty": "false"
  },
  {
    "testCase": "CMS_TRN_JM_valid",
    "source": "CMS",
    "lookupType": "TRN",
    "country": "JM",
    "trn": "128834170",
    "expectedStatus": 200,
    "expectEmpty": "false"
  },
  {
    "testCase": "CMS_EMAIL_valid",
    "source": "CMS",
    "lookupType": "EMAIL",
    "emailAddress": "naomi.qatesting+princess@gmail.com",
    "expectedStatus": 200,
    "expectEmpty": "false"
  },
  {
    "testCase": "TRN_missing_country",
    "source": "GKONE",
    "lookupType": "TRN",
    "trn": "128834170",
    "expectedStatus": 400,
    "expectEmpty": ""
  },
  {
    "testCase": "TRN_country_no_identifier",
    "source": "GKONE",
    "lookupType": "TRN",
    "country": "KY",
    "trn": "128834170",
    "expectedStatus": 200,
    "expectEmpty": "true"
  },
  {
    "testCase": "TRN_invalid_iso2",
    "source": "GKONE",
    "lookupType": "TRN",
    "country": "ZZ",
    "trn": "128834170",
    "expectedStatus": 200,
    "expectEmpty": "true"
  },
  {
    "testCase": "TRN_not_9_digits",
    "source": "GKONE",
    "lookupType": "TRN",
    "country": "JM",
    "trn": "12345",
    "expectedStatus": 400,
    "expectEmpty": ""
  },
  {
    "testCase": "IDDOC_missing_number",
    "source": "GKONE",
    "lookupType": "ID_DOCUMENT",
    "idDocumentType": "DRIVERS_LICENSE",
    "expectedStatus": 400,
    "expectEmpty": ""
  },
  {
    "testCase": "no_lookupType_provided",
    "source": "GKONE",
    "trn": "128834170",
    "expectedStatus": 400,
    "expectEmpty": ""
  }
]
```