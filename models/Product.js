// models/Product.js

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Farmer ID
  location: { // Location as a GeoJSON object
    type: {
      type: String, // 'Point'
      enum: ['Point'], // Specify that the type can only be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number], 
      required: true,
    },
  },
  city: {type: String, required: true},
}, { timestamps: true }); // Automatically manage createdAt and updatedAt timestamps

// Create 2dsphere index for geospatial queries
productSchema.index({ location: '2dsphere' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
