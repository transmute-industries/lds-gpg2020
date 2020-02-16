#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const shell = require("shelljs");
const vorpal = require("vorpal")();
const resolver = require('./resolver')
const jsigs = require("jsonld-signatures");
const { AssertionProofPurpose } = jsigs.purposes;



const { version } = require("../package.json");

const {
  documentLoader,
} = require("../src/__tests__/__fixtures__");

const { GpgSignature2020, GpgLinkedDataKeyClass2020 } = require("../src");

vorpal.wait = seconds =>
  new Promise(resolve => {
    setTimeout(resolve, seconds * 1000);
  });

vorpal.command("version", "display version").action(async () => {
  // eslint-disable-next-line
  console.log(
    JSON.stringify(
      {
        "@transmute/lds-gpg2020": version
      },
      null,
      2
    )
  );
  return vorpal.wait(1);
});

vorpal.command("resolve <did>", "resolve a did").action(async (args) => {
  let didDocument = await resolver.resolve(args.did)
  // eslint-disable-next-line
  console.log(
    JSON.stringify(didDocument, null, 2)
  );
  return vorpal.wait(1);
});


vorpal.command("make-json-key <inputFilePath> <controller>", "convert a public gpg key to json").action(async (args) => {

  const publicKeyString = fs.readFileSync(args.inputFilePath).toString("utf-8");
  const verificationMethod = {
    // id: args.publicKeyId,
    type: 'GpgVerificationKey2020',
    controller: args.controller,
    publicKeyGpg: publicKeyString,
  }

  const key = new GpgLinkedDataKeyClass2020(verificationMethod)
  await key.init()

  // eslint-disable-next-line
  console.log(
    JSON.stringify(key, null, 2)
  );
  return vorpal.wait(1);
});

vorpal.command("import-gpg-keys-from-json <inputFilePath>", "imports gpg keys from a json object").action(async (args) => {

  const fileJson = fs.readFileSync(args.inputFilePath).toString("utf-8");
  let parsedInputFile;
  try {
    parsedInputFile = JSON.parse(fileJson);
  } catch (e) {
    throw new Error("Could not parse inputFilePath as JSON.");
  }

  const command = `
  echo "${parsedInputFile.publicKeyGpg}" | gpg --import;
  echo "${parsedInputFile.privateKeyGpg}" | gpg --import;
`;

  const result = shell.exec(command, { silent: true });

  // console.log(result.stdout)

  return vorpal.wait(1);
});

vorpal
  .command("sign <inputFilePath> <verificationMethod>", "Sign file")

  .option(
    "-u, --local-user <key>",
    "Use name as the key to sign with. Note that this option overrides --default-key."
  )
  .option("-o, --output <outputFilePath>", "Write output to file")
  .option("-p, --purpose <proofPurpose>", "Purpose of signature")
  .option("-c, --created <created>", "Created date as iso string")

  .action(async args => {

    // set defaults properly
    args.options.created = args.options.created || new Date().toISOString();
    args.options.purpose = args.options.purpose || "assertionMethod";

    const fileJson = fs.readFileSync(args.inputFilePath).toString("utf-8");
    let parsedInputFile;
    try {
      parsedInputFile = JSON.parse(fileJson);
    } catch (e) {
      throw new Error("Could not parse inputFilePath as JSON.");
    }

    const sign = ({
      data
    }) => {
      fs.writeFileSync('data.dat', data);

      const keyName = args.options["local-user"]
        ? `-u ${args.options["local-user"]}`
        : `--default-key`;

      const signDetachedCommand = `
         gpg --detach-sign --armor ${keyName} ./data.dat
      `;

      shell.exec(signDetachedCommand, { silent: true });
      const signatureValue = fs.readFileSync('data.dat.asc').toString();

      fs.unlinkSync('data.dat')
      fs.unlinkSync('data.dat.asc')
      return signatureValue;
    }

    // console.log(args)

    const verificationMethod = {
      id: args.verificationMethod,
      controller: args.verificationMethod.split('#')[0],
      type: "GpgVerificationKey2020",
    }

    const key = new GpgLinkedDataKeyClass2020(verificationMethod)
    key.signer = () => {
      return {
        sign
      }
    };
    // console.log(key)
    const suite = new GpgSignature2020({
      LDKeyClass: GpgLinkedDataKeyClass2020,
      linkedDataSigantureType: "GpgSignature2020",
      linkedDataSignatureVerificationKeyType: "GpgVerificationKey2020",
      key
    });

    const signed = await jsigs.sign(
      parsedInputFile,
      {
        compactProof: false,
        documentLoader: documentLoader,
        purpose: new AssertionProofPurpose(),
        suite
      }
    );

    const signedDocument = JSON.stringify(signed, null, 2);
    console.log(signedDocument);
    if (args.options.output) {
      fs.writeFileSync(args.options.output, signedDocument);
    }
    return vorpal.wait(1);
  });

vorpal
  .command("verify <inputFilePath>", "Verify file")

  .action(async args => {
    const fileJson = fs.readFileSync(args.inputFilePath).toString("utf-8");
    let parsedInputFile;
    try {
      parsedInputFile = JSON.parse(fileJson);
    } catch (e) {
      throw new Error("Could not parse inputFilePath as JSON.");
    }

    // // The following code will verify the signature assuming you have imported the key
    // // listed in verificationMethod to GPG.
    // // const {
    // //   framed,
    // //   verifyDataHexString
    // // } = await OpenPgpSignature2019.createVerifyData(
    // //   parsedInputFile,
    // //   parsedInputFile.proof
    // // );
    // // const verifyWithGPGCommand = `
    // // tmpFile=$(mktemp /tmp/openpgp-signature-2019-verifyData.XXXXXX)
    // // tmpSig=$(mktemp /tmp/openpgp-signature-2019-sig.XXXXXX)
    // // echo "${verifyDataHexString}" > "$tmpFile"
    // // echo "${parsedInputFile.proof.signatureValue}" > "$tmpSig"
    // // gpg --verify --armor "$tmpSig" "$tmpFile"
    // // rm "$tmpFile"
    // // rm "$tmpSig"
    // // `;
    // // const result = shell.exec(verifyWithGPGCommand, { silent: true });
    // // console.log(result.stdout);
    // // console.log(result.stderr);

    const { document } = await documentLoader(parsedInputFile.proof.verificationMethod)
    const verificationMethod = document.publicKey.find((k) => {
      return k.id === parsedInputFile.proof.verificationMethod;
    })
    const key = new GpgLinkedDataKeyClass2020(verificationMethod)
    const suite = new GpgSignature2020({
      LDKeyClass: GpgLinkedDataKeyClass2020,
      linkedDataSigantureType: "GpgSignature2020",
      linkedDataSignatureVerificationKeyType: "GpgVerificationKey2020",
      key
    });
    const result = await jsigs.verify(parsedInputFile, {
      compactProof: false,
      documentLoader: documentLoader,
      purpose: new AssertionProofPurpose(),
      suite
    });
    // console.log(result)
    console.log(JSON.stringify({ verified: result.verified }, null, 2));
    return vorpal.wait(1);
  });

vorpal.parse(process.argv);
if (process.argv.length === 0) {
  vorpal.delimiter("🔏 ").show();
}
