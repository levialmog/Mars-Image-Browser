/*var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(session({
  secret:"somesecretkey",

  resave: false, // Force save of session for each request
  saveUninitialized: false, // Save a session that is new, but has not been modified
  cookie: {maxAge: 10*60*1000 } // milliseconds!
}));

module.exports = app;*/

// const createError = require('http-errors');
// // load modules
// //var fs = require('fs')
// const path = require('path');
// const logger = require('morgan');
// const express = require('express');
// const session = require('express-session');
//
// // cookie parser is no more needed for express-session
// // const cookieParser = require('cookie-parser');
//
// // our router
// const indexRouter = require('./routes/index');
//
// // express main object
// var app = express();
//
// // view engine setup: add EJS folder
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
//
// // logging example - log only error responses
// // see https://www.npmjs.com/package/morgan for full documentation
// // var accessLogStream = fs.createWriteStream(path.join(__dirname, 'http.log'), { flags: 'a' })
// // app.use(logger('combined', { stream: accessLogStream, skip: function (req, res) { return res.statusCode < 400 } }));
//
// // plug the logging middleware - look for output in standard output
// app.use(logger('dev'));
//
// // enable parsing request data
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
//
// // enable cookie parser
// // app.use(cookieParser);
//
// // open public directory
// app.use(express.static(path.join(__dirname, 'public')));
//
//
// // enable sessions
// app.use(session({
//   secret:"somesecretkey",
//
//   resave: false, // Force save of session for each request
//   saveUninitialized: false, // Save a session that is new, but has not been modified
//   cookie: {maxAge: 10*60*1000 } // milliseconds!
// }));
//
//
// // our routing
// app.use('/', indexRouter);
//
//
//
// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });
//
// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });
//
// module.exports = app;
//

let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let indexRouter = require('./routes/index');
let registrationRouter = require('./routes/registration');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/register', registrationRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;