const documentLoader = require("./customDocumentLoader");
const supportedKeyTypes = require("./supportedKeyTypes");
const didDocGpgKeys = require("./../../../docs/example/didDocGpgKeys.json");
const doc = require('../../../docs/example/doc.json')


const credential = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1"
  ],
  id: "https://example.com/credentials/1872",
  type: ["VerifiableCredential", "AlumniCredential"],
  issuer: "did:example:123",
  issuanceDate: "2010-01-01T19:23:24Z",
  credentialSubject: {
    id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
    alumniOf: "Example University"
  }
};

module.exports = {
  doc,
  supportedKeyTypes,
  documentLoader,
  didDocGpgKeys,
  credential
};
