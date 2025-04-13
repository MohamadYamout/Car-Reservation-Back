const mongoose = require('mongoose');
require('dotenv').config();

const Coupon = require('./models/Coupon');

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(async () => {
    console.log("MongoDB connected.");

    // Define dummy coupons (set expiresAt to 30 days in the future)
    const coupons = [
      { code: "DISCOUNT10", discountPercentage: 10, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { code: "SUMMER15", discountPercentage: 15, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { code: "WINTER20", discountPercentage: 20, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    ];

    // Remove existing coupons and insert dummy data
    await Coupon.deleteMany({});
    await Coupon.insertMany(coupons);
    console.log("Dummy coupons added successfully.");

    mongoose.disconnect();
  })
  .catch(err => console.error("Error connecting to MongoDB:", err));
