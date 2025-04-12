const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const verifyToken = require('../middleware/auth');

// POST /api/reservations
// Create a new draft reservation with an empty cars array.
router.post('/', verifyToken, async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation, driverName, driverAge, pickupDateTime, dropoffDateTime } = req.body;
    const newReservation = new Reservation({
      userId: req.user.id,
      pickupLocation,
      dropoffLocation,
      driverName,
      driverAge,
      pickupDateTime,
      dropoffDateTime,
      cars: [],
      isSaved: true
    });
    const savedReservation = await newReservation.save();
    res.status(201).json(savedReservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/reservations/selectCar
// Adds a new car if carId is provided using the reservationId provided in the payload.
// If carId is not provided but lineItemId is, it removes the matching car.
router.put('/selectCar', verifyToken, async (req, res) => {
  try {
    // Expect { reservationId, carId } for adding a car.
    const { reservationId, carId, lineItemId } = req.body;
    let reservation;
    if (reservationId) {
      // Find by reservationId and user.
      reservation = await Reservation.findOne({ _id: reservationId, userId: req.user.id });
    } else {
      // Fallback: if no reservationId provided, use any draft for this user.
      reservation = await Reservation.findOne({ userId: req.user.id, isSaved: true });
    }
    
    if (!reservation) {
      if (carId) {
        // Create a new reservation if none is found.
        reservation = new Reservation({
          userId: req.user.id,
          cars: [{
            carId: carId,
            extras: [],
            insurance: "",
            fuel: "",
            gps: false
          }],
          isSaved: true
        });
      } else {
        return res.status(404).json({ error: "Reservation not found" });
      }
    } else {
      if (carId) {
        // Add car to this reservation.
        reservation.cars.push({
          carId,
          extras: [],
          insurance: "",
          fuel: "",
          gps: false
        });
      } else if (lineItemId) {
        // Remove car with the given lineItemId.
        reservation.cars = reservation.cars.filter(li => li._id.toString() !== lineItemId);
      }
    }
    
    const savedReservation = await reservation.save();
    res.status(200).json(savedReservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/reservations/updateLineItems
// Updates extra services for each line item – explicitly requires reservationId.
router.put('/updateLineItems', verifyToken, async (req, res) => {
  try {
    const { reservationId, lineItems } = req.body; // Expect reservationId in the body.
    let reservation = await Reservation.findOne({ 
      _id: reservationId, 
      userId: req.user.id, 
      isSaved: true 
    });
    if (!reservation) {
      return res.status(404).json({ error: "Draft reservation not found" });
    }
    lineItems.forEach(item => {
      const index = reservation.cars.findIndex(li => li._id.toString() === item.lineItemId);
      if (index !== -1) {
        reservation.cars[index].extras = item.extras || [];
        reservation.cars[index].insurance = item.insurance || "";
        reservation.cars[index].fuel = item.fuel || "";
        reservation.cars[index].gps = !!item.gps;
      }
    });
    const saved = await reservation.save();
    res.status(200).json(saved);
  } catch (err) {
    console.error("Error updating line items:", err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/reservations/finalize
// Finalize the reservation by marking it as not draft.
router.put('/finalize', verifyToken, async (req, res) => {
  try {
    const { reservationId } = req.body;
    let reservation = await Reservation.findOne({ _id: reservationId, userId: req.user.id });
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }
    reservation.isSaved = false;
    const updated = await reservation.save();
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/reservations/me
// Retrieve all reservations for the current user (populating car details).
router.get('/me', verifyToken, async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.user.id })
      .populate('cars.carId');
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;