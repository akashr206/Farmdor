const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check if the user is authenticated
const isAuthenticated = async (req, res, next) => {
  // Extract token from headers or cookies
  let token = req.headers.authorization || req.cookies.token;
  if (!token) {
    return res.redirect('/login'); // Redirect to login if no token is found
  }
  // Remove 'Bearer ' if token is in Authorization header
  if (token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user using the decoded user ID from the token
    const user = await User.findById(decoded.id);
    
    if (!user || user.token !== token) {
      // Token mismatch or user not found
      return res.redirect('/login');
    }

    // Attach the user to req.user for further use in the application
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized' });
  }
};

// Middleware to check if the user is a farmer
const isFarmer = (req, res, next) => {
  if (req.user && req.user.role === 'farmer') {
    next(); // Proceed if the user is a farmer
  } else {
    res.status(403).json({ message: 'Access denied: Farmers only' });
  }
};

// Middleware to check if the user is a company
const isCompany = (req, res, next) => {
  if (req.user && req.user.role === 'company') {
    next(); // Proceed if the user is a company
  } else {
    res.status(403).json({ message: 'Access denied: Companies only' });
  }
};

module.exports = { isAuthenticated, isFarmer, isCompany };
