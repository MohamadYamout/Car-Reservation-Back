const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer  = require('multer');
const path = require('path');
const User = require('../models/User');
const router = express.Router();

// JWT authentication middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    req.user = decoded;
    next();
  });
};

// Multer storage configuration for profile pictures
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/profilePictures');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const userId = req.user ? req.user.id : 'unknownUser';
    cb(null, userId + '-' + Date.now() + ext);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 2 } // 2 MB limit
});

// POST /signup
router.post('/signup', async (req, res) => {
  const { username, email, password, phone } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
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

// GET /profile - Protected route to get user details (including points)
router.get('/profile', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      username:       user.username,
      email:          user.email,
      phone:          user.phone,
      createdAt:      user.createdAt,
      points:         user.points,
      profilePicture: user.profilePicture
    });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// POST /profile/upload - Upload a new profile picture
router.post('/profile/upload', authenticateJWT, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileName = req.file.filename;
    const fullUrlPath = `${req.protocol}://${req.get('host')}/uploads/profilePictures/${fileName}`;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.profilePicture = fullUrlPath;
    await user.save();
    res.json({ message: 'Profile picture updated successfully', profilePicture: user.profilePicture });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;