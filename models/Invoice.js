const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
  amount: Number,
  status: { 
    type: String, 
    enum: ["complete", "incomplete", "cancelled"],
    default: "incomplete"
  },
  issuedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);