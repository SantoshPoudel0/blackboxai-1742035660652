const express = require('express');
const { check } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const {
  register,
  login,
  getProfile,
  updateProfile
} = require('../controllers/authController');

const router = express.Router();

// Register validation
const registerValidation = [
  check('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  check('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Login validation
const loginValidation = [
  check('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  check('password')
    .exists()
    .withMessage('Password is required')
];

// Profile update validation
const updateProfileValidation = [
  check('username')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  check('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email'),
  check('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  check('bio')
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage('Bio cannot exceed 250 characters')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfileValidation, updateProfile);

module.exports = router;
