const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    next(error);
  }
};

// Optional middleware to check if user is the owner
const isOwner = (req, res, next) => {
  if (req.user._id.toString() !== req.params.userId) {
    return res.status(403).json({ message: 'Not authorized, not the owner' });
  }
  next();
};

module.exports = { protect, isOwner };
