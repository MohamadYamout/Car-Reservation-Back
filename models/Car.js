const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  brand: String,
  model: String,
  group: String,
  engineSize: Number,
  doors: Number,
  passengers: Number,
  fuelType: String,
  gearbox: String,
  hasAC: Boolean,
  electricWindows: Boolean,
  image: String,
  dailyPrice: Number,
});

module.exports = mongoose.model('Car', carSchema);