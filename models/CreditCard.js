const mongoose = require('mongoose');
const crypto = require('crypto');

// Use an encryption algorithm and keys (ensure these are defined in your .env)
const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.CRYPTO_KEY || '01234567890123456789012345678901'); // Must be 32 bytes
const iv = Buffer.from(process.env.CRYPTO_IV || '0123456789012345'); // Must be 16 bytes

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Define the Credit Card schema with a uniqueness constraint on userId.
const creditCardSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true  // Ensure no two records share the same userId.
  },
  cardHolderName: { type: String, required: true },
  cardNumber: { type: String, required: true },
  expiryMonth: { type: Number, required: true },
  expiryYear: { type: Number, required: true },
  cvv: { type: String, required: true },
  cardType: { type: String, required: true } // For example "Visa" or "Other"
}, { timestamps: true });

// Encrypt sensitive fields before saving and auto-detect card type.
creditCardSchema.pre('save', function(next) {
  // If cardType is not explicitly set, detect it based on cardNumber.
  if (!this.cardType) {
    // Simple regex for Visa: starts with 4 and has 13 or 16 digits.
    if (/^4\d{12}(?:\d{3})?$/.test(this.cardNumber)) {
      this.cardType = 'Visa';
    } else {
      this.cardType = 'Other';
    }
  }
  if (this.isModified('cardNumber')) {
    this.cardNumber = encrypt(this.cardNumber);
  }
  if (this.isModified('cvv')) {
    this.cvv = encrypt(this.cvv);
  }
  next();
});

module.exports = mongoose.model('CreditCard', creditCardSchema);