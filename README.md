# Linked Data Signatures for GPG

[View On Github](https://github.com/transmute-industries/lds-gpg2020)

## Security Considerations

### Supported GPG Keys

ed25519, secp256k1, rsa, p256, p384, p521

You should be aware that some of the crypto supported by GPG may not be considered safe:

- https://safecurves.cr.yp.to/

If you will only ever need to support Ed25519 or only Secp256k1, you should consider using a restricted Linked Data Signature Suite like:

- [Ed25519Signature2018](https://github.com/digitalbazaar/jsonld-signatures/blob/master/lib/suites/Ed25519Signature2018.js)

- [EcdsaSecp256k1Signature2019](https://github.com/decentralized-identity/lds-ecdsa-secp256k1-2019.js)

## Getting Started

```
npm i
npm run test
npm run coverage
npm run docs
```

## CLI Usage

Normal

```
npm i @transmute/lds-gpg2020 -g
gpg2020 sign -u "3BCAC9A882DEFE703FD52079E9CB06E71794A713" $(pwd)/docs/example/doc.json did:btcr:xxcl-lzpq-q83a-0d5#yubikey
```

Helpful Testing Commands

```
npm run gpg2020 -- import-gpg-keys-from-json $(pwd)/docs/example/key.json

VERIFICATION_METHOD=$(cat $(pwd)/docs/example/key.json | jq '.id')
npm run gpg2020 -- sign -u "114FAE6216DE45B78A611D22227982B2ECAFBD45" $(pwd)/docs/example/doc.json $VERIFICATION_METHOD -o $(pwd)/docs/example/doc.signed.json
npm run gpg2020 -- verify $(pwd)/docs/example/doc.signed.json

npm run gpg2020 -- sign -u "FDDB584BDF141F95" $(pwd)/docs/example/doc.json did:example:123#yolo -o $(pwd)/docs/example/doc.signed.json

gpg --armor --output public-key.gpg --export james@example.com
npm run gpg2020 -- make-json-key ./public-key.gpg did:btcr:xxcl-lzpq-q83a-0d5


npm run gpg2020 -- resolve did:web:did.or13.io

npm run gpg2020 -- sign -u "20A968A458342F6B1A822C5BFDDB584BDF141F95" $(pwd)/docs/example/doc.json  did:web:did.or13.io#20a968a458342f6b1a822c5bfddb584bdf141f95 -o $(pwd)/docs/example/doc.signed.yubikey.json

npm run gpg2020 -- verify $(pwd)/docs/example/doc.signed.yubikey.json

```


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

## Yubikey

Build Form Source:

- [yubico-c](https://developers.yubico.com/yubico-c/)
- [yubikey-personalization](https://developers.yubico.com/yubikey-personalization/)
- [Resetting a Yubikey](https://support.yubico.com/support/solutions/articles/15000006421-resetting-the-openpgp-applet-on-the-yubikey)

Connect Yubikey

See [Generating a key on yubikey](https://support.yubico.com/support/solutions/articles/15000006420-using-your-yubikey-with-openpgp#Generating_Your_PGP_Key_Directly_on_Your_YubiKeyttvb3m)

```
gpg-connect-agent --hex "scd apdu 00 f1 00 00" /bye
gpg --card-edit
generate
```

Follow instructions:

Make sure to choose to export your keys, you will not be able to access them again if you do not.

At the end you should see:

```
gpg: Note: backup of card key saved to '/Users/USER/.gnupg/sk_3AF00854CF8D9237.gpg'
gpg: revocation certificate stored as '/Users/USER/.gnupg/openpgp-revocs.d/F1BD12F71206FAA1F236997D60042D876C326166.rev'
public and secret key created and signed.
```

Show the keys on the card:

```
list
```

Export a public key:

```
gpg --armor --export james@example.com

```

Encrypt and decrypt:

```
echo "test message string" | gpg --encrypt --armor -u 3AF00854CF8D9237 --recipient 3AF00854CF8D9237 -o encrypted.txt

gpg --decrypt --armor encrypted.txt
```

Sign and Verify:

```
echo "test message string" | gpg --sign --armor -u 3AF00854CF8D9237  -o signed.txt
cat signed.txt | gpg --verify --armor
```

## Credits and Support

Works with:

- [openpgpjs](https://github.com/openpgpjs/openpgpjs)
- [universal-resolver](https://github.com/decentralized-identity/universal-resolver)
- [jsonld-signatures](https://github.com/digitalbazaar/jsonld-signatures)
- [vc-js](https://github.com/digitalbazaar/vc-js)

