const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { protect } = require('../middleware/auth');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// Validation rules
const categoryValidation = [
  body('name').notEmpty().trim().withMessage('Category name is required'),
  body('type')
    .isIn(['income', 'expense', 'both'])
    .withMessage('Type must be income, expense, or both'),
  body('icon').optional().trim(),
  body('color').optional().trim()
];

// Routes
router.route('/')
  .get(protect, getCategories)
  .post(protect, categoryValidation, validate, createCategory);

router.route('/:id')
  .get(protect, getCategory)
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

module.exports = router;