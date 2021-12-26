var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // if(!req.session.isRegistered) {
  //   req.session.isRegistered = false;
  //   req.session.isLoggedIn = false;
  //   res.render('login', {message:""});
  // }
  // else{
  //   if(!req.session.isLoggedIn)
  //     res.render('login', {message:"You have successfully registered!"});
  //   else
  //     res.render('index');
  // }
  res.render('login', {message:""});
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

module.exports = router;
