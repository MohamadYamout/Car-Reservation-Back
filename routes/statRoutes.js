const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const Reservation = require('../models/Reservation');

// Get stats: most popular car, avg rental price
router.get('/summary', async (req, res) => {
  try {
    const popular = await Reservation.aggregate([
      { $group: { _id: '$carId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const avg = await Car.aggregate([
      { $group: { _id: null, avgPrice: { $avg: '$dailyPrice' } } }
    ]);

    res.json({
      mostPopularCarId: popular[0]?._id || null,
      averageDailyPrice: avg[0]?.avgPrice || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;