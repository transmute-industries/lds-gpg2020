
const openpgp = require('openpgp');


class GpgLinkedDataKeyClass2020 {
  /**
   * @param {KeyPairOptions} options - The options to use.
   * @param {string} options.id - The key ID.
   * @param {string} options.controller - The key controller.
   * @param {string} options.publicKeyGpg - The ascii armored Public Key.
   * @param {string} options.privateKeyGpg - The ascii armored Private Key.
   * @param {string} options.passphrase - The private key passphrase if needed.
   * 
   */
  constructor(options = {}) {
    this.id = options.id;
    this.type = options.type;
    this.controller = options.controller;
    this.privateKeyGpg = options.privateKeyGpg;
    this.publicKeyGpg = options.publicKeyGpg;
    this.passphrase = options.passphrase;

    this.init();
  }

  async init() {
    if (this.id === undefined) {
      this.id = this.controller + "#" + await this.fingerprint();
    }
  }

  /**
   * Returns the JWK encoded public key.
   *
   * @returns {string} The JWK encoded public key.
   */
  get publicKey() {
    return this.publicKeyGpg;
  }

  /**
   * Returns the JWK encoded private key.
   *
   * @returns {string} The JWK encoded private key.
   */
  get privateKey() {
    return this.privateKeyGpg;
  }

  /**
   * Generates a KeyPair with an optional deterministic seed.
   * @param {KeyPairOptions} [options={}] - The options to use.
   *
   * @returns {Promise<GpgLinkedDataKeyClass2020>} Generates a key pair.
   */
  static async generate({ userIds, curve, rsaBits, passphrase }, options = {}) {
    // let key = jose.JWK.generateSync(kty, crv);

    if (curve) {
      const { privateKeyArmored, publicKeyArmored, revocationCertificate } = await openpgp.generateKey({
        userIds,    // you can pass multiple user IDs
        curve,      // ECC curve name
        passphrase  // protects the private key
      });

      return new GpgLinkedDataKeyClass2020({
        privateKeyGpg: privateKeyArmored,
        publicKeyGpg: publicKeyArmored,
        revocationCertificate,
        ...options
      });
    }

    if (rsaBits) {
      const { privateKeyArmored, publicKeyArmored, revocationCertificate } = await openpgp.generateKey({
        userIds,    // you can pass multiple user IDs
        rsaBits,    // RSA key size
        passphrase  // protects the private key
      });

      return new GpgLinkedDataKeyClass2020({
        privateKeyGpg: privateKeyArmored,
        publicKeyGpg: publicKeyArmored,
        revocationCertificate,
        ...options
      });
    }




  }

  /**
   * Returns a signer object for use with jsonld-signatures.
   *
   * @returns {{sign: Function}} A signer for the json-ld block.
   */
  signer() {
    return signerFactory(this);
  }

  /**
   * Returns a verifier object for use with jsonld-signatures.
   *
   * @returns {{verify: Function}} Used to verify jsonld-signatures.
   */
  verifier(key) {
    return verifierFactory(this);
  }

  /**
   * Adds a public key base to a public key node.
   *
   * @param {Object} publicKeyNode - The public key node in a jsonld-signature.
   * @param {string} publicKeyNode.publicKeyGpg - JWK Public Key for
   *   jsonld-signatures.
   *
   * @returns {Object} A PublicKeyNode in a block.
   */
  addEncodedPublicKey(publicKeyNode) {
    publicKeyNode.publicKeyGpg = this.publicKeyGpg;
    return publicKeyNode;
  }

  /**
   * Generates and returns a public key fingerprint using https://tools.ietf.org/html/rfc7638
   *
   * @param {string} publicKeyGpg - The ascii armor encoded public key material.
   *
   * @returns {string} The fingerprint.
   */
  static async fingerprintFromPublicKey({ publicKeyGpg }) {
    const { keys: [publicKey] } = await openpgp.key.readArmored(publicKeyGpg);
    return publicKey.getFingerprint()
  }

  /**
   * Generates and returns a public key fingerprint using https://tools.ietf.org/html/rfc7638
   *
   * @returns {string} The fingerprint.
   */
  async fingerprint() {
    const { keys: [publicKey] } = await openpgp.key.readArmored(this.publicKeyGpg);
    return publicKey.getFingerprint()
  }

  /**
   * Tests whether the fingerprint was generated from a given key pair.
   *
   * @param {string} fingerprint - A JWK public key.
   *
   * @returns {Object} An object indicating valid is true or false.
   */
  async verifyFingerprint(fingerprint) {
    const fingerprintFromKey = await this.fingerprint()
    return fingerprintFromKey === fingerprint;
  }

  static async from(options) {
    return new GpgLinkedDataKeyClass2020(options);
  }

  /**
   * Contains the public key for the KeyPair
   * and other information that json-ld Signatures can use to form a proof.
   * @param {Object} [options={}] - Needs either a controller or owner.
   * @param {string} [options.controller=this.controller]  - DID of the
   * person/entity controlling this key pair.
   *
   * @returns {Object} A public node with
   * information used in verification methods by signatures.
   */
  publicNode({ controller = this.controller } = {}) {
    const publicNode = {
      id: this.id,
      type: this.type
    };
    if (controller) {
      publicNode.controller = controller;
    }
    this.addEncodedPublicKey(publicNode); // Subclass-specific
    return publicNode;
  }
}

/**
 * @ignore
 * Returns an object with an async sign function.
 * The sign function is bound to the KeyPair
 * and then returned by the KeyPair's signer method.
 * @param {GpgLinkedDataKeyClass2020} key - An GpgLinkedDataKeyClass2020.
 *
 * @returns {{sign: Function}} An object with an async function sign
 * using the private key passed in.
 */
function signerFactory(key) {
  if (!key.privateKeyGpg) {
    return {
      async sign() {
        throw new Error("No private key to sign with.");
      }
    };
  }

  return {
    async sign({ data }) {
      const { keys: [privateKey] } = await openpgp.key.readArmored(key.privateKeyGpg);
      if (key.passphrase) {
        await privateKey.decrypt(this.passphrase);
      }
      const { signature: detachedSignature } = await openpgp.sign({
        message: openpgp.message.fromBinary(
          Buffer.from(data)
        ),
        privateKeys: [privateKey],
        detached: true
      });

      return detachedSignature;
    }
  };
}

/**
 * @ignore
 * Returns an object with an async verify function.
 * The verify function is bound to the KeyPair
 * and then returned by the KeyPair's verifier method.
 * @param {GpgLinkedDataKeyClass2020} key - An GpgLinkedDataKeyClass2020.
 *
 * @returns {{verify: Function}} An async verifier specific
 * to the key passed in.
 */
verifierFactory = key => {
  if (!key.publicKeyGpg) {
    return {
      async sign() {
        throw new Error("No public key to verify with.");
      }
    };
  }

  return {
    async verify({ data, signature }) {
      const { signatures } = await openpgp.verify({
        message: openpgp.message.fromBinary(
          Buffer.from(data)
        ),
        signature: await openpgp.signature.readArmored(signature), // parse detached signature
        publicKeys: (await openpgp.key.readArmored(key.publicKeyGpg)).keys // for verification
      });
      const { valid } = signatures[0];
      return valid;

    }
  };
};

module.exports = GpgLinkedDataKeyClass2020;
