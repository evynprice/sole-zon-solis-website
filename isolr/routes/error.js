const express=require('express');
const router=express.Router();

router.get('/error', (req, res) => {
    res.render('error', {
        title: "Error",
        subtext: "What are you doing here?",
        loggedin: req.session.loggedin,
        admin: req.session.admin
    });
})

module.exports = router