const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const verifyToken = require('../middleware/auth');

// Create an invoice (after payment)
router.post('/', verifyToken, async (req, res) => {
  try {
    const invoice = new Invoice({ ...req.body, userId: req.user.id });
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