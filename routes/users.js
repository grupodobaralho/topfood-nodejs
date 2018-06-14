var express = require("express");
const bodyParser = require("body-parser");
var User = require("../models/user");
var passport = require("passport");
var authenticate = require("../authenticate");

var router = express.Router();
router.use(bodyParser.json());

// GET /users
router.get('/', authenticate.verifyUser, function(req, res, next) {
  User.find()
	.then((user) => {
		res.statusCode = 200;
		res.setHeader("Content-Type", "application/json");
		res.json(user);
	}, (err) => next(err))
	.catch(err => res.status(err.status).json({ message: err.message }));
});

// POST /signup
router.post('/signup', (req, res, next) => {
  User.register(new User({username: req.body.username}), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Registration Successful!'});
      });
    }
  });
});

// POST /login
router.post('/login', passport.authenticate('local'), (req, res) => {
  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

// module exports
module.exports = router;
