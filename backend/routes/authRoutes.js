const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/me', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
