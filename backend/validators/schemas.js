const { body } = require('express-validator');

const registerRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

const changePasswordRules = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];

const resetPasswordRequestRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
];

const resetPasswordConfirmRules = [
  body('password')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];

const todoRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim(),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 30 }).withMessage('Category cannot exceed 30 characters'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed']).withMessage('Status must be pending, in_progress, or completed'),
  body('recurring')
    .optional()
    .isIn(['none', 'daily', 'weekly', 'monthly']).withMessage('Recurring must be none, daily, weekly, or monthly')
];

module.exports = {
  registerRules,
  loginRules,
  changePasswordRules,
  resetPasswordRequestRules,
  resetPasswordConfirmRules,
  todoRules
};
