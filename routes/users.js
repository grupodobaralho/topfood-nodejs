const express = require("express");
const bodyParser = require("body-parser");
const User = require("../models/user");
const passport = require("passport");
const authenticate = require("../config/authenticate");

const router = express.Router();
router.use(bodyParser.json());

// GET /users
router.get("/", authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
  User.find({})
	.then((user) => {
		res.statusCode = 200;
		res.setHeader("Content-Type", "application/json");
		res.json(user);
	}, (err) => next(err))
	.catch(err => res.status(err.status).json({ message: err.message }));
});

// POST /signup
router.post("/signup", (req, res, next) => {
  User.register(new User({username: req.body.username}), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.json({err: err});
    }
    else {
      passport.authenticate("local")(req, res, () => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({success: true, _id: req.user._id, status: "Registration Successful!"});
      });
    }
  });
});

// POST /login
router.post("/login", passport.authenticate("local"), (req, res) => {
  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.json({success: true, _id: req.user._id, token: token, status: "You are successfully logged in!"});
});

// GET /profile
router.route("/profile")
.get(authenticate.verifyUser, (req, res, next) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.json({_id: req.user._id, username: req.user.username});
})
.post(authenticate.verifyUser, (req, res, next) => {
  res.statusCode = 403;
  res.end("Use /signup to create an account!");
})
.put(authenticate.verifyUser, (req, res, next) => {
  res.statusCode = 403;
  res.end("PUT operation not supported on /users/profile");
})
.delete(authenticate.verifyUser, (req, res, next) => {
  if(req.body._id != null) {
    //Administrator can't exclude himself, but can exclude anyone else
    if(authenticate.isAdmin(req.user.admin, req.user.username)) {
      if(req.body._id != req.user._id) {
        User.findByIdAndRemove(req.body._id)
        .then((user) => {
          if(user != null) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(user);
          }
          else {
              err = new Error("User " + req.body._id + " not found!");
              err.statusCode = 404;
              return next(err);
          }
        }, (err) => next(err))
        .catch((err) => next(err));
      }
      else {
        res.statusCode = 403;
        res.end("Administrator can't exclude himself!");
      }
    }
    //Not administrator user can only exclude himself
    else {
      if(req.body._id == req.user._id) {
        User.findByIdAndRemove(req.user._id)
        .then((user) => {
          if(user != null) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(user);
          }
          else {
              err = new Error("User " + req.body.username + " not found!");
              err.statusCode = 404;
              return next(err);
          }
        }, (err) => next(err))
        .catch((err) => next(err));
      }
      else {
        res.statusCode = 403;
        res.end("Not administrator user can only exclude himself!");
      }
    }
  }
  else {
    res.statusCode = 400;
    res.end("\"_id\" must be informed!");
  }
});

// module exports
module.exports = router;
