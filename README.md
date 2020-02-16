# Linked Data Signatures for GPG

[View On Github](https://github.com/transmute-industries/lds-gpg2020)

## Security Considerations

You should be aware that some of the crypto supported by GPG may not be considered safe:

- https://safecurves.cr.yp.to/

If you will only ever need to support Ed25519 or only Secp256k1, you should consider using a restricted Linked Data Signature Suite like:

- [Ed25519Signature2018](https://github.com/digitalbazaar/jsonld-signatures/blob/master/lib/suites/Ed25519Signature2018.js)

- [EcdsaSecp256k1Signature2019](https://github.com/decentralized-identity/lds-ecdsa-secp256k1-2019.js)

## Supported GPG Keys

ed25519, secp256k1, rsa, p256, p384, p521


### About Linked Data Signatures

A JSON-LD Signature has a verification key type, and a signature/proof type for example:

- `GpgVerificationKey2020`
- `GpgSignature2020`

This library makes working with Linked Data Signatures trivial for developers familar with JWS.

- [example keystore](./example/didDocGpgKeys.json).

- [example did doc](./example/didDoc.json)

You must provide both a json-ld context, and human readable documentation for every property you create for your signature suite.

In this case, we define these verification key and proof formats, as well as the `publicKeyGpg` property.

You can read the documentation here:

[https://transmute-industries.github.io/lds-gpg2020/](https://transmute-industries.github.io/lds-gpg2020/)

And the context:

[https://transmute-industries.github.io/lds-gpg2020/contexts/lds-gpg2020-v0.0.jsonld](https://transmute-industries.github.io/lds-gpg2020/contexts/lds-gpg2020-v0.0.jsonld)

You MUST always version context files, and MUST ensure they remain resolvable at their published path once they are in use.

Failure to do so is similar to not maintaining an npm module, or unpublishing a module that may be used by others. If you are not sure if you can maintain a JSON-LD context, its best that you not create one, or rely on github / community structures to ensure that the context can easily be updated.

## Getting Started

```
npm i
npm run test
npm run coverage
npm run docs
```

Built on top of: [https://github.com/openpgpjs/openpgpjs](https://github.com/openpgpjs/openpgpjs)

Works with: [https://github.com/digitalbazaar/jsonld-signatures](https://github.com/digitalbazaar/jsonld-signatures)
