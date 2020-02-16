const fs = require("fs");
const path = require("path");
const jsonld = require("jsonld");
const resolver = require('../../../bin/resolver')
const contexts = {
  "https://www.w3.org/ns/did/v1": require("./contexts/did-core-v1.json"),
  "https://transmute-industries.github.io/lds-gpg2020/contexts/lds-gpg2020-v0.0.jsonld": JSON.parse(
    fs
      .readFileSync(
        path.resolve(
          __dirname,
          "../../../docs/contexts/lds-gpg2020-v0.0.jsonld"
        )
      )
      .toString()
  )
};

const customLoader = async (url) => {
  const context = contexts[url];

  if (context) {
    return {
      contextUrl: null, // this is for a context via a link header
      document: context, // this is the actual document that was loaded
      documentUrl: url // this is the actual context URL after redirects
    };
  }

  if (url.indexOf("did:example:123") !== -1) {
    return {
      contextUrl: null, // this is for a context via a link header
      document: require("../../../docs/example/didDoc.json"), // this is the actual document that was loaded
      documentUrl: url // this is the actual context URL after redirects
    };
  }

  if (url.indexOf("did:") !== -1) {
    const didDocument = await resolver.resolve(url);
    return {
      contextUrl: null, // this is for a context via a link header
      document: didDocument, // this is the actual document that was loaded
      documentUrl: url // this is the actual context URL after redirects
    };
  }

  return jsonld.documentLoaders.node()(url);
};

module.exports = customLoader;
