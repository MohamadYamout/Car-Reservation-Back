const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon'); // Adjust the path as necessary

// GET endpoint to retrieve coupon details by coupon code
router.get('/:code', async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code });
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    // Check if coupon is expired
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ error: 'Coupon expired' });
    }
    // Check if coupon has already been used
    if (coupon.used) {
      return res.status(400).json({ error: 'Coupon already used' });
    }
    // Return only the discount percentage to the frontend
    return res.json({ discountPercentage: coupon.discountPercentage });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// PUT endpoint to mark a coupon as used
router.put('/use/:code', async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code });
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    if (coupon.used) {
      return res.status(400).json({ error: 'Coupon already used' });
    }
    coupon.used = true;
    await coupon.save();
    return res.json({ message: 'Coupon marked as used.' });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
