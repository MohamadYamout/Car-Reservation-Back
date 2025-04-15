const express = require('express');
const router = express.Router();
const CreditCard = require('../models/CreditCard');
const verifyToken = require('../middleware/auth');
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.CRYPTO_KEY || '01234567890123456789012345678901'); // Must be 32 bytes
const iv = Buffer.from(process.env.CRYPTO_IV || '0123456789012345'); // Must be 16 bytes

// Utility function to decrypt a field.
function decrypt(text) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(text, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// POST route: Save a new credit card if none exists for the user.
router.post('/', verifyToken, async (req, res) => {
  try {
    const { cardHolderName, cardNumber, expiryMonth, expiryYear, cvv } = req.body;
    if (!cardHolderName || !cardNumber || !expiryMonth || !expiryYear || !cvv) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if any credit card is already stored for this user.
    const existingCard = await CreditCard.findOne({ userId: req.user.id });
    if (existingCard) {
      return res.status(400).json({ error: "A credit card is already associated with your account." });
    }

    // Determine card type using a regex for Visa cards.
    let cardType = 'Other';
    if (/^4\d{12}(?:\d{3})?$/.test(cardNumber)) {
      cardType = 'Visa';
    }

    const newCard = new CreditCard({
      userId: req.user.id,
      cardHolderName,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      cardType
    });
    const savedCard = await newCard.save();
    res.status(201).json({ message: "Credit card saved.", creditCard: savedCard });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET route: Retrieve the stored credit card for the logged-in user and decrypt sensitive fields.
router.get('/me', verifyToken, async (req, res) => {
  try {
    const card = await CreditCard.findOne({ userId: req.user.id });
    if (!card) {
      return res.status(404).json({ error: "No credit card found." });
    }
    // Decrypt sensitive fields before sending them to the client.
    const decryptedCard = {
      cardHolderName: card.cardHolderName,
      cardNumber: decrypt(card.cardNumber),
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cvv: decrypt(card.cvv),
      cardType: card.cardType
    };
    res.json({ creditCard: decryptedCard });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
