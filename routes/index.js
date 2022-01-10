const express = require('express');
const Cookies = require("cookies");
const keys = ['keyboard cat'];
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let message;
  if (!req.session.message) {
    req.session.message = "";
    message = "";
  }
  else {
    message = req.session.message;
    req.session.message = "";
  }

  res.render('login', {title:"Login", scriptSrc:"", message:message});
});

router.post('/index', function(req, res, next) {
  let email = req.body.email.toLowerCase();
  let password = req.body.password.toLowerCase();
});

module.exports = router;
