const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');
const router = express.Router();
dotenv.config();
// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register Route
router.post('/register', async (req, res) => {
  let { name, email, password, role } = req.body;
  name = name.replace(name[0], name[0].toUpperCase())
  const location = { type: 'Point', coordinates: [Number(req.body.longitude), Number(req.body.latitude)] };
  let response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${location.coordinates[1]}&lon=${location.coordinates[0]}&format=json`);
  let data = await response.json()
  let city = data.address.city || data.address.state_district
  
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      city,
      location: location, // Default location if not provided
      token: ''
    });

    // Generate token
    const token = generateToken(user._id);
    user.token = token; // Save token in the user's record in the database
    await user.save();

    // Store token in cookies
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });


    // Send response
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in registration', error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
 
  try { 
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Generate token
      const token = generateToken(user._id);
      user.token = token; // Save token in user's record
      await user.save();

      // Store token in cookies
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.cookie('role', user.role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Send response with user info
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });


    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error in login', error: error.message });
  }
});


// Logout Route (optional for removing token)
router.post('/logout', (req, res) => {
  let token = req.cookies.token
  let role = req.cookies.role
  if (token && role) {
    res.clearCookie('token'); // Clear token from cookies
    res.clearCookie('role')
    res.json({ message: 'Logged out successfully' });
  } else {
    res.json({ message: "Error Logging out" });
  }
});

module.exports = router;
