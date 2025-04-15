const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    profilePic: String,
    rating: Number,
    title: String,  // New field for the review title
    comment: String,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);