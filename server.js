// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Route imports
const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const statRoutes = require('./routes/statRoutes');
const couponRoutes = require('./routes/couponRoutes');
const creditCardRoutes = require('./routes/creditCardRoutes');
const adminRoutes = require('./routes/adminRoutes');  // New admin routes

const app = express();
app.use(cors());
app.use(express.json());

// Serve the "uploads" directory as a static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Route usage
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/creditcards', creditCardRoutes);  // Mount credit card route
app.use('/api/admin', adminRoutes);  // Mount admin routes

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
