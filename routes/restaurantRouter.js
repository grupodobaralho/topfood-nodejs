const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../config/authenticate");
const Restaurant = require("../models/restaurant");

const GMT_Brasil = 3 * 60 * 60 * 1000; //GMT-3 Brasil

const restaurantRouter = express.Router();
restaurantRouter.use(bodyParser.json());

/*------------------------------------
 * /restaurants
 * -----------------------------------*/
restaurantRouter.route("/")
.get((req, res, next) => {
    Restaurant.find({})
    .then((restaurants) => {
        restaurants.forEach(restaurant => {
            restaurant.createdAt = restaurant.createdAt - GMT_Brasil;
            restaurant.updatedAt = restaurant.updatedAt - GMT_Brasil; 
        });

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(restaurants);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Restaurant.create(req.body)
    .then((restaurant) => {
        restaurant.createdAt = restaurant.createdAt - GMT_Brasil;
        restaurant.updatedAt = restaurant.updatedAt - GMT_Brasil;
        
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(restaurant);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /restaurants");
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Restaurant.remove({})
    .then((restaurants) => {
        restaurants.forEach(restaurant => {
            restaurant.createdAt = restaurant.createdAt - GMT_Brasil;
            restaurant.updatedAt = restaurant.updatedAt - GMT_Brasil; 
        });

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(restaurants);
    }, (err) => next(err))
    .catch((err) => next(err));
});

/*------------------------------------
 * /restaurants/:restaurantId
 * -----------------------------------*/
restaurantRouter.route("/:restaurantId")
.get((req, res, next) => {
    Restaurant.findById(req.params.restaurantId)
    .then((restaurant) => {
        restaurant.createdAt = restaurant.createdAt - GMT_Brasil;
        restaurant.updatedAt = restaurant.updatedAt - GMT_Brasil;
        
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(restaurant);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end("POST method not supported on /restaurants/restaurantId");
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Restaurant.findByIdAndUpdate(req.params.restaurantId, {
        $set: req.body
    }, { new: true })
    .then((restaurant) => {
        restaurant.createdAt = restaurant.createdAt - GMT_Brasil;
        restaurant.updatedAt = restaurant.updatedAt - GMT_Brasil;

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(restaurant);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Restaurant.findByIdAndRemove(req.params.restaurantId)
    .then((restaurant) => {
        if(restaurant != null) {
            restaurant.createdAt = restaurant.createdAt - GMT_Brasil;
            restaurant.updatedAt = restaurant.updatedAt - GMT_Brasil;
            
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(restaurant);
        }
        else {
            err = new Error("Restaurant " + req.params.restaurantId + " not found!");
            err.statusCode = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

/*------------------------------------
 * /restaurants/:restaurantId/products
 * -----------------------------------*/


module.exports = restaurantRouter;