// models/Product.js
const mongoose = require('mongoose');

const connectSchema = new mongoose.Schema({
  from: {type: String, required: true},
  fromName: {type: String, required: true},
  to: {type: String, required: true},
  toName: {type: String, required: true},
  status: {type: String, required: true}
}, { timestamps: true }); // Automatically manage createdAt and updatedAt timestamps

const Connect = mongoose.model('Connect', connectSchema);

module.exports = Connect;
