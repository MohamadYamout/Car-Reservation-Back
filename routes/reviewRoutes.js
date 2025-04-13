const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User'); // Import the User model
const verifyToken = require('../middleware/auth');

// POST a review
router.post('/', verifyToken, async (req, res) => {
  try {
    // Look up the logged in user using the id provided by verifyToken middleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a new review document using user's username and profilePicture
    const review = new Review({
      userId: user._id,
      name: user.username, // Use the username field from User.js
      profilePic: user.profilePicture || '',
      rating: req.body.rating,
      comment: req.body.comment
      // The date field defaults to Date.now() as set in the Review schema
    });

    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET 3 random reviews (with a fallback to user.username and profilePicture if needed)
router.get('/random', async (req, res) => {
  try {
    // Aggregation pipeline with $lookup to join the User collection
    const reviews = await Review.aggregate([
      { $sample: { size: 3 } },
      {
        $lookup: {
          from: "users",           // collection name (MongoDB converts model name to lowercase plural)
          localField: "userId",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { 
        $unwind: { 
          path: "$userInfo", 
          preserveNullAndEmptyArrays: true 
        } 
      },
      {
        // If the review's name is missing, use the username from the User document
        $addFields: {
          name: {
            $cond: [
              { $or: [ { $eq: ["$name", null] }, { $eq: ["$name", ""] } ] },
              "$userInfo.username",
              "$name"
            ]
          },
          profilePic: {
            $cond: [
              { $or: [ { $eq: ["$profilePic", null] }, { $eq: ["$profilePic", ""] } ] },
              "$userInfo.profilePicture",
              "$profilePic"
            ]
          }
        }
      },
      {
        $project: { userInfo: 0 } // Remove the temporary lookup field
      }
    ]);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET paginated or all reviews
router.get('/', async (req, res) => {
  try {
    if (req.query.all && req.query.all === 'true') {
      // Return all reviews if ?all=true is provided
      const reviews = await Review.find();
      res.json(reviews);
    } else {
      // Otherwise, return paginated reviews (default: 5 per page)
      const page = parseInt(req.query.page) || 1;
      const limit = 5;
      const reviews = await Review.find()
        .skip((page - 1) * limit)
        .limit(limit);
      res.json(reviews);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
