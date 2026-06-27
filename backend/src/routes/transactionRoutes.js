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
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');

// Validation rules
const transactionValidation = [
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('categoryId')
    .optional()
    .isInt()
    .withMessage('Category ID must be a valid integer'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('description').optional().trim()
];

// Routes
router.route('/')
  .get(protect, getTransactions)
  .post(protect, writeLimiter, transactionValidation, validate, createTransaction);

router.route('/:id')
  .get(protect, getTransaction)
  .put(protect, writeLimiter, updateTransaction)
  .delete(protect, writeLimiter, deleteTransaction);

module.exports = router;