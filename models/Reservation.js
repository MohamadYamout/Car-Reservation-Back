const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  // Each car can have its own extras, insurance, fuel, GPS, etc.
  extras: [String],
  insurance: { type: String, default: "" },
  fuel: { type: String, default: "" },
  gps: { type: Boolean, default: false }
});

const reservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // An array of line items (each gets its own _id)
  cars: [lineItemSchema],
  pickupLocation: String,
  dropoffLocation: String,
  driverName: String,
  driverAge: Number,
  pickupDateTime: Date,
  dropoffDateTime: Date,
  totalPrice: Number,
  isSaved: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);