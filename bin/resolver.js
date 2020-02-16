const fetch = require('node-fetch')

const getJson = async url =>
    fetch(url, {
        method: "get",
        headers: {
            Accept: "application/ld+json"
        }
    }).then(data => data.json());

module.exports = {
    resolve: async (did) => {
        const method = did.split(':')[1]
        let didDocument = {};
        switch (method) {
            case 'web':
                didDocument = await getJson(`http://${did.split('did:web:')[1].split('#')[0]}/.well-known/did.json`)
                break;
            default:
                ({ didDocument } = await getJson('https://uniresolver.io/1.0/identifiers/' + did))
        }
        return didDocument;
    }
}