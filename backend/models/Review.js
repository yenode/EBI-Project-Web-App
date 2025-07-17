const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  businessId: { type: String, required: true, ref: 'Business' }, // String to match UUID type
  user: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);
