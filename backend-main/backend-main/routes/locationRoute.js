const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// Create Location
router.post('/', async (req, res) => {
    try {
        const location = new Location(req.body);
        await location.save();
        res.status(201).json(location);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Read Locations
router.get('/', async (req, res) => {
    try {
        const locations = await Location.find();
        res.status(200).json(locations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read Single Location
router.get('/:locationId', async (req, res) => {
    try {
        const location = await Location.findById(req.params.locationId);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.status(200).json(location);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Location
router.put('/:locationId', async (req, res) => {
    try {
        const location = await Location.findByIdAndUpdate(
            req.params.locationId,
            req.body,
            { new: true }
        );
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.status(200).json(location);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Location
router.delete('/:locationId', async (req, res) => {
    try {
        const location = await Location.findByIdAndDelete(req.params.locationId);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
