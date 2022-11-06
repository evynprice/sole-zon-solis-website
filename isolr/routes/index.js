const express=require('express');
const router=express.Router();
const mysql=require('../models/services/mysql.js');
const fs=require("fs");

router.get('/', (req, res) => {
    var sql = "SELECT arrayID, (arrayVoltage * arrayCurrent) as power, arrayVoltage, arrayCurrent FROM solar_arrays;"
    mysql.query(sql, function (err, result, fields) {
        // if there is an error, try reading from DB cache
        if (err) {
            try {
                let rawdata = fs.readFileSync('./cache/db.json');
                let result = JSON.parse(rawdata);
                res.render('index', {
                    records: result,
                    loggedin: req.session.loggedin,
                    admin: req.session.admin
                });
            } catch (err) {
                // database is down and cache does not exist. Render page without power data
                res.render('index', {
                    records: [],
                    loggedin: req.session.loggedin,
                    admin: req.session.admin
                });
            }
        } else {
            // no error, render as expected
            res.render('index', {
                records: result,
                loggedin: req.session.loggedin,
                admin: req.session.admin
            });
            // save results to local cache
            fs.writeFileSync('./cache/db.json', JSON.stringify(result));
        }
    });
});

router.get('/solar', (req, res) => {
    res.render('solar', {
        loggedin: req.session.loggedin,
        admin: req.session.admin
    });
});

router.get('/manufacturing', (req, res) => {
    res.render('manufacturing', {
        loggedin: req.session.loggedin,
        admin: req.session.admin
    });
});

module.exports = router