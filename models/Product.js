
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Farmer ID
  location: { 
    type: {
      type: String, 
      enum: ['Point'], 
      required: true,
    },
    coordinates: {
      type: [Number], 
      required: true,
    },
  },
  city: {type: String, required: true},
}, { timestamps: true }); 
productSchema.index({ location: '2dsphere' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
