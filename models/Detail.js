
const mongoose = require('mongoose');

const detailSchema = new mongoose.Schema({
  email: {type: String, required: true},
  password: {type: String, required: true},
}, { timestamps: true });
const Detail = mongoose.model('Detail', detailSchema);

module.exports = Detail;
