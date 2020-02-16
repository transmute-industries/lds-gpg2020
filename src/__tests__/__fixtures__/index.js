const documentLoader = require("./customDocumentLoader");
const supportedKeyTypes = require("./supportedKeyTypes");
const didDocGpgKeys = require("./../../../docs/example/didDocGpgKeys.json");


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

const doc = {
  "@context": [
    "https://transmute-industries.github.io/lds-gpg2020/contexts/lds-gpg2020-v0.0.jsonld",
    {
      schema: "http://schema.org/",
      name: "schema:name",
      homepage: "schema:url",
      image: "schema:image"
    }
  ],
  name: "Manu Sporny",
  homepage: "https://manu.sporny.org/",
  image: "https://manu.sporny.org/images/manu.png"
};

module.exports = {
  doc,
  supportedKeyTypes,
  documentLoader,
  didDocGpgKeys,
  credential
};
