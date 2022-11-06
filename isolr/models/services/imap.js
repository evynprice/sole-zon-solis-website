require('dotenv').config();
const imaps = require('imap-simple');

const imaps_config = {
    imap: {
        user: process.env.IMAP_USER,
        password: process.env.IMAP_PASSWORD,
        host: process.env.IMAP_HOST,
        port: process.env.IMAP_PORT,
        tls: false,
        authTimeout: 3000
    }
};

module.exports = { imaps, imaps_config };

