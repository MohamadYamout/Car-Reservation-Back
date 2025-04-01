const mongoose = require('mongoose');
const invoiceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
    amount: Number,
    issuedAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model('Invoice', invoiceSchema);
  