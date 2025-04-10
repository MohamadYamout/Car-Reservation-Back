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

// New endpoint to update the selected car for the reservation
router.put('/selectCar', verifyToken, async (req, res) => {
  try {
    const { carId } = req.body; // carId can be null to deselect the car
    // Look for an existing saved (draft) reservation for the user
    let reservation = await Reservation.findOne({ userId: req.user.id, isSaved: true });
    if (!reservation) {
      // If no draft exists, create a new reservation with the carId
      reservation = new Reservation({ userId: req.user.id, carId: carId, isSaved: true });
    } else {
      // Update the existing reservation: set carId or clear it if the value is null
      reservation.carId = carId;
    }
    const savedReservation = await reservation.save();
    res.status(200).json(savedReservation);
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