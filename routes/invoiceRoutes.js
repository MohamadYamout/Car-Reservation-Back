const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const verifyToken = require('../middleware/auth');

// Create an invoice (after payment)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { reservationId, dailyRate, extraCost } = req.body;
    // Calculate total amount
    const total = parseFloat(dailyRate) + parseFloat(extraCost);
    const invoice = new Invoice({ userId: req.user.id, reservationId, amount: total });
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get invoices for current user
router.get('/my-invoices', verifyToken, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
