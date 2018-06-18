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
            restaurant.createdAt -= GMT_Brasil;
            restaurant.updatedAt -= GMT_Brasil;
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
        restaurant.createdAt -= GMT_Brasil;
        restaurant.updatedAt -= GMT_Brasil;
        
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
    Restaurant.deleteMany({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(resp);
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
        restaurant.createdAt -= GMT_Brasil;
        restaurant.updatedAt -= GMT_Brasil;
        
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
        restaurant.createdAt -= GMT_Brasil;
        restaurant.updatedAt -= GMT_Brasil;

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
            restaurant.createdAt -= GMT_Brasil;
            restaurant.updatedAt -= GMT_Brasil;
            
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
restaurantRouter.route("/:restaurantId/products")
.get((req, res, next) => {
    Restaurant.findById(req.params.restaurantId)
    .then((restaurant) => {
        if(restaurant != null) {
            restaurant.products.forEach(product => {
                product.createdAt -= GMT_Brasil;
                product.updatedAt -= GMT_Brasil;
            });
            
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(restaurant.products);
        }
        else {
            err = new Error("Restaurant " + req.params.restaurantId + " not found!");
            err.statusCode = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Restaurant.findById(req.params.restaurantId)
    .then((restaurant) => {
        if(restaurant != null) {
            restaurant.products.push(req.body);
            restaurant.save()
            .then((restaurant) => {
                restaurant.products[restaurant.products.length - 1].createdAt -= GMT_Brasil;
                restaurant.products[restaurant.products.length - 1].updatedAt -= GMT_Brasil;

                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(restaurant.products[restaurant.products.length - 1]);
            }, (err) => next(err));
        }
        else {
            err = new Error("Restaurant " + req.params.restaurantId + " not found!");
            err.statusCode = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /restaurants/" + req.params.restaurantId + "/products");
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Restaurant.findById(req.params.restaurantId)
    .then((restaurant) => {
        if(restaurant != null) {
            for(var i = (restaurant.products.length - 1); i >= 0; i--) {
                restaurant.products.id(restaurant.products[i]._id).remove();
            }
            restaurant.save()
            .then((restaurant) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(restaurant.products);
            }, (err) => next(err));
        }
        else {
            err = new Error("Restaurant " + req.params.restaurantId + " not found!");
            err.statusCode = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

/*-------------------------------------------------
 * /restaurants/:restaurantId/products/:productId
 * ------------------------------------------------*/
restaurantRouter.route("/:restaurantId/products/:productId")
.get((req, res, next) => {
    Restaurant.findById(req.params.restaurantId)
    //.populate("products.comments")
    .then((restaurant) => {
        if(restaurant != null && restaurant.products.id(req.params.productId) != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(restaurant.products.id(req.params.productId));
        }
        else if(restaurant == null) {
            err = new Error("Restaurant " + req.params.restaurantId + " not found!");
            err.statusCode = 404;
            return next(err);
        }
        else {
            err = new Error("Product " + req.params.productId + " not found!");
            err.statusCode = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end("POST method not supported on /restaurants/" + req.params.restaurantId + "/products/" + req.params.productId);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Restaurant.findById(req.params.restaurantId)
    .then((restaurant) => {
        if(restaurant != null && restaurant.products.id(req.params.productId) != null) {
            if(req.body.name  != null) restaurant.products.id(req.params.productId).name  = req.body.name;
            if(req.body.price != null) restaurant.products.id(req.params.productId).price = req.body.price;
            if(req.body.type  != null) restaurant.products.id(req.params.productId).type  = req.body.type;
            if(req.body.image != null) restaurant.products.id(req.params.productId).image = req.body.image;

            restaurant.save()
            .then((restaurant) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(restaurant.products.id(req.params.productId));
            }, (err) => next(err));
        }
        else if(restaurant == null) {
            err = new Error("Restaurant " + req.params.restaurantId + " not found!");
            err.statusCode = 404;
            return next(err);
        }
        else {
            err = new Error("Product " + req.params.productId + " not found!");
            err.statusCode = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Restaurant.findById(req.params.restaurantId)
    .then((restaurant) => {
        if(restaurant != null && restaurant.products.id(req.params.productId) != null) {
            var removed = restaurant.products.id(req.params.productId).remove();
            restaurant.save()
            .then((restaurant) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(removed);
            }, (err) => next(err));
        }
        else if(restaurant == null) {
            err = new Error("Restaurant " + req.params.restaurantId + " not found!");
            err.statusCode = 404;
            return next(err);
        }
        else {
            err = new Error("Product " + req.params.productId + " not found!");
            err.statusCode = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = restaurantRouter;