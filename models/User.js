const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'company'], required: true },
  city: {type: String},
  location: { // New location field for storing coordinates
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: Array , required: true } // [longitude, latitude]
  },
  token : {type: String},

}, { timestamps: true });

// Hash password before saving user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ location: '2dsphere' }); // Create a 2dsphere index for geolocation

const User = mongoose.model('User', userSchema);

module.exports = User;
