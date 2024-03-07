const mongoose = require('mongoose');
const { Schema } = mongoose;
const DroneSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    maxSpeed: {
        type: Number,
        required: true
    },
    payLoad: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Available', 'Unavailable'],
        default: 'Available',
    },
    condition: {
        type: String,
        enum: ['Good', 'Medium', 'Low'],
        default: 'Good',
    },
})

module.exports = mongoose.model("drone", DroneSchema)