const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Car = require('../models/Car');
const Reservation = require('../models/Reservation');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const mongoose = require('mongoose');

// Middleware to check admin status
router.use(auth);
router.use(isAdmin);

// USER MANAGEMENT
// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single user
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create user
router.post('/users', async (req, res) => {
  try {
    const { username, email, phone, password, isAdmin } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Create new user
    const newUser = new User({
      username,
      email,
      phone,
      password, // In a real app, hash this password
      isAdmin: isAdmin || false
    });
    
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { username, email, phone, isAdmin, points } = req.body;
    
    // If updating email, check it's not already taken
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { 
        username, 
        email, 
        phone, 
        isAdmin, 
        points,
        // Don't update password here
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CAR MANAGEMENT
// Get all cars
router.get('/cars', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single car
router.get('/cars/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create car
router.post('/cars', async (req, res) => {
  try {
    const {
      brand,
      model,
      group,
      engineSize,
      doors,
      passengers,
      fuelType,
      gearbox,
      hasAC,
      electricWindows,
      image,
      dailyPrice
    } = req.body;
    
    const newCar = new Car({
      brand,
      model,
      group,
      engineSize,
      doors,
      passengers,
      fuelType,
      gearbox,
      hasAC,
      electricWindows,
      image,
      dailyPrice
    });
    
    await newCar.save();
    res.status(201).json(newCar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update car
router.put('/cars/:id', async (req, res) => {
  try {
    const {
      brand,
      model,
      group,
      engineSize,
      doors,
      passengers,
      fuelType,
      gearbox,
      hasAC,
      electricWindows,
      image,
      dailyPrice
    } = req.body;
    
    const car = await Car.findByIdAndUpdate(
      req.params.id, 
      {
        brand,
        model,
        group,
        engineSize,
        doors,
        passengers,
        fuelType,
        gearbox,
        hasAC,
        electricWindows,
        image,
        dailyPrice
      },
      { new: true, runValidators: true }
    );
    
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete car
router.delete('/cars/:id', async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json({ message: 'Car deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CAR GROUPS
// Get all car groups (unique values)
router.get('/car-groups', async (req, res) => {
  try {
    const groups = await Car.distinct('group');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RESERVATION MANAGEMENT (Read and Update only)
// Get all reservations
router.get('/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('userId', 'username email phone')
      .populate('cars.carId');
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single reservation
router.get('/reservations/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('userId', 'username email phone')
      .populate('cars.carId');
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update reservation
router.put('/reservations/:id', async (req, res) => {
  try {
    const { 
      pickupLocation, 
      dropoffLocation, 
      driverName, 
      driverAge, 
      pickupDateTime, 
      dropoffDateTime, 
      totalPrice 
    } = req.body;
    
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id, 
      {
        pickupLocation, 
        dropoffLocation, 
        driverName, 
        driverAge, 
        pickupDateTime, 
        dropoffDateTime, 
        totalPrice
      },
      { new: true, runValidators: true }
    )
    .populate('userId', 'username email phone')
    .populate('cars.carId');
    
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POINTS MANAGEMENT (Read only)
// Get all users with their points
router.get('/points', async (req, res) => {
  try {
    const users = await User.find().select('username email points');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 