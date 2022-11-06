require('dotenv').config();
const ftp = require("basic-ftp")

const ftpClient = new ftp.Client(timeout=3000)
ftpClient.ftp.verbose = false

module.exports = ftpClient;
