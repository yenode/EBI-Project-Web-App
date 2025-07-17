const express = require('express');
const router = express.Router();
const Business = require('../models/Business');

// GET /api/businesses?category=Restaurant
router.get('/', async (req, res) => {
  try {
    const category = req.query.category;
    if (category) {
      const businesses = await Business.find({ category });
      res.json(businesses);
    } else {
      res.status(400).json({ error: 'Category is required' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
