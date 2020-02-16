const fs = require("fs");
const path = require("path");

const jsigs = require("jsonld-signatures");

let ddo;

const {
  GpgLinkedDataKeyClass2020,
  GpgSignature2020
} = require("../");

const { documentLoader, supportedKeyTypes } = require("./__fixtures__");

const { AssertionProofPurpose } = jsigs.purposes;

const didDoc = {
  "@context": ["https://www.w3.org/ns/did/v1", 'https://transmute-industries.github.io/lds-gpg2020/contexts/lds-gpg2020-v0.0.jsonld'],
  id: "did:example:123",
  publicKey: [],
  authentication: [],
  assertionMethod: [],
  capabilityDelegation: [],
  capabilityInvocation: []
};

const didDocKeys = [];

const addKey = async (options) => {


  let key = await GpgLinkedDataKeyClass2020.generate(
    options,
    {
      type: "GpgVerificationKey2020",
      controller: "did:example:123"
    }
  );

  await key.init()

  let suite = new GpgSignature2020({
    LDKeyClass: GpgLinkedDataKeyClass2020,
    linkedDataSigantureType: "GpgSignature2020",
    linkedDataSignatureVerificationKeyType: "GpgVerificationKey2020",
    key
  });

  await jsigs.sign(didDoc, {
    compactProof: false,
    documentLoader: documentLoader,
    purpose: new AssertionProofPurpose(),
    suite
  });

  didDocKeys.push(key);
  const publicKey = { ...key };
  delete publicKey.privateKeyGpg;
  delete publicKey.passphrase;
  didDoc.publicKey.push(publicKey);
  didDoc.authentication.push(publicKey.id);
  didDoc.assertionMethod.push(publicKey.id);
  didDoc.capabilityDelegation.push(publicKey.id);
  didDoc.capabilityInvocation.push(publicKey.id);
  return key;
};

describe("generate example did document", () => {
  it("should add all supported key types", async () => {
    await Promise.all(supportedKeyTypes.map(addKey));
    fs.writeFileSync(
      path.resolve(__dirname, "../../docs/example/didDoc.json"),
      JSON.stringify(didDoc, null, 2)
    );
    fs.writeFileSync(
      path.resolve(__dirname, "../../docs/example/didDocGpgKeys.json"),
      JSON.stringify(didDocKeys, null, 2)
    );
    ddo = didDoc;
  });
});
