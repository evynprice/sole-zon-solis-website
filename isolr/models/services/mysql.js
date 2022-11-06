require('dotenv').config();
const clc = require("cli-color"); // log formatting
const mysqlnpm = require('mysql');

const mysql = mysqlnpm.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE
});

mysql.connect(function(err) {
	if (err) {
		console.log(clc.red("[ERROR]") + " MySQL server is not connected")
	}
	else {
		console.log(clc.yellow("[INFO]") + " MySQL server connected")
	}
});

module.exports = mysql;
