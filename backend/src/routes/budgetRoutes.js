const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});
const {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetStatus
} = require('../controllers/budgetController');

// Validation rules
const budgetValidation = [
  body('categoryId')
    .isInt()
    .withMessage('Category ID is required and must be valid'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('amountLimit')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount limit must be greater than 0'),
  body('period')
    .optional()
    .isIn(['weekly', 'monthly', 'yearly'])
    .withMessage('Period must be weekly, monthly or yearly')
];

// Custom validation:  at least one amount field must be present
const requireAmount = (req, res, next) => {
  if (!req.body.amount && !req.body.amountLimit) {
    return res.status(400).json({
      success: false,
      message: 'Either amount or amountLimit is required'
    });
  }
  next();
};

// Routes - status must come first!
router.get('/status', protect, getBudgetStatus);

router.route('/')
  .get(protect, getBudgets)
  .post(protect, writeLimiter, budgetValidation, validate, requireAmount, createBudget);

router.route('/:id')
  .get(protect, getBudget)
  .put(protect, writeLimiter, budgetValidation, validate, updateBudget)
  .delete(protect, writeLimiter, deleteBudget);

module.exports = router;