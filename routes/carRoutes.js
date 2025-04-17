// carRoutes.js
const express = require('express');
const Car = require('../models/Car');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Get all cars
router.get('/', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get distinct car groups from the Car collection
router.get('/groups', async (req, res) => {
  try {
    // Use Mongoose distinct to return unique group names
    const groups = await Car.distinct('group');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get cars by group name
router.get('/group/:groupName', async (req, res) => {
  try {
    const groupName = req.params.groupName;
    const carsByGroup = await Car.find({ group: groupName });
    res.json(carsByGroup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one car by ID
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new car - admin only
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const newCar = new Car(req.body);
    const savedCar = await newCar.save();
    res.status(201).json(savedCar);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a car
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCar);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a car - admin only
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;


