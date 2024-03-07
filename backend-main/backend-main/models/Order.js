const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema Order
const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['In Progress', 'In Delivery', 'Complete', 'Return'],
        default: 'In Progress',
    },
    address: {
        type: String,
        required: true,
    },
    zipCode: {
        type: String,
        required: false,
    },
    city: {
        type: String,
        required: true,
    },
    userState: {
        type: String,
        required: false,
    },
    lat: {
        type: Number,
        required: true,
    },
    long: {
        type: Number,
        required: true,
    },
    drone: {
        type: Schema.Types.ObjectId,
        ref: 'drone',
        required: false,
    },
    receiveLocation: {
        type: Schema.Types.ObjectId,
        ref: 'location',
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: null,
    },
});

// Model Order
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;