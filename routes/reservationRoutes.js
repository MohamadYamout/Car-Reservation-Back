const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const verifyToken = require('../middleware/auth');

// Create reservation (protected route)
router.post('/', verifyToken, async (req, res) => {
  try {
    const reservation = new Reservation({ ...req.body, userId: req.user.id });
    const saved = await reservation.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get reservations of current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.user.id }).populate('carId');
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;