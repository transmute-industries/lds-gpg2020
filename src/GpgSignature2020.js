const jsonld = require("jsonld");

const {
  suites: { LinkedDataSignature }
} = require("jsonld-signatures");

class GpgSignature2020 extends LinkedDataSignature {

  /**
   * @param linkedDataSigantureType {string} The name of the signature suite.
   * @param linkedDataSignatureVerificationKeyType {string} The name verification key type for the signature suite.
   *
   * @param [LDKeyClass] {LDKeyClass} provided by subclass or subclass
   *   overrides `getVerificationMethod`.
   *
   *
   * This parameter is required for signing:
   *
   * @param [signer] {function} an optional signer.
   *
   * @param [proofSignatureKey] {string} the property in the proof that will contain the signature.
   * @param [date] {string|Date} signing date to use if not passed.
   * @param [key] {LDKeyPair} an optional crypto-ld KeyPair.
   * @param [useNativeCanonize] {boolean} true to use a native canonize
   *   algorithm.
   */
  constructor({
    linkedDataSigantureType,
    linkedDataSignatureVerificationKeyType,
    LDKeyClass,
    signer,
    key,
    proofSignatureKey,
    date,
    useNativeCanonize
  } = {}) {
    super({
      type: linkedDataSigantureType,
      LDKeyClass,
      date,
      useNativeCanonize
    });
    this.LDKeyClass = LDKeyClass;
    this.signer = signer;
    this.requiredKeyType = linkedDataSignatureVerificationKeyType;
    this.proofSignatureKey = proofSignatureKey || "signatureValue";

    if (key) {
      const publicKey = key.publicNode();
      this.verificationMethod = publicKey.id;
      this.key = key;
      if (typeof key.signer === "function") {
        this.signer = key.signer(key);
      }
      if (typeof key.verifier === "function") {
        this.verifier = key.verifier(key);
      }
    }

  }

  /**
   * @param verifyData {Uint8Array}.
   * @param proof {object}
   *
   * @returns {Promise<{object}>} the proof containing the signature value.
   */
  async sign({ verifyData, proof }) {
    if (!(this.signer && typeof this.signer.sign === "function")) {
      throw new Error("A signer API has not been specified.");
    }

    proof[this.proofSignatureKey] = await this.signer.sign({
      data: Buffer.from(verifyData)
    });
    return proof;
  }

  /**
   * @param verifyData {Uint8Array}.
   * @param verificationMethod {object}.
   * @param document {object} the document the proof applies to.
   * @param proof {object} the proof to be verified.
   * @param purpose {ProofPurpose}
   * @param documentLoader {function}
   * @param expansionMap {function}
   *
   * @returns {Promise<{boolean}>} Resolves with the verification result.
   */
  async verifySignature({ verifyData, verificationMethod, proof }) {
    let { verifier } = this;

    if (!verifier) {
      const key = await this.LDKeyClass.from(verificationMethod);
      console.log(key)
      verifier = key.verifier();
    }
    return await verifier.verify({
      data: Buffer.from(verifyData),
      signature: proof[this.proofSignatureKey]
    });
  }

  async assertVerificationMethod({ verificationMethod }) {

    if (jsonld.hasValue(verificationMethod, "type", this.requiredKeyType)) {
      return true;
    }

    if (jsonld.hasValue(verificationMethod, "type", `https://transmute-industries.github.io/lds-gpg2020/#${this.requiredKeyType}`)) {
      return true;
    }

    throw new Error(
      `Invalid key type.Key type must be "${this.requiredKeyType}".`
    );
  }

  async getVerificationMethod({ proof, documentLoader }) {
    if (this.key) {
      return this.key.publicNode();
    }

    const verificationMethod = await super.getVerificationMethod({
      proof,
      documentLoader
    });
    await this.assertVerificationMethod({ verificationMethod });
    return verificationMethod;
  }

  async matchProof({ proof, document, purpose, documentLoader, expansionMap }) {
    if (
      !(await super.matchProof({
        proof,
        document,
        purpose,
        documentLoader,
        expansionMap
      }))
    ) {
      return false;
    }
    if (!this.key) {
      // no key specified, so assume this suite matches and it can be retrieved
      return true;
    }

    let { verificationMethod } = proof;
    if (!verificationMethod) {
      verificationMethod = proof.creator;
    }
    // only match if the key specified matches the one in the proof
    if (typeof verificationMethod === "object") {
      return verificationMethod.id === this.key.id;
    }
    return verificationMethod === this.key.id;
  }
}

module.exports = GpgSignature2020;
