const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    profilePic: String,
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model('Review', reviewSchema);