const express=require('express');
const router=express.Router();

// service imports
const ftp=require('../models/services/ftp.js');
const imaps=require('../models/services/imap.js');
const clearTemp = require('../models/utils.js')
const clc = require("cli-color"); // log formatting
const bodyParser=require('body-parser')
const urlencodedParser=bodyParser.urlencoded({ extended: false })

// utils
const utils=require('../models/utils.js');

router.post('/admin', urlencodedParser, async (req, res) => {
    if (req.session.admin) {
        if ((Object.keys(req.body).length == 1)) {
            let fileName = Object.values(req.body)[0]
            try {
                await ftp.access({
                    host: process.env.FTP_HOST,
                    user: process.env.FTP_USER,
                    password: process.env.FTP_PASSWORD,
                    secure: process.env.FTP_SECURE
                })

                let full_name = "./tmp/" + fileName
                await ftp.downloadTo(full_name, fileName)
                ftp.close()
                res.download(full_name)

                utils.clearTemp()
                console.log(clc.green("[LOGIN]") + " Client (" + req.ip + ") successfully downloaded FTP file [" + fileName + "]")
            } catch (err) {
                // there was some error with ftp.
                console.log(err)
                console.log(clc.red("[ERROR]") + " Client (" + req.ip + ") could not download FTP file")
                res.status(501)
                res.render('error', {
                    title: "501 Internal Server Error",
                    subtext: "internal server error",
                    clienterror: "There was an issue downloading your file. Try again later",
                    loggedin: req.session.loggedin,
                    admin: req.session.admin
                });
                return;
            }
        } else {
            req.redirect('/')
        }
    }
})


router.get('/admin', async (req, res) => {
    if (req.session.loggedin && req.session.admin) {
        try {
            await ftp.access({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                password: process.env.FTP_PASSWORD,
                secure: process.env.FTP_SECURE
            })

            let files = await ftp.list()
            let tmp = [];
            for (const file of files) {
                if (file.type == 1) {
                    tmp.push(file)
                }
            }
            ftp.close()
            imaps.imaps.connect(imaps.imaps_config).then(function (connection) {
                return connection.openBox('INBOX').then(function () {
                    var searchCriteria = [
                        'UNSEEN'
                    ];
                    var fetchOptions = {
                        bodies: ['HEADER', 'TEXT'],
                        markSeen: false
                    };
                    let tmp_messages = []
                    return connection.search(searchCriteria, fetchOptions).then(function (messages) {
                        messages.forEach(function (item) {
                            tmp_messages.push(item.parts[1])
                        });
                        res.render('admin', {
                            loggedin: req.session.loggedin,
                            admin: req.session.admin,
                            ftp: tmp,
                            emails: tmp_messages
                        });
                    });

                });
            });


        } catch (err) {
            // there was some error with ftp listing
            console.log(clc.red("[ERROR]") + " Client (" + req.ip + ") could not establish FTP connection")
            console.log(err)
            console.log(clc.red("[ERROR]") + " Client (" + req.ip + ") could not download FTP file")
            res.status(501)
            res.render('error', {
                title: "501 Internal Server Error",
                subtext: "internal server error",
                clienterror: "There was an issue uploading your file. Try again later",
                loggedin: req.session.loggedin,
                admin: req.session.admin
            });
            return;
        }
    }
    else {
        res.redirect('/login')
    }
});

module.exports = router