var createError = require('http-errors');
var express = require('express');
var app = express();
var port = process.env.PORT || 3003;
var mongoose = require("mongoose");
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var passport = require("passport");
var authenticate = require("./config/authenticate");
var config = require('./config/config');

// variables containing the routes files
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var peopleRouter = require('./routes/peopleRouter');

// configuration ===============================================================
mongoose.connect(process.env.MONGODB_URI || config.mLab); // connect to our database

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(express.json()); // these two get information from html forms
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// routes ======================================================================
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/people", peopleRouter);
//app.use("/promotions", promoRouter);
//app.use("/leaders", leaderRouter);
//app.use("/imageUpload", uploadRouter);

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
  res.setHeader("Content-Type", "application/json");
  res.json({err: err});
});

// launch ======================================================================
app.listen(port);
console.log('Acesse localhost:' + port);
