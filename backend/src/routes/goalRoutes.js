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
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  addContribution,
  markComplete
} = require('../controllers/goalController');

// Validation rules
const goalValidation = [
  body('name').notEmpty().trim().withMessage('Goal name is required'),
  body('targetAmount')
    .isFloat({ min: 0.01 })
    .withMessage('Target amount must be greater than 0'),
  body('currentAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Current amount must be 0 or greater'),
  body('deadline').optional().isISO8601().withMessage('Invalid date format'),
  body('targetDate').optional().isISO8601().withMessage('Invalid date format')
];

const contributionValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('date').optional().isISO8601().withMessage('Invalid date format')
];

// Routes
router.route('/')
  .get(protect, getGoals)
  .post(protect, writeLimiter, goalValidation, validate, createGoal);

router.route('/:id')
  .get(protect, getGoal)
  .put(protect, writeLimiter, updateGoal)
  .delete(protect, writeLimiter, deleteGoal);

// Additional routes
router.post('/:id/contribute', protect, writeLimiter, contributionValidation, validate, addContribution);
router.put('/:id/complete', protect, writeLimiter, markComplete);

module.exports = router;