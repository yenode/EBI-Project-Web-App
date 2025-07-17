const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  _id: String, // Using UUID (as string) instead of default ObjectId
  name: { type: String, required: true },
  category: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  rating: { type: Number, required: true },
  searchCount: { type: Number, default: 0 },
  description: String,
  image: String
});

module.exports = mongoose.model('Business', businessSchema);
