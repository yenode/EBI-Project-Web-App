require('dotenv').config();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Business = require('../models/Business');
const Review = require('../models/Review');

const categories = [
  "Cafe", "Restaurant", "Salon", "Grocery", "Electronics",
  "Mobile Repair", "Pharmacy", "Tailor", "Fitness", "Books"
];

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    const businesses = [];
    const reviews = [];

    for (const category of categories) {
      for (let i = 1; i <= 5; i++) {
        const id = uuidv4();
        const business = new Business({
          _id: id,
          name: `${category} Business ${i}`,
          category,
          address: `${category} Area ${i}, Prayagraj`,
          location: {
            lat: 25.45 + Math.random() * 0.02 - 0.01,
            lng: 81.85 + Math.random() * 0.02 - 0.01
          },
          rating: +(Math.random() * 1.5 + 3.5).toFixed(1),
          searchCount: Math.floor(Math.random() * 91 + 10),
          description: `Popular ${category.toLowerCase()} place in Prayagraj`,
          image: `https://example.com/${category.toLowerCase()}${i}.jpg`
        });

        const review = new Review({
          businessId: id,
          user: `User_${i}`,
          rating: +(Math.random() * 1.5 + 3.5).toFixed(1),
          comment: `Review ${i} for ${category} Business ${i}`
        });

        businesses.push(business);
        reviews.push(review);
      }
    }

    await Business.insertMany(businesses);
    await Review.insertMany(reviews);
    console.log('✅ Seed data inserted');
  } catch (error) {
    console.error('❌ Error inserting seed data:', error);
  } finally {
    mongoose.disconnect();
  }
}

seedData();
