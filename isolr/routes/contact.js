const express=require('express');
const router=express.Router();

// service imports
const ftp=require('../models/services/ftp.js');;
const smtp=require('../models/services/smtp.js')

// other utility functions
const regEz=require ('../models/regex.js');
const utils=require('../models/utils.js')
const clc = require("cli-color"); // log formatting


router.get('/contact', (req, res) => {
    res.render('contact', {
        loggedin: req.session.loggedin,
        admin: req.session.admin
    });
});

router.post('/contact', async (req, res) => {
    var errors = [];
    if (!req.body.name) {
        errors.push("'name' is required");
    }
    if (!req.body.email) {
        errors.push("'email' is required");
    }
    if (!req.body.tel) {
        errors.push("'tel' is required");
    }
    if (req.body.submit != 'suc') {
        errors.push("Form must be submitted through the website");
    }

    // checking for body errors. If this happens you probably did some client-side scripting
    if (errors.length) {
        console.log(clc.magenta("[WARN]") + " Client (" + req.ip + ") attempted to use contact form with error {" + errors + "}")
        console.log(errors)
        res.status(400)
        res.render('roll', {
            title: "400 Server Error",
            subtext: errors.join(',')
        });
        utils.clearTemp()
        return;
    }

    // server side input validation to stop those pesky injection attacks
    if (!req.body.name.match(regEz.NAME)) {
        console.log(clc.magenta("[WARN]") + " Client (" + req.ip + ") attempted to contact, but failed check {regEx name}")
        return contactErrorPage(true, req, res, "Malformed Input", "Provided name is invalid")
    } else if (!req.body.tel.match(regEz.PHONE)) {
        if (!req.body.tel.match(regEz.PHONE_FORMATTED)) {
            console.log(clc.magenta("[WARN]") + " Client (" + req.ip + ") attempted to contact, but failed check {regEx phone}")
            return contactErrorPage(true, req, res, "Malformed Input", "Provided telephone number is invalid")
        }
    } else if (!req.body.email.match(regEz.EMAIL)) {
        console.log(clc.magenta("[WARN]") + " Client (" + req.ip + ") attempted to contact, but failed check {regEx email}")
        return contactErrorPage(true, req, res, "Malformed Input", "Provided email is invalid")
    } else if (!req.files || Object.keys(req.files).length === 0) {
        console.log(clc.magenta("[WARN]") + " Client (" + req.ip + ") attempted to contact, but failed check {no file uploaded}")
        return contactErrorPage(true, req, res, "Malformed Input", "No file was uploaded")
    } else {
        // check size of file
        // is greater than 100MB
        if (req.files.file.size >= 104900000) {
            console.log(clc.magenta("[WARN]") + " Client (" + req.ip + ") attempted to contact, but failed check {file size}")
            return contactErrorPage(true, req, res, "Malformed Input", "File size is too large (>100MB)")
        }
    }
    // get the file path and og name of file
    let filePath = req.files.file.tempFilePath;
    let ogName = req.files.file.name;

    // file name checking
    if (ogName.toLowerCase().endsWith(".sh") || ogName.toLowerCase().endsWith(".exe") || ogName.toLowerCase().endsWith(".cmd") || ogName.toLowerCase().endsWith(".bat")) {
        console.log(clc.magenta("[WARN]") + " Client (" + req.ip + ") attempted to contact, but failed check {file extension}")
        return contactErrorPage(true, req, res, "Malformed Input", "That file type is not allowed")
    }

    // ftp upload
    try {
        await ftp.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: process.env.FTP_SECURE
        })

        // attempt to upload file to ftp
        await ftp.uploadFrom(filePath, ogName)
        await ftp.close()

        // clear the tmp directory
        utils.clearTemp()
        console.log(clc.green("[CONTACT]") + " Client (" + req.ip + ") submitted a contact form [ " + ogName + " ]")
    } catch (err) {
        // there was some error with ftp upload.
        console.log(err)
        res.status(501)
        res.render('contact-error', {
            title: "501 Internal Server Error",
            subtext: "internal server error",
            clienterror: "There was an issue uploading your file. Try again later",
            loggedin: req.session.loggedin,
            admin: req.session.admin
        });
        utils.clearTemp()
        console.log(clc.red("[ERROR]") + " Client (" + req.ip + ") could not upload file to FTP [ " + ogName + " ]")
        return;
    }

    // email body
    const body = `Name: ${req.body.name} Email: ${req.body.email} Phone: ${req.body.tel} File Uploaded: ${req.files.file.name}`

    // email object
    const message = {
        from: "contact@sunpartners.local",
        to: "contact@sunpartners.local",
        subject: `New Message from ${req.body.email}`,
        text: body
    }

    // attempt to send email
    smtp.sendMail(message, (err, info) => {
        if (err) {
            console.log(err)
            res.status(501)
            res.render('contact-error', {
                title: "501 Internal Server Error",
                subtext: "internal server error",
                clienterror: "There was an issue sending the email. Try again later",
                loggedin: req.session.loggedin,
                admin: req.session.admin
            });
            utils.clearTemp()
            console.log(clc.red("[ERROR]") + " Client (" + req.ip + ") could not send email")
            return;
        }
    });

    // successful POST, ftp upload, and mail upload
    res.render('contact-success', {
        loggedin: req.session.loggedin,
        admin: req.session.admin
    })
    res.status(202)
    return;
})

// renders the contact error page with the error provided
function contactErrorPage(clearTmpDirectory, req, res, log, error) {
    console.log(log)
    res.status(400)
    res.render('contact-error', {
        title: "400 Server Error",
        subtext: "invalid request",
        clienterror: error,
        loggedin: req.session.loggedin,
        admin: req.session.admin
    });
    if (clearTmpDirectory) {
        utils.clearTemp()
    }
    return
}

module.exports = router