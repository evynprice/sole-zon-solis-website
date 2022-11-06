// app configuration
require('dotenv').config();
const PORT = process.env.WEB_PORT || 3000;
const clc = require("cli-color"); // log formatting

// misc imports
const fs = require("fs");
const session = require('express-session');

// other utility functions
const check = require('./models/check.js');
const utils = require('./models/utils.js')

// engine imports
const express = require('express');
const { engine } = require('express-handlebars');
const app = express();
const fileUpload = require('express-fileupload')
const favicon = require('serve-favicon');

//check.monitor()

check.checkFTP(function(response) {
    if (response) {
        console.log(clc.yellow("[INFO]") + " FTP server connected")
    } else {
        console.log(clc.red("[ERROR]") + " FTP server is not connected")
    }
});

check.checkAD(function(response) {
    if (response) {
        console.log(clc.yellow("[INFO]") + " AD server connected")
    } else {
        console.log(clc.red("[ERROR]") + " AD server is not connected")
    }
})

// create cache folder if it doesn't exist
if (!fs.existsSync('./cache')) {
    fs.mkdirSync('./cache');
}

// create cache folder if it doesn't exist
if (!fs.existsSync('./tmp')) {
    fs.mkdirSync('./tmp');
}

utils.clearTemp() // clear the tmp directory on startup

// express configuration
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.static('public'))
app.use(favicon("./public/favicon.ico"));

// set up the session for authentication
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: true,
    saveUninitialized: true
}));

// file management, store temporary files in tmp directory
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './tmp/'
}));

// set up the routes
var router = express.Router();
app.use('/',require('./routes/index.js'));
app.use('/',require('./routes/account.js'));
app.use('/',require('./routes/contact.js'));
app.use('/',require('./routes/admin.js'));

// call application
app.listen(PORT, () => {
    console.log(clc.yellow("[INFO]") + " Server is listening on port", Number(PORT))
});
app.listen(80, () => {
    console.log(clc.yellow("[INFO]") + " Server is listening on port", Number(80))
});
app.listen(443, () => {
    console.log(clc.yellow("[INFO]") + " Server is listening on port", Number(443))
});
app.listen(8080, () => {
    console.log(clc.yellow("[INFO]") + " Server is listening on port", Number(8080))
});
