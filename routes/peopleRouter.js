const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../config/authenticate");
const People = require("../models/people");

const peopleRouter = express.Router();
peopleRouter.use(bodyParser.json());

/*------------------------------------
 * /people
 * -----------------------------------*/
peopleRouter.route("/")
.get((req, res, next) => {
    People.find({})
    .then((people) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(people);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    People.create(req.body)
    .then((people) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(people);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /people");
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    People.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

/*------------------------------------
 * /people/:personId
 * -----------------------------------*/
peopleRouter.route("/:personId")
.get((req, res, next) => {
    People.findById(req.params.personId)
    .then((people) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(people);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end("POST method not supported on /people/personId" + req.params.personId);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    People.findByIdAndUpdate(req.params.personId, {
        $set: req.body
    }, { new: true })
    .then((people) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(people);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    People.findByIdAndRemove(req.params.personId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = peopleRouter;