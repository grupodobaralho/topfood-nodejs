const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../config/authenticate");
const Restaurant = require("../models/restaurant");

const databaseRouter = express.Router();
databaseRouter.use(bodyParser.json());

var restaurants = [{
    name: "Casa 5",
    image: "Casa5.jpg",
    rating: 5.0
  },
  {
    name: "Canal Café",
    image: "CanalCafe.jpg",
    rating: 4.9
  },
  {
    name: "Severo Garage",
    image: "SeveroGarage.jpg",
    rating: 4.8,
    products: [{
        name: "Porção de fritas",
        price: 5.75,
        type: "Entrada",
        image: "PorcaoDeFritas.jpg",
        rating: 4.7
      },
      {
        name: "Fuca",
        price: 23.00,
        type: "Burguer",
        image: "Fuca.jpg",
        rating: 4.9
      },
      {
        name: "Chevettera",
        price: 25.50,
        type: "Burguer",
        image: "Chevettera.jpg",
        rating: 4.4
      },
      {
        name: "Opalão",
        price: 29.00,
        type: "Burguer",
        image: "Opalao.jpg",
        rating: 4.7
      },
      {
        name: "Dojão",
        price: 29.00,
        type: "Burguer",
        image: "Dojao.jpg",
        rating: 4.4
      },
      {
        name: "Bike Veggie",
        price: 31.00,
        type: "Burguer",
        image: "BikeVeggie.jpg",
        rating: 5.0
      }
    ]
  }  
]

/*-------------------------------
 * /database/populate_default
 * ------------------------------*/
databaseRouter.route("/populate_default")
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Restaurant.create(restaurants, function (err) {
        if (err) {
            return next(err);
        }
        else {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({success: true});
        }
    });
});
 
/*---------------
 * Exports Module
 * --------------*/
module.exports = databaseRouter;