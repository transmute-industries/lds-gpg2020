#### [View on GitHub](https://github.com/transmute-industries/lds-gpg2020)

> JSON-LD 1.1 is being formally specified in the W3C JSON-LD Working Group. To participate in this work, please join the W3C and then [join the Working Group](https://www.w3.org/2018/json-ld-wg/).

You can use this repo as a guide for extending contexts, and ensuring that your JSON-LD is functioning as expected and fully documented. This should help you make the case that your extensions should be included, or eliminate the need for them to be included.

- [Latest JSON-LD Context](./contexts/lds-gpg2020-v0.0.jsonld)

### Terminology

<h4 id="publicKeyGpg"><a href="#publicKeyGpg">publicKeyGpg</a></h4>

A public key in ascii armored format. Read [rfc4880](https://tools.ietf.org/html/rfc4880).

#### Example:

```
-----BEGIN PGP PUBLIC KEY BLOCK-----

mQENBF5JeqoBCACyxTKPm7u+IbyBzD4ViKAh73RdnRk6PDCt0UNiwcWedV6SWs4I
+zizXHVzpu8R6/V5k+hES7TpGScrrX16RtqCLU36hm1UJ3yaS3NJTPCRzUIPTCX8
...
O9A9USJ+SMZttYBw+rLC/QXhNl1FtiQwg2g4tV84NxJtJdOoaxPhP6fuMMjtQ9vL
0hj6/7z2caeNHxbdFsq6JxLgOqc8Lf5s+hvAUs+ERIu/vF8=
=1LBV
-----END PGP PUBLIC KEY BLOCK-----
```

<h4 id="GpgVerificationKey2020"><a href="#GpgVerificationKey2020">GpgVerificationKey2020</a></h4>

The verification key type for `GpgSignature2020`. The key must have a property `publicKeyGpg` and its value must be a valid JWK.

#### Example:

```json
[
  {
    "@context": "https://transmute-industries.github.io/lds-gpg2020/contexts/lds-gpg2020-v0.0.jsonld",
    "id": "did:btcr:xxcl-lzpq-q83a-0d5#20a968a458342f6b1a822c5bfddb584bdf141f95",
    "type": "GpgVerificationKey2020",
    "controller": "did:btcr:xxcl-lzpq-q83a-0d5",
    "publicKeyGpg": "-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQEN....vF8=\n=1LBV\n-----END PGP PUBLIC KEY BLOCK-----\n"
  }
]
```

<h4 id="GpgSignature2020"><a href="#GpgSignature2020">GpgSignature2020</a></h4>

A JSON-LD Document has been signed with GpgSignature2020,
when it contains a proof field with type `GpgSignature2020`. The proof must contain a key `signatureValue` with value defined by the signing algorithm described here.

#### Example:

```json
{
  "@context": [
    "https://transmute-industries.github.io/lds-gpg2020/contexts/lds-gpg2020-v0.0.jsonld",
    {
      "schema": "http://schema.org/",
      "name": "schema:name",
      "homepage": "schema:url",
      "image": "schema:image"
    }
  ],
  "name": "Manu Sporny",
  "homepage": "https://manu.sporny.org/",
  "image": "https://manu.sporny.org/images/manu.png",
  "proof": {
    "type": "GpgSignature2020",
    "created": "2020-02-16T18:21:26Z",
    "verificationMethod": "did:web:did.or13.io#20a968a458342f6b1a822c5bfddb584bdf141f95",
    "proofPurpose": "assertionMethod",
    "signatureValue": "-----BEGIN PGP SIGNATURE-----\n\niQEzBAABCAAdFiEEIKlopFg0L2sagixb/dtYS98UH5UFAl5JiCYACgkQ/dtYS98U\nH5U8TQf/WS92hXkdkdBQ0xJcaSkoTsGspshZ+lT98N2Dqu6I1Q01VKm+UMniv5s/\n3z4VX83KuO5xtepFjs4S95S4gLmr227H7veUdlmPrQtkGpvRG0Ks5mX7tPmJo2TN\nDwm1imm+zvJ+MXr3Ld24qaRJA9dI+AoZ5HXqNp96Yncj3oWD+DtVIZmC/ZiUw43a\nLpMYy94Hie7Ad86hEoqsdRxrwq7O6KZ29TAKi5T/taemayyXY7papU28mGjVEcvO\na7M3XNBflMcMEB+g6gjrANsgFNO6tOuvOQ2+4v6yMfpJ0ji4ta7q2d4QKqGi5YhE\nsRUORN+7HJrkmSTaT7gBpFQ+YUnyLA==\n=Uzp1\n-----END PGP SIGNATURE-----\n"
  }
}
```
