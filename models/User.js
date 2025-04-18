const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:       { type: String, required: true },
  email:          { type: String, unique: true, required: true },
  phone:          { type: String, required: true },
  password:       { type: String, required: true },
  isAdmin:        { type: Boolean, default: false },
  points:         { type: Number, default: 0 },
  profilePicture: { type: String, default: "/assets/images/default-avatar.png" } // New field
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);