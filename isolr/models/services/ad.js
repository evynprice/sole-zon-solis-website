require('dotenv').config();
const activeDirectory = require('activedirectory2');

const adConfig = {
    url: process.env.AD_HOST,
    baseDN: process.env.AD_BASEDN,
    username: process.env.AD_USER,
    password: process.env.AD_PASSWORD
}
let ad = new activeDirectory(adConfig);

module.exports = ad;
