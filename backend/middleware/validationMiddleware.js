const { validationResult } = require('express-validator');

// Middleware to check for validation errors
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }))
    });
  }
  next();
};

// Common validation rules
const userValidation = {
  username: {
    trim: true,
    isLength: {
      options: { min: 3 },
      errorMessage: 'Username must be at least 3 characters long'
    },
    matches: {
      options: [/^[a-zA-Z0-9_]+$/],
      errorMessage: 'Username can only contain letters, numbers and underscores'
    }
  },
  email: {
    isEmail: {
      errorMessage: 'Must be a valid email address'
    },
    normalizeEmail: true
  },
  password: {
    isLength: {
      options: { min: 6 },
      errorMessage: 'Password must be at least 6 characters long'
    }
  },
  bio: {
    optional: true,
    trim: true,
    isLength: {
      options: { max: 250 },
      errorMessage: 'Bio cannot exceed 250 characters'
    }
  }
};

const postValidation = {
  content: {
    trim: true,
    notEmpty: {
      errorMessage: 'Post content cannot be empty'
    },
    isLength: {
      options: { max: 2000 },
      errorMessage: 'Post cannot exceed 2000 characters'
    }
  },
  tags: {
    optional: true,
    isArray: {
      errorMessage: 'Tags must be an array'
    },
    custom: {
      options: (value) => {
        if (!Array.isArray(value)) return true;
        return value.every(tag => 
          typeof tag === 'string' && 
          tag.length <= 30 &&
          /^[a-zA-Z0-9_]+$/.test(tag)
        );
      },
      errorMessage: 'Invalid tags format'
    }
  }
};

const commentValidation = {
  content: {
    trim: true,
    notEmpty: {
      errorMessage: 'Comment content cannot be empty'
    },
    isLength: {
      options: { max: 500 },
      errorMessage: 'Comment cannot exceed 500 characters'
    }
  }
};

module.exports = {
  validateRequest,
  userValidation,
  postValidation,
  commentValidation
};
