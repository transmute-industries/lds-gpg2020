
const { GpgLinkedDataKeyClass2020 } = require("./index");

const didDocGpgKeys = require('../docs/example/didDocGpgKeys.json')

const data = new Uint8Array([128]);

describe("GpgLinkedDataKeyClass2020", () => {
  describe("generate", () => {
    it("generate ed25519", async () => {
      let key = await GpgLinkedDataKeyClass2020.generate(
        {
          userIds: [{ name: 'Jon Smith', email: 'jon@example.com' }], // you can pass multiple user IDs
          curve: 'ed25519',                                           // ECC curve name
          // passphrase: 'super long and hard to guess secret'           // protects the private key
        },
        {
          id: "test-id",
          type: "GpgVerificationKey2020",
          controller: "did:example:123"
        }
      );
      // await key.init();
      expect(key.id).toBe("test-id");
      expect(key.type).toBe("GpgVerificationKey2020");
      expect(key.controller).toBe("did:example:123");
      expect(key.privateKeyGpg).toBeDefined();
      expect(key.publicKeyGpg).toBeDefined();
      // console.log(JSON.stringify(key, null, 2))
    });

    it("generate rsa", async () => {
      let key = await GpgLinkedDataKeyClass2020.generate(
        {
          userIds: [{ name: 'Jon Smith', email: 'jon@example.com' }], // you can pass multiple user IDs
          rsaBits: 1024,                                              // RSA key size
          passphrase: 'super long and hard to guess secret'           // protects the private key
        },
        {
          id: "test-id",
          type: "GpgVerificationKey2020",
          controller: "did:example:123"
        }
      );
      expect(key.id).toBe("test-id");
      expect(key.type).toBe("GpgVerificationKey2020");
      expect(key.controller).toBe("did:example:123");
      expect(key.privateKeyGpg).toBeDefined();
      expect(key.publicKeyGpg).toBeDefined();
    });
  })

  describe("from", () => {
    it("can import from json", async () => {
      let key = await GpgLinkedDataKeyClass2020.from(didDocGpgKeys[0])
      expect(key.id).toBe(didDocGpgKeys[0].id);
      expect(key.type).toBe("GpgVerificationKey2020");
      expect(key.controller).toBe("did:example:123");
      expect(key.privateKeyGpg).toBeDefined();
      expect(key.publicKeyGpg).toBeDefined();
    });
  })

  describe("import from json", () => {
    it("can import from json", async () => {
      let key = new GpgLinkedDataKeyClass2020(didDocGpgKeys[0])
      expect(key.id).toBe(didDocGpgKeys[0].id);
      expect(key.type).toBe("GpgVerificationKey2020");
      expect(key.controller).toBe("did:example:123");
      expect(key.privateKeyGpg).toBeDefined();
      expect(key.publicKeyGpg).toBeDefined();
    });
  })

  describe("fingerprint", () => {
    it("will calculate fingerprint when id is ommited", async () => {
      const keyAsJson = { ...didDocGpgKeys[0] }
      delete keyAsJson.id;
      let key = new GpgLinkedDataKeyClass2020(keyAsJson)
      await key.init();
      expect(key.id).toBe(didDocGpgKeys[0].id);
      expect(key.type).toBe("GpgVerificationKey2020");
      expect(key.controller).toBe("did:example:123");
      expect(key.privateKeyGpg).toBeDefined();
      expect(key.publicKeyGpg).toBeDefined();
    });

    it("will calculate fingerprint statically", async () => {
      const keyAsJson = { ...didDocGpgKeys[0] }
      let fingerprint = await GpgLinkedDataKeyClass2020.fingerprintFromPublicKey({ publicKeyGpg: keyAsJson.publicKeyGpg })
      expect(fingerprint).toBeDefined();
    });
  })

  describe("verifyFingerprint", () => {
    it("will calculate fingerprint when id is ommited", async () => {
      const keyAsJson = { ...didDocGpgKeys[0] }
      delete keyAsJson.id;
      let key = new GpgLinkedDataKeyClass2020(keyAsJson)
      await key.init();
      expect(await key.verifyFingerprint(await key.fingerprint())).toBe(true)
    });
  })

  describe("sign", () => {
    it("can sign with gpg", async () => {
      const keyAsJson = {
        ...didDocGpgKeys[0],
      }
      let key = new GpgLinkedDataKeyClass2020(keyAsJson)
      await key.init();
      const { sign } = key.signer();
      expect(typeof sign).toBe("function");
      const signature = await sign({ data });
      expect(signature.indexOf('BEGIN PGP SIGNATURE')).toBe(5)
    });
  })

  describe("verify", () => {
    it("can verify with gpg", async () => {
      const keyAsJson = {
        ...didDocGpgKeys[0],
      }
      let key = new GpgLinkedDataKeyClass2020(keyAsJson)
      await key.init();
      const { verify } = key.verifier();
      const { sign } = key.signer();
      expect(typeof sign).toBe("function");
      const signature = await sign({ data });
      expect(signature.indexOf('BEGIN PGP SIGNATURE')).toBe(5)
      expect(typeof verify).toBe("function");
      const result = await verify({
        data,
        signature
      });
      expect(result).toBe(true);
    });
  })



});
