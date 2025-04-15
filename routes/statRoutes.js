const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');

router.get('/popular-car', async (req, res) => {
  try {
    // Aggregation pipeline to count all reservations per car,
    // join the car details using $lookup, then sort by count and by dailyPrice.
    const result = await Reservation.aggregate([
      { $unwind: "$cars" },
      { $group: { _id: "$cars.carId", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "cars",         // the collection name (make sure it's correct; usually lowercased plural)
          localField: "_id",
          foreignField: "_id",
          as: "carDetails"
        }
      },
      { $unwind: "$carDetails" },
      // Sort first by count descending and then by carDetails.dailyPrice descending
      { $sort: { count: -1, "carDetails.dailyPrice": -1 } },
      { $limit: 1 },
      {
        $project: {
          _id: 0,
          brand: "$carDetails.brand",
          model: "$carDetails.model",
          dailyPrice: "$carDetails.dailyPrice",
          image: "$carDetails.image",
          reservationsCount: "$count"
        }
      }
    ]);

    // If no data found, return default values.
    if (!result.length) {
      return res.status(200).json({
        brand: "No Data",
        model: "No Data",
        dailyPrice: 0,
        image: "placeholder-image.jpg",
        reservationsCount: 0
      });
    }

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// (Optional) The summary endpoint remains unchanged or can be adjusted similarly if needed.
router.get('/summary', async (req, res) => {
  try {
    const popular = await Reservation.aggregate([
      { $unwind: "$cars" },
      { $group: { _id: "$cars.carId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const avg = await Reservation.aggregate([
      { $unwind: "$cars" },
      {
        $lookup: {
          from: "cars",
          localField: "cars.carId",
          foreignField: "_id",
          as: "carDetails"
        }
      },
      { $unwind: "$carDetails" },
      { $group: { _id: null, avgPrice: { $avg: "$carDetails.dailyPrice" } } }
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
