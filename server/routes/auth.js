const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateSettings,
  updateUserType
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/settings', protect, updateSettings);
router.put('/usertype', protect, updateUserType);

module.exports = router;