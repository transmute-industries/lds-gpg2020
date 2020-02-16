
VERIFICATION_METHOD=$(cat $(pwd)/docs/example/key.json | jq '.id')
npm run gpg2020 -- sign -u "114FAE6216DE45B78A611D22227982B2ECAFBD45" $(pwd)/docs/example/doc.json $VERIFICATION_METHOD -o $(pwd)/docs/example/doc.signed.json
npm run gpg2020 -- verify $(pwd)/docs/example/doc.signed.json