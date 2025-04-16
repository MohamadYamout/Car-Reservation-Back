// Car-Reservation-Back/routes/reservationRoutes.js

const express     = require('express');
const router      = express.Router();
const Reservation = require('../models/Reservation');
const User        = require('../models/User');
const verifyToken = require('../middleware/auth');

/**
 * Helper: fetches all reservations for a user (ignoring isSaved),
 * counts total cars, computes points (500 per 10 cars, resets at 1500),
 * and writes back to User.points.
 */
async function recalcPoints(userId) {
  // 1) fetch every reservation for this user
  const allReservations = await Reservation.find({ userId });

  // 2) count total cars across all reservations
  const totalCars = allReservations.reduce(
    (sum, r) => sum + (Array.isArray(r.cars) ? r.cars.length : 0),
    0
  );

  // 3) compute points: 500 per 10 cars, wrap at 1500
  const points = (Math.floor(totalCars / 10) * 500) % 1500;

  // 4) persist to user document
  await User.findByIdAndUpdate(userId, { points });
}

/**
 * POST /api/reservations
 * Create a new draft reservation with an empty cars array.
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      pickupLocation,
      dropoffLocation,
      driverName,
      driverAge,
      pickupDateTime,
      dropoffDateTime
    } = req.body;

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

    const saved = await newReservation.save();

    // Recalculate points (counts empty/new drafts too)
    await recalcPoints(req.user.id);

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /api/reservations/selectCar
 * Adds a new car (if carId) or removes one (if lineItemId),
 * then recalculates points.
 */
router.put('/selectCar', verifyToken, async (req, res) => {
  try {
    const { reservationId, carId, lineItemId } = req.body;
    let reservation;

    if (reservationId) {
      reservation = await Reservation.findOne({ _id: reservationId, userId: req.user.id });
    } else {
      reservation = await Reservation.findOne({ userId: req.user.id, isSaved: true });
    }

    if (!reservation) {
      if (!carId) {
        return res.status(404).json({ error: 'Reservation not found' });
      }
      // create new draft with first car
      reservation = new Reservation({
        userId: req.user.id,
        cars: [{ carId, extras: [], insurance: '', fuel: '', gps: false }],
        isSaved: true
      });
    } else {
      if (carId) {
        reservation.cars.push({ carId, extras: [], insurance: '', fuel: '', gps: false });
      } else if (lineItemId) {
        if (reservation.cars.length <= 1) {
          return res.status(400).json({ error: 'At least one car must be reserved.' });
        }
        reservation.cars = reservation.cars.filter(li => li._id.toString() !== lineItemId);
      }
    }

    const saved = await reservation.save();
    const populated = await Reservation.findById(saved._id).populate('cars.carId');

    // Recalculate points now that car count changed
    await recalcPoints(req.user.id);

    res.status(200).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /api/reservations/updateLineItems
 * Updates extras/insurance/fuel/gps for each line item,
 * then recalculates points (even though car count hasn’t changed).
 */
router.put('/updateLineItems', verifyToken, async (req, res) => {
  try {
    const { reservationId, lineItems } = req.body;
    const reservation = await Reservation.findOne({
      _id: reservationId,
      userId: req.user.id,
      isSaved: true
    });
    if (!reservation) {
      return res.status(404).json({ error: 'Draft reservation not found' });
    }

    lineItems.forEach(item => {
      const idx = reservation.cars.findIndex(li => li._id.toString() === item.lineItemId);
      if (idx !== -1) {
        reservation.cars[idx].extras    = item.extras    || [];
        reservation.cars[idx].insurance = item.insurance || '';
        reservation.cars[idx].fuel      = item.fuel      || '';
        reservation.cars[idx].gps       = !!item.gps;
      }
    });

    const saved = await reservation.save();

    // Recalculate points (safe to do here)
    await recalcPoints(req.user.id);

    res.status(200).json(saved);
  } catch (err) {
    console.error('Error updating line items:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /api/reservations/finalize
 * Marks a reservation as finalized (isSaved = false),
 * then recalculates points.
 */
router.put('/finalize', verifyToken, async (req, res) => {
  try {
    const { reservationId } = req.body;
    const reservation = await Reservation.findOne({ _id: reservationId, userId: req.user.id });
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    reservation.isSaved = false;
    const updated = await reservation.save();

    // Final recalculation now that this reservation is finalized
    await recalcPoints(req.user.id);

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/reservations/me
 * Retrieves all reservations for the current user (populating car details).
 */
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
