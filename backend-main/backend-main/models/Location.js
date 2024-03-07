const mongoose = require('mongoose');
const { Schema } = mongoose;
const LocationSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    lat: {
        type: Number,
        required: true,
    },
    long: {
        type: Number,
        required: true,
    },
})

module.exports = mongoose.model("location", LocationSchema)