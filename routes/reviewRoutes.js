const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const verifyToken = require('../middleware/auth');

// Post a review
router.post('/', verifyToken, async (req, res) => {
  try {
    const review = new Review({ ...req.body, userId: req.user.id });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get random 3 reviews
router.get('/random', async (req, res) => {
  try {
    const reviews = await Review.aggregate([{ $sample: { size: 3 } }]);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Paginated reviews
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const reviews = await Review.find()
      .skip((page - 1) * limit)
      .limit(limit);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
