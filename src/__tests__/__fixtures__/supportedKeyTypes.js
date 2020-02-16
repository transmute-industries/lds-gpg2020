const supportedKeyTypes = [
    {
        userIds: [{ name: 'Jon Smith', email: 'jon@example.com' }],
        curve: 'ed25519'

    },
    {
        userIds: [{ name: 'Jon Smith', email: 'jon@example.com' }],
        curve: 'secp256k1'

    },
    {
        userIds: [{ name: 'Jon Smith', email: 'jon@example.com' }],
        rsaBits: 1024,
    },
    {
        userIds: [{ name: 'Jon Smith', email: 'jon@example.com' }],
        curve: 'p256',
    },
    {
        userIds: [{ name: 'Jon Smith', email: 'jon@example.com' }],
        curve: 'p384',
    },
    {
        userIds: [{ name: 'Jon Smith', email: 'jon@example.com' }],
        curve: 'p521',
    }
]

module.exports = supportedKeyTypes;