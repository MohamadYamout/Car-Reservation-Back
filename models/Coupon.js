const mongoose = require('mongoose');
const couponSchema = new mongoose.Schema({
    code: String,
    discountPercentage: Number,
    expiresAt: Date
  });
  
  module.exports = mongoose.model('Coupon', couponSchema);