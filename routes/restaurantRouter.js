const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../config/authenticate");
const Restaurant = require("../models/restaurant");

const restaurantRouter = express.Router();

restaurantRouter.use(bodyParser.json());

/*------------------------------------
 * /restaurant
 * -----------------------------------*/
restaurantRouter.route("/")
.get((req, res, next) => {
    Restaurant.find({})
    .then((restaurant) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(restaurant);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Restaurant.create(req.body)
    .then((restaurant) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(restaurant);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /restaurant");
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Restaurant.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

/*------------------------------------
 * /restaurant/:restaurantId
 * -----------------------------------*/
restaurantRouter.route("/:restaurantId")
.get((req, res, next) => {
    Restaurant.findById(req.params.restaurantId)
    .then((restaurant) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(restaurant);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end("POST method not supported on /restaurant/restaurantId" + req.params.restaurantId);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Restaurant.findByIdAndUpdate(req.params.restaurantId, {
        $set: req.body
    }, { new: true })
    .then((restaurant) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(restaurant);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Restaurant.findByIdAndRemove(req.params.restaurantId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = restaurantRouter;