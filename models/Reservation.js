const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  pickupLocation: String,
  dropoffLocation: String,
  driverName: String,
  driverAge: Number,
  pickupDateTime: Date,
  dropoffDateTime: Date,
  additionalServices: [String],
  totalPrice: Number,
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
