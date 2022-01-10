const express = require('express');
const Cookies = require("cookies");
const db = require("../models");
const keys = ['keyboard cat'];
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let message, color;
  if (!req.session.message) {
    req.session.messageColor = "";
    req.session.message = "";
    message = "";
    color = "";
  }
  else {
    message = req.session.message;
    color = req.session.messageColor;
    req.session.messageColor = "";
    req.session.message = "";
  }

  if(!req.session.loggedIn) {
    req.session.loggedIn = false;
  }
  else{
    res.redirect('/index')
  }

  res.render('login', {title:"Login", scriptSrc:"", message:message, messageColor:color});
});

router.post('/index', function(req, res, next) {
  if(!req.session.loggedIn) {
    if (req.body.email && req.body.password) {
      return db.Contact.findOne({where: {email: req.body.email.toLowerCase()}})
          .then((contact) => {
            if (!contact) {
              req.session.message = "No account found with that email address!";
              req.session.messageColor = "bg-danger"
              res.redirect('/');
            } else {
              if (contact.password === req.body.password.toLowerCase()) {
                req.session.loggedIn = true;
                req.session.firstName = contact.firstName;
                req.session.lastName = contact.lastName;
                req.session.email = contact.email;
                res.render('index', {title:"Mars Image Browser", scriptSrc:"/js/indexFunc.js",
                                                 firstName:req.session.firstName, lastName:req.session.lastName});
              } else {
                req.session.message = "Incorrect password!";
                req.session.messageColor = "bg-danger"
                res.redirect('/');
              }
            }
          })
          .catch((err) => {
            console.log('There was an error querying contacts', JSON.stringify(err))
            return res.send(err)
          });
    }
    else {
      req.session.message = "Please fill in all fields!";
      req.session.messageColor = "bg-danger"
      res.redirect('/');
    }
  }
  else {
    res.render('index', {title:"Mars Image Browser", scriptSrc:"/js/indexFunc.js",
                                     firstName:req.session.firstName, lastName:req.session.lastName});
  }
});

module.exports = router;