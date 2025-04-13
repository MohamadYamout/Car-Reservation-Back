const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountPercentage: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false } // New field to ensure coupon is used only once
});

module.exports = mongoose.model('Coupon', couponSchema);
