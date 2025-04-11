const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, email, password, phone } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    // Include the phone field when creating the new user
    const user = new User({ username, email, password: hashed, phone });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: 'Signup failed', details: err.message });
  }
});


// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
    res.json({ token, user: { username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /profile - Protected route that returns the user details for the logged-in user.
router.get('/profile', async (req, res) => {
  try {
    // Expect the JWT token in the Authorization header in the format "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Return full user details
    res.json({
      username: user.username,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      address: user.address || ""
    });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

module.exports = router;
