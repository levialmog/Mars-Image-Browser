var express = require('express');
var router = express.Router();

let User  = class {
  constructor(firstName, lastName, email, password) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
  }
};
let userArray = [];

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.session.isRegistered) {
    req.session.isRegistered = false;
    req.session.isLoggedIn = false;
    res.render('login', {message:""});
  }
  else{
    if(!req.session.isLoggedIn)
      res.render('login', {message:"You have successfully registered!"});
    else
      res.render('index');
  }
});

router.post('/index', function(req, res, next) {
  let email = req.body.email.toLowerCase();
  let password = req.body.password.toLowerCase();
  for(let user of userArray){
    if(user.email === email && user.password === password) {
      req.session.isLoggedIn = true;
      res.render('index');
    }
  }
});

router.get('/register', function(req, res, next) {
  res.render('register');
});

router.post('/password', function(req, res, next) {
  req.session.firstName = req.body.firstName.toLowerCase();
  req.session.lastName = req.body.lastName.toLowerCase();
  req.session.email = req.body.email.toLowerCase();
  req.session.cookie.maxAge = 10*1000;
  res.render('password');
});

router.post('/saveUser', function(req, res, next){
  //TODO : check if email is no exist
  // for(let user of userArray){
  //   if(user.email === email.toLowerCase()) {
  //     answer = true;
  //     break
  //   }
  // }
  userArray.push(new User(req.session.firstName, req.session.lastName, req.session.email, req.body.password));
  req.session.isRegistered = true;
  res.redirect("/");
});

router.get('/isUserExist/:email', function(req, res, next) {
  let answer = false;
  let email = req.params.email.toLowerCase();
  for(let user of userArray){
    if(user.email === email) {
      answer = true;
      break
    }
  }
  res.json({isExist: answer});
});

module.exports = router;
