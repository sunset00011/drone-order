const express = require('express');
const router = express.Router();
const Drone = require('../models/Drone');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../drone-location-389204-firebase-adminsdk-aslmn-fa3d2f9355.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://drone-location-389204-default-rtdb.asia-southeast1.firebasedatabase.app',
});

// Create Drone
router.post('/', async (req, res) => {
    try {
        const drone = new Drone(req.body);
        await drone.save();

        // Add drone to Firebase Realtime Database
        const droneData = {
            lat: 21.036844,  // Set initial latitude value
            lng: 105.782701,  // Set initial longitude value
        };
        await admin.database().ref(`location/${drone._id}`).set(droneData);


        res.status(201).json(drone);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Read Drones
router.get('/', async (req, res) => {
    try {
        const drones = await Drone.find();
        res.status(200).json(drones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read Single Drone
router.get('/:droneId', async (req, res) => {
    try {
        const drone = await Drone.findById(req.params.droneId);
        if (!drone) {
            return res.status(404).json({ error: 'Drone not found' });
        }
        res.status(200).json(drone);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Drone
router.put('/:droneId', async (req, res) => {
    try {
        const drone = await Drone.findByIdAndUpdate(
            req.params.droneId,
            req.body,
            { new: true }
        );
        if (!drone) {
            return res.status(404).json({ error: 'Drone not found' });
        }
        res.status(200).json(drone);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Drone
router.delete('/:droneId', async (req, res) => {
    try {
        const drone = await Drone.findByIdAndDelete(req.params.droneId);
        if (!drone) {
            return res.status(404).json({ error: 'Drone not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
