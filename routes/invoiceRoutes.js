const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const verifyToken = require('../middleware/auth');

// Create an invoice (after payment, saving a draft or cancellation)
router.post('/', verifyToken, async (req, res) => {
  try {
    // Extract the invoice information from the request body.
    const { reservationId, amount, status } = req.body;
    // Parse the amount to ensure it's valid.
    const total = parseFloat(amount);
    // Create a new invoice using the client-provided status.
    const invoice = new Invoice({
      userId: req.user.id,
      reservationId,
      amount: total,
      status: status || "incomplete"
    });
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