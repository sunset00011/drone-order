const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require("../models/Cart");
const Drone = require("../models/Drone")

// Create Order
router.post('/', async (req, res) => {

    const { user } = req.body

    try {
        const order = new Order(req.body);
        await order.save();
        await Cart.deleteMany({ user: user });
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Read Orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('product') // Populate the 'product' field with product information
            .populate('user')
            .populate('drone')
            .populate('receiveLocation');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// get All Orders by status
router.post('/status', async (req, res) => {
    const { status } = req.body;
    try {
        const orders = await Order.find({ status })
            .populate('product') // Populate the 'product' field with product information
            .populate('user')
            .populate('drone')
            .populate('receiveLocation');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read Single Order
router.get('/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('product') // Populate the 'product' field with product information
            .populate('user');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Order
router.put('/:orderId', async (req, res) => {
    try {

        const order = await Order.findByIdAndUpdate(
            req.params.orderId,
            req.body,
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        console.log(order)
        try {
            if (order.drone && order.status == 'In Delivery'){
                const drone = await Drone.findById(order.drone._id);
                drone.status = "Unavailable";
                await drone.save();
            }else if(order.drone && order.status == 'Complete'){
                const drone = await Drone.findById(order.drone._id);
                drone.status = "Available";
                await drone.save();
                order.drone = null;
                await order.save();
            }
            res.status(200).json(order);
        }catch (error){
            res.status(500).json({ error: error.message });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Order
router.delete('/:orderId', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Orders by Status and User ID
router.post('/status-and-user', async (req, res) => {
    const { status, userId } = req.body;

    try {
        let query = { status };

        if (userId) {
            query.user = userId;
        }

        const orders = await Order.find(query)
            .populate('product') // Populate the 'product' field with product information
            .populate('user')
            .populate('drone')
            .populate('receiveLocation');

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Get All Orders by User ID
router.get('/user/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const orders = await Order.find({ user: userId })
            .populate('product') // Populate the 'product' field with product information
            .populate('user')
            .populate('drone')
            .populate('receiveLocation');

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Orders by Drone ID
router.get('/drone/:droneId', async (req, res) => {
    const droneId = req.params.droneId;

    try {
        const orders = await Order.find({ drone: droneId })
            .populate({
                path: 'product',
            })
            .populate({
                path: 'receiveLocation',
            });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
