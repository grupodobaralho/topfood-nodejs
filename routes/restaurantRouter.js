const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../config/authenticate");
const Restaurant = require("../models/restaurant");

const GMT_Brasil = 3 * 60 * 60 * 1000; //GMT-3 Brasil

const restaurantRouter = express.Router();
restaurantRouter.use(bodyParser.json());

/*------------------------
 * /restaurants/everything
 * -----------------------*/
restaurantRouter.route("/everything")
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Restaurant.find({})
    .populate("products.comments.author", "username")
    .then((restaurants) => {
        restaurants.forEach(restaurant => {
            restaurant.createdAt -= GMT_Brasil;
            restaurant.updatedAt -= GMT_Brasil;

            restaurant.products.forEach(product => {
                product.createdAt -= GMT_Brasil;
                product.updatedAt -= GMT_Brasil;

                product.comments.forEach(comment => {
                    comment.createdAt -= GMT_Brasil;
                    comment.updatedAt -= GMT_Brasil;
                });
            });
        });

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(restaurants);
    }, (err) => next(err))
    .catch((err) => next(err));
});

/*-------------
 * /restaurants
 * ------------*/
restaurantRouter.route("/")
.get((req, res, next) => {
    Restaurant.find({}, "-products")
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

/*---------------------------
 * /restaurants/:restaurantId
 * --------------------------*/
restaurantRouter.route("/:restaurantId")
.get((req, res, next) => {
    Restaurant.findById(req.params.restaurantId, "-products.comments")
    .then((restaurant) => {
        restaurant.createdAt -= GMT_Brasil;
        restaurant.updatedAt -= GMT_Brasil;

        restaurant.products.forEach(product => {
            product.createdAt -= GMT_Brasil;
            product.updatedAt -= GMT_Brasil;
        });
        
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
    Restaurant.findById(req.params.restaurantId, "-products.comments")
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
    res.end("PUT operation not supported on /restaurants/restaurantId/products");
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

/*-----------------------------------------------
 * /restaurants/:restaurantId/products/:productId
 * ----------------------------------------------*/
restaurantRouter.route("/:restaurantId/products/:productId")
.get((req, res, next) => {
    Restaurant.findById(req.params.restaurantId)
    .then((restaurant) => {
        if(restaurant != null && restaurant.products.id(req.params.productId) != null) {
            restaurant.products.id(req.params.productId).createdAt -= GMT_Brasil;
            restaurant.products.id(req.params.productId).updatedAt -= GMT_Brasil;

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
    res.end("POST method not supported on /restaurants/restaurantId/products/productId");
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Restaurant.findById(req.params.restaurantId)
    .then((restaurant) => {
        if(restaurant != null && restaurant.products.id(req.params.productId) != null) {
            if(req.body.name   != null) restaurant.products.id(req.params.productId).name   = req.body.name;
            if(req.body.price  != null) restaurant.products.id(req.params.productId).price  = req.body.price;
            if(req.body.type   != null) restaurant.products.id(req.params.productId).type   = req.body.type;
            if(req.body.image  != null) restaurant.products.id(req.params.productId).image  = req.body.image;
            if(req.body.rating != null) restaurant.products.id(req.params.productId).rating = req.body.rating;

            restaurant.save()
            .then((restaurant) => {
                restaurant.products.id(req.params.productId).createdAt -= GMT_Brasil;
                restaurant.products.id(req.params.productId).updatedAt -= GMT_Brasil;
                
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
            var productRemoved = restaurant.products.id(req.params.productId).remove();

            restaurant.save()
            .then((restaurant) => {
                productRemoved.createdAt -= GMT_Brasil;
                productRemoved.updatedAt -= GMT_Brasil;
                
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(productRemoved);
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

/*--------------------------------------------------------
 * /restaurants/:restaurantId/products/:productId/comments
 * -------------------------------------------------------*/
restaurantRouter.route("/:restaurantId/products/:productId/comments")
.get((req, res, next) => {
    Restaurant.findById(req.params.restaurantId)
    .populate("products.comments.author", "username")
    .then((restaurant) => {
        if(restaurant != null && restaurant.products.id(req.params.productId) != null) {
            restaurant.products.id(req.params.productId).comments.forEach(comment => {
                comment.createdAt -= GMT_Brasil;
                comment.updatedAt -= GMT_Brasil;
            });

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(restaurant.products.id(req.params.productId).comments);
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
.post(authenticate.verifyUser, (req, res, next) => {
    Restaurant.findById(req.params.restaurantId)
    .then((restaurant) => {
        if(restaurant != null && restaurant.products.id(req.params.productId) != null) {
            req.body.author = req.user._id;
            restaurant.products.id(req.params.productId).comments.push(req.body);
            restaurant.save()
            .then((restaurant) => {
                var comment = restaurant.products.id(req.params.productId)
                    .comments[restaurant.products.id(req.params.productId).comments.length - 1];
                
                comment.createdAt -= GMT_Brasil;
                comment.updatedAt -= GMT_Brasil;

                var response = { _id: comment._id
                            , text: comment.text
                            , author: { _id: req.user._id
                                      , username: req.user.username }
                            , createdAt: comment.createdAt
                            , updatedAt: comment.updatedAt }

                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(response);
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
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /restaurants/restaurantId/products/productId/comments");
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Restaurant.findById(req.params.restaurantId)
    .then((restaurant) => {
        if(restaurant != null && restaurant.products.id(req.params.productId) != null) {
            for(var i = (restaurant.products.id(req.params.productId).comments.length - 1); i >= 0; i--) {
                restaurant.products.id(req.params.productId)
                    .comments.id(restaurant.products.id(req.params.productId).comments[i]._id).remove();
            }

            restaurant.save()
            .then((restaurant) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(restaurant.products.id(req.params.productId).comments);
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

/*-------------------------------------------------------------------
 * /restaurants/:restaurantId/products/:productId/comments/:commentId
 * ------------------------------------------------------------------*/
restaurantRouter.route("/:restaurantId/products/:productId/comments/:commentId")
.get((req, res, next) => {
    Restaurant.findById(req.params.restaurantId)
    .populate("products.comments.author", "username")
    .then((restaurant) => {
        if(restaurant != null && restaurant.products.id(req.params.productId) != null 
                && restaurant.products.id(req.params.productId).comments.id(req.params.commentId) != null) {
            restaurant.products.id(req.params.productId)
                .comments.id(req.params.commentId).createdAt -= GMT_Brasil;
            restaurant.products.id(req.params.productId)
                .comments.id(req.params.commentId).updatedAt -= GMT_Brasil;

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(restaurant.products.id(req.params.productId).comments.id(req.params.commentId));
        }
        else if(restaurant == null) {
            err = new Error("Restaurant " + req.params.restaurantId + " not found!");
            err.statusCode = 404;
            return next(err);
        }
        else if(restaurant.products.id(req.params.productId) == null) {
            err = new Error("Product " + req.params.productId + " not found!");
            err.statusCode = 404;
            return next(err);
        }
        else {
            err = new Error("Comment " + req.params.commentId + " not found!");
            err.statusCode = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("POST method not supported on /restaurants/restaurantId/products/productId/comments/commentId");
})
.put(authenticate.verifyUser, (req, res, next) => {
    Restaurant.findById(req.params.restaurantId)
    .then((restaurant) => {
        if(restaurant != null && restaurant.products.id(req.params.productId) != null 
                && restaurant.products.id(req.params.productId).comments.id(req.params.commentId) != null) {
            if(restaurant.products.id(req.params.productId)
                    .comments.id(req.params.commentId).author.equals(req.user._id)) {
                if(req.body.text != null) {
                    restaurant.products.id(req.params.productId)
                        .comments.id(req.params.commentId).text = req.body.text;
                }
                if(req.body.image != null) {
                    restaurant.products.id(req.params.productId)
                        .comments.id(req.params.commentId).image = req.body.image;
                }

                restaurant.save()
                .then((restaurant) => {
                    var comment = restaurant.products.id(req.params.productId)
                        .comments[restaurant.products.id(req.params.productId).comments.length - 1];
                    
                    comment.createdAt -= GMT_Brasil;
                    comment.updatedAt -= GMT_Brasil;

                    var response = { _id: comment._id
                                , text: comment.text
                                , author: { _id: req.user._id
                                          , username: req.user.username }
                                , createdAt: comment.createdAt
                                , updatedAt: comment.updatedAt }

                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(response);
                }, (err) => next(err));
            }
            else {
                var err = new Error("You are not authorized to update this comment!");
                err.statusCode = 403;
                return next(err);                
            }
        }
        else if(restaurant == null) {
            err = new Error("Restaurant " + req.params.restaurantId + " not found!");
            err.statusCode = 404;
            return next(err);
        }
        else if(restaurant.products.id(req.params.productId) == null) {
            err = new Error("Product " + req.params.productId + " not found!");
            err.statusCode = 404;
            return next(err);
        }
        else {
            err = new Error("Comment " + req.params.commentId + " not found!");
            err.statusCode = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Restaurant.findById(req.params.restaurantId)
    .then((restaurant) => {
        if(restaurant != null && restaurant.products.id(req.params.productId) != null 
                && restaurant.products.id(req.params.productId).comments.id(req.params.commentId) != null) {
            if(restaurant.products.id(req.params.productId)
                    .comments.id(req.params.commentId).author.equals(req.user._id)) {
                var commentRemoved = restaurant.products.id(req.params.productId).comments.id(req.params.commentId).remove();

                restaurant.save()
                .then((restaurant) => {
                    commentRemoved.createdAt -= GMT_Brasil;
                    commentRemoved.updatedAt -= GMT_Brasil;

                    var response = { _id: commentRemoved._id
                        , text: commentRemoved.text
                        , author: { _id: req.user._id
                                  , username: req.user.username }
                        , createdAt: commentRemoved.createdAt
                        , updatedAt: commentRemoved.updatedAt }

                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(response);
                }, (err) => next(err));
            }
            else {
                var err = new Error("You are not authorized to delete this comment!");
                err.statusCode = 403;
                return next(err);
            }
        }
        else if(restaurant == null) {
            err = new Error("Restaurant " + req.params.restaurantId + " not found!");
            err.statusCode = 404;
            return next(err);
        }
        else if(restaurant.products.id(req.params.productId) == null) {
            err = new Error("Product " + req.params.productId + " not found!");
            err.statusCode = 404;
            return next(err);
        }
        else {
            err = new Error("Comment " + req.params.commentId + " not found!");
            err.statusCode = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

/*---------------
 * Exports Module
 * --------------*/
module.exports = restaurantRouter;