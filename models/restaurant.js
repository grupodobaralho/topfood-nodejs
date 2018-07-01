const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Comment Schema
const commentSchema = new Schema ({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    text: {
        type: String,
        required: true
    },
    image: {
        type: String
    }
},{
    timestamps: true
});

// Product Schema
const productSchema = new Schema ({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        default: null
    },
    type: {
        type: String,
        default: null
    },
    image: {
        type: String,
        default: null
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    comments: [commentSchema]
},{
    timestamps: true
});

// Restaurant Schema
const restaurantSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    products: [productSchema]
},{
    timestamps: true
});

module.exports = mongoose.model("Restaurant", restaurantSchema);