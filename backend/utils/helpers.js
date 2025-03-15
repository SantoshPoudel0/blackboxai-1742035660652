const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs').promises;

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Format error messages
const formatError = (error) => {
  if (error.name === 'ValidationError') {
    return {
      message: 'Validation Error',
      errors: Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }))
    };
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return {
      message: 'Duplicate Field Error',
      errors: [{
        field,
        message: `${field} already exists`
      }]
    };
  }

  return {
    message: error.message || 'Internal Server Error',
    errors: null
  };
};

// Handle file deletion
const deleteFile = async (filePath) => {
  try {
    if (!filePath) return;
    
    const fullPath = path.join(process.env.UPLOAD_PATH || 'uploads/', filePath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

// Pagination helper
const getPagination = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return {
    skip,
    limit: parseInt(limit)
  };
};

// Create slug from string
const createSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-')     // Replace multiple - with single -
    .substring(0, 50);        // Trim to 50 chars
};

// Format date for responses
const formatDate = (date) => {
  return new Date(date).toISOString();
};

// Sanitize user data for responses
const sanitizeUser = (user) => {
  const { password, __v, ...sanitizedUser } = user.toObject();
  return sanitizedUser;
};

// Check if string is valid MongoDB ObjectId
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

module.exports = {
  generateToken,
  formatError,
  deleteFile,
  getPagination,
  createSlug,
  formatDate,
  sanitizeUser,
  isValidObjectId
};
