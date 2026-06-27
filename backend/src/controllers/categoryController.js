const { Category } = require('../models');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;
    
    const where = {
      [require('sequelize').Op.or]: [
        { userId: null }, // Default categories
        { userId: req.user. id } // User's custom categories
      ]
    };

    if (type) {
      where. type = type;
    }

    const categories = await Category.findAll({
      where,
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count:  categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if user owns this category (or it's a default category)
    if (category.userId && category.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this category'
      });
    }

    res.status(200).json({
      success: true,
      data:  category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create custom category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res, next) => {
  try {
    const { name, icon, type, color } = req.body;

    const category = await Category.create({
      userId: req.user.id,
      name,
      icon,
      type,
      color
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/: id
// @access  Private
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if user owns this category
    if (! category.userId || category.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify default categories'
      });
    }

    const { name, icon, type, color } = req.body;

    if (name !== undefined) category.name = name;
    if (icon !== undefined) category.icon = icon;
    if (type !== undefined) category.type = type;
    if (color !== undefined) category.color = color;

    await category.save();

    res.status(200).json({
      success: true,
      message:  'Category updated successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if user owns this category
    if (!category.userId || category.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete default categories'
      });
    }

    await category.destroy();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};