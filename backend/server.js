// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const Business = require('./models/Business');
// const Review = require('./models/Review');

// const app = express();
// app.use(cors());
// app.use(express.json());


// // Route files
// const businessRoutes = require('./routes/businessRoutes');

// // Route registration
// app.use('/api/businesses', businessRoutes);  // <== THIS IS CRUCIAL


// mongoose.connect(process.env.MONGO_URI).then(() => {
//   console.log('✅ MongoDB connected');
// });

// app.get('/api/businesses/category/:category', async (req, res) => {
//   const data = await Business.find({ category: req.params.category });
//   res.json(data);
// });

// app.get('/api/businesses/top-rated', async (req, res) => {
//   const data = await Business.find().sort({ rating: -1 }).limit(5);
//   res.json(data);
// });

// app.get('/api/businesses/most-searched', async (req, res) => {
//   const data = await Business.find().sort({ searchCount: -1 }).limit(5);
//   res.json(data);
// });

// app.get('/api/search', async (req, res) => {
//   const query = req.query.q;
//   const data = await Business.find({ name: new RegExp(query, 'i') });
//   res.json(data);
// });

// app.get('/api/reviews/:businessId', async (req, res) => {
//   const data = await Review.find({ businessId: req.params.businessId });
//   res.json(data);
// });

// app.listen(3000, () => {
//   console.log('🚀 Server running on http://localhost:3000');
// });

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Business = require('./models/Business');
const Review = require('./models/Review');

const app = express();
app.use(cors());
app.use(express.json());

// Route files
const businessRoutes = require('./routes/businessRoutes');

// Route registration
app.use('/api/businesses', businessRoutes);  // <== THIS IS CRUCIAL

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('✅ MongoDB connected');
});

app.get('/api/businesses/category/:category', async (req, res) => {
  const data = await Business.find({ category: req.params.category });
  res.json(data);
});

app.get('/api/businesses/top-rated', async (req, res) => {
  const data = await Business.find().sort({ rating: -1 }).limit(5);
  res.json(data);
});

app.get('/api/businesses/most-searched', async (req, res) => {
  const data = await Business.find().sort({ searchCount: -1 }).limit(5);
  res.json(data);
});

app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  const data = await Business.find({ name: new RegExp(query, 'i') });
  res.json(data);
});

app.get('/api/reviews/:businessId', async (req, res) => {
  const data = await Review.find({ businessId: req.params.businessId });
  res.json(data);
});

// Add a test endpoint for connection checking
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API connection successful' });
});

// Listen on all network interfaces, not just localhost
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Access locally via: http://localhost:${PORT}`);
  
  // Try to get network IP for easy reference
  try {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (loopback) addresses
        if (net.family === 'IPv4' && !net.internal) {
          console.log(`Network access via: http://${net.address}:${PORT}`);
        }
      }
    }
  } catch (err) {
    console.log('Could not determine network IP addresses');
  }
});