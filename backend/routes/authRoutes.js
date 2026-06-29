const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const { protect } = require('../middlewares/auth');
const { validate } = require('../validators/validator');
const {
  registerRules,
  loginRules,
  changePasswordRules,
  resetPasswordRequestRules,
  resetPasswordConfirmRules
} = require('../validators/schemas');

const router = express.Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/logout', logout);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePasswordRules, validate, changePassword);

// Password recovery routes
router.post('/forgot-password', resetPasswordRequestRules, validate, forgotPassword);
router.put('/reset-password/:resettoken', resetPasswordConfirmRules, validate, resetPassword);

module.exports = router;
