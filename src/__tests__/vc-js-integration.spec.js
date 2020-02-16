const jsigs = require("jsonld-signatures");
const vc = require("vc-js");
const {
  GpgLinkedDataKeyClass2020,
  GpgSignature2020
} = require("../");
const {
  documentLoader,
  doc,
  credential,
  didDocGpgKeys
} = require("./__fixtures__");
const { AssertionProofPurpose } = jsigs.purposes;

describe("integration tests", () => {
  let suite;
  let key;

  beforeAll(async () => {

    key = new GpgLinkedDataKeyClass2020({
      ...didDocGpgKeys[0]
    });
    await key.init();

    suite = new GpgSignature2020({
      LDKeyClass: GpgLinkedDataKeyClass2020,
      linkedDataSigantureType: "GpgSignature2020",
      linkedDataSignatureVerificationKeyType: "GpgVerificationKey2020",
      key
    });
  });

  describe("jsigs", () => {
    it("should work as valid signature suite for signing and verifying a document", async () => {
      // We need to do that because jsigs.sign modifies the credential... no bueno
      const signed = await jsigs.sign(
        { ...doc },
        {
          compactProof: false,
          documentLoader: documentLoader,
          purpose: new AssertionProofPurpose(),
          suite
        }
      );
      expect(signed.proof).toBeDefined();

      const result = await jsigs.verify(signed, {
        compactProof: false,
        documentLoader: documentLoader,
        purpose: new AssertionProofPurpose(),
        suite
      });

      expect(result.verified).toBeTruthy();
    });
  });

  describe("vc-js", () => {
    it("should work as valid signature suite for issuing and verifying a credential", async () => {
      const signedVC = await vc.issue({
        credential: { ...credential },
        compactProof: false,
        suite
      });
      expect(signedVC.proof).toBeDefined();

      const result = await vc.verify({
        credential: signedVC,
        compactProof: false,
        documentLoader: documentLoader,
        purpose: new AssertionProofPurpose(),
        suite
      });
      expect(result.verified).toBeTruthy();
    });
  });
});
