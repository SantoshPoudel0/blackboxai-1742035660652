const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getUserProfile,
  toggleFollow,
  searchUsers,
  getFollowers,
  getFollowing
} = require('../controllers/userController');

const router = express.Router();

// Public routes
router.get('/search', searchUsers);
router.get('/:id', getUserProfile);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

// Protected routes
router.put('/:id/follow', protect, toggleFollow);

module.exports = router;
