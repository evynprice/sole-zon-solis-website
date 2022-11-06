const express=require('express');
const router=express.Router();

// misc imports
const md5=require("md5")
const clc = require("cli-color"); // log formatting

// service imports
const ad=require('../models/services/ad.js');

// other utility functions
const check=require('../models/check.js');
const regEz=require ('../models/regex.js');

const bodyParser=require('body-parser');
const urlencodedParser=bodyParser.urlencoded({ extended: false });

router.get('/login', (req, res) => {
    res.render('login', {
        loggedin: req.session.loggedin,
        admin: req.session.admin
    });
});


router.post('/login', urlencodedParser, async (req, res) => {
    var errors = [];
    if (!req.body.username) {
        errors.push("No username specified");
    }
    if (!req.body.password) {
        errors.push("No password specified");
    }
    if (req.body.submit != 'suc') {
        errors.push("Not submitted through login form");
    }

    // checking for body errors. If this happens you probably did some client-side scripting
    if (errors.length) {
        console.log(clc.magenta("[WARN]") + " Client (" + req.ip + ") attempted to login with error {" + errors + "}")
        res.status(400)
        res.render('roll', {
            title: "400 Server Error",
            subtext: errors.join(',')
        });
        return;
    }
    // server side input validation to stop those pesky injection attacks)
    if (!req.body.username.match(regEz.USERNAME)) {
        console.log(clc.magenta("[WARN]") + " Client (" + req.ip + ") attempted to login but failed check {regEx Username}")
        res.render('login-error', {
            loggedin: req.session.loggedin,
            admin: req.session.admin
        })
        return false;
    }

    console.log(clc.blue("[LOGIN]") + " Client (" + req.ip + ") attempted to login to user [" + req.body.username + "]")

    // check if ad is down, do manual checks
    check.checkAD(function(response) {
        if (!response) {
            console.log(clc.red("[ERROR]") + " AD server is down, falling back to manual checks")
            let fqnUser = req.body.username
            if (!fqnUser.endsWith('@vitavehiculum.com')) {
                fqnUser = String(req.body.username + '@vitavehiculum.com')
            } else {
                fqnUser = String(req.body.username)
            }
            // remove @vitavehiculum.com from fqnUser
            let username = fqnUser.replace('@vitavehiculum.com', '')
            let password = String(req.body.password)
            let md5_password = String(md5(password))
            authenticated = false, admin = false
            if (username == 'bob' && md5_password == '331072aa537d826ff642492283c9decb') {
                authenticated = true
            } else if (username == 'clem' && md5_password == '9e89b4cf5035fc69a28b31acc37d4995') {
                authenticated = true
            } else if (username == 'alicia' && md5_password == 'd40e09d9385aca9c182383825ac20f96') {
                authenticated = true
            } else if (username == 'sue' && md5_password == '61e4094d9139b2b234be4f244698d0e8') {
                authenticated = true
            } else if (username == 'plank' && md5_password == '7730d86ca7f62cec8e1c7a298e4d8cdc') {
                authenticated = true
                admin = true
            } else {
                console.log(clc.red("[LOGIN]") + " Client (" + req.ip + ") failed login to [" + username + "]")
                res.render('login-error', {
                    loggedin: req.session.loggedin,
                    admin: req.session.admin
                })
                return
            }
            if (authenticated) {
                req.session.loggedin = true;
                req.session.username = username;
                if (admin) {
                    console.log(clc.green("[LOGIN]") + " Client (" + req.ip + ") successful login to ADMIN [" + username + "]")
                    req.session.admin = true;
                    res.redirect('/admin')
                } else {
                    console.log(clc.green("[LOGIN]") + " Client (" + req.ip + ") successful login to [" + username + "]")
                    res.redirect('/')
                }
                return true
            } else {
                console.log(clc.red("[LOGIN]") + " Client (" + req.ip + ") failed login to [" + username + "]")
                res.render('login-error', {
                    loggedin: req.session.loggedin,
                    admin: req.session.admin
                })
                return false
            }
        } else {
            let fqnUser = req.body.username
            if (!fqnUser.endsWith('@vitavehiculum.com')) {
                fqnUser = String(req.body.username + '@vitavehiculum.com')
            } else {
                fqnUser = String(req.body.username)
            }
            let username = fqnUser.replace('@vitavehiculum.com', '')
            let password = String(req.body.password)
            var groupName = 'Web Admin';
            ad.authenticate(fqnUser, password, function (err, auth) {
                if (err) {
                    // manual checks
                    let md5_password = String(md5(password))
                    authenticated = false, admin = false
                    if (username == 'bob' && md5_password == '331072aa537d826ff642492283c9decb') {
                        authenticated = true
                    } else if (username == 'clem' && md5_password == '9e89b4cf5035fc69a28b31acc37d4995') {
                        authenticated = true
                    } else if (username == 'alicia' && md5_password == 'd40e09d9385aca9c182383825ac20f96') {
                        authenticated = true
                    } else if (username == 'sue' && md5_password == '61e4094d9139b2b234be4f244698d0e8') {
                        authenticated = true
                    } else if (username == 'plank' && md5_password == '7730d86ca7f62cec8e1c7a298e4d8cdc') {
                        authenticated = true
                        admin = true
                    } else {
                        console.log(clc.red("[LOGIN]") + " Client (" + req.ip + ") failed login to [" + username + "]")
                        res.render('login-error', {
                            loggedin: req.session.loggedin,
                            admin: req.session.admin
                        })
                        return false
                    }
                    if (authenticated) {
                        console.log(clc.green("[LOGIN]") + " Client (" + req.ip + ") successful login to [" + username + "]")
                        req.session.loggedin = true;
                        req.session.username = username;
                        if (admin) {
                            console.log(clc.green("[LOGIN]") + " Client (" + req.ip + ") successful login to ADMIN [" + username + "]")
                            req.session.admin = true;
                            console.log(clc.green("[LOGIN]") + " Client (" + req.ip + ") successful login to ADMIN [" + username + "]")
                            res.redirect('/admin')
                        } else {
                            console.log(clc.green("[LOGIN]") + " Client (" + req.ip + ") successful login to [" + username + "]")
                            res.redirect('/')
                        }
                        return true
                    } else {
                        console.log(clc.red("[LOGIN]") + " Client (" + req.ip + ") failed login to [" + username + "]")
                        res.render('login-error', {
                            loggedin: req.session.loggedin,
                            admin: req.session.admin
                        })
                        return false
                    }
                } else if (auth) {
                    ad.isUserMemberOf(fqnUser, groupName, function (err, isAdmin) {
                        // not an admin
                        if (err) {
                            console.log(err);
                            req.session.loggedin = true;
                            req.session.username = username;
                            res.redirect('/')
                            return true
                        // admin
                        } else if (isAdmin) {
                            console.log(clc.green("[LOGIN]") + " Client (" + req.ip + ") successful login to ADMIN [" + username + "]")
                            req.session.loggedin = true;
                            req.session.username = username;
                            req.session.admin = true
                            res.redirect('/admin')
                            return true
                        // not an admin
                        } else {
                            console.log(clc.green("[LOGIN]") + " Client (" + req.ip + ") successful login to [" + username + "]")
                            req.session.loggedin = true;
                            req.session.username = username;
                            res.redirect('/')
                            return true
                        }
                    })
                } else {
                    console.log(clc.red("[LOGIN]") + " Client (" + req.ip + ") failed login to [" + username + "]")
                    res.render('login-error', {
                        loggedin: req.session.loggedin,
                        admin: req.session.admin
                    })
                    return false
                }
            });
        }
    })
})

router.get('/logout', (req, res) => {
    req.session.loggedin = false
    req.session.admin = false
    res.redirect('/login')
});

module.exports = router;