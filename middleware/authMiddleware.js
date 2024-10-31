const jwt = require('jsonwebtoken');
const User = require('../models/User');


const isAuthenticated = async (req, res, next) => {
  
  let token = req.headers.authorization || req.cookies.token;
  if (!token) {
    return res.redirect('/login'); 
  }
  
  if (token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    const user = await User.findById(decoded.id);
    
    if (!user || user.token !== token) {
      
      return res.redirect('/login');
    }

    
    req.user = user;

    
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized' });
  }
};


const isFarmer = (req, res, next) => {
  if (req.user && req.user.role === 'farmer') {
    next(); 
  } else {
    res.status(403).json({ message: 'Access denied: Farmers only' });
  }
};


const isCompany = (req, res, next) => {
  if (req.user && req.user.role === 'company') {
    next(); 
  } else {
    res.status(403).json({ message: 'Access denied: Companies only' });
  }
};

module.exports = { isAuthenticated, isFarmer, isCompany };
