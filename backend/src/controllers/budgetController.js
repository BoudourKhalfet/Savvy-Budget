const { Budget, Category, Transaction } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

const getMonthRange = () => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date();
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);

  return { startOfMonth, endOfMonth };
};

const getSpendingByCategory = async (userId) => {
  const { startOfMonth, endOfMonth } = getMonthRange();

  const rows = await Transaction.findAll({
    attributes: ['categoryId', [fn('SUM', col('amount')), 'total']],
    where: {
      userId,
      type: 'expense',
      date: { [Op.between]: [startOfMonth, endOfMonth] }
    },
    group: ['categoryId'],
    raw: true
  });

  const map = {};
  rows.forEach(r => { map[r.categoryId] = parseFloat(r.total) || 0; });
  return map;
};

// @desc    Get all budgets with spending status
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: budgets } = await Budget.findAndCountAll({
      where: { userId: req.user.id },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'icon', 'color', 'type']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const spendingMap = await getSpendingByCategory(req.user.id);

    const budgetsWithSpending = budgets.map(budget => {
      const budgetJson = budget.toJSON();
      const budgetAmount = parseFloat(budgetJson.amount || budgetJson.amountLimit || 0);
      const totalSpent = spendingMap[budget.categoryId] || 0;
      const remaining = budgetAmount - totalSpent;
      const percentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

      return {
        ...budgetJson,
        amount: budgetAmount,
        spent: parseFloat(totalSpent).toFixed(2),
        remaining: parseFloat(remaining).toFixed(2),
        percentage: parseFloat(percentage).toFixed(2)
      };
    });

    res.status(200).json({
      success: true,
      count: budgetsWithSpending.length,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / parseInt(limit)),
      data: budgetsWithSpending
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single budget
// @route   GET /api/budgets/:id
// @access  Private
const getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'icon', 'color', 'type']
      }]
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res, next) => {
  try {
    const { categoryId, amount, amountLimit, period, startDate } = req.body;
    const userId = req.user.id;
    const budgetAmount = amount || amountLimit;

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const existingBudget = await Budget.findOne({
      where: { userId, categoryId: parseInt(categoryId) }
    });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this category. Please edit the existing budget instead.'
      });
    }

    const budget = await Budget.create({
      userId,
      categoryId: parseInt(categoryId),
      amountLimit: parseFloat(budgetAmount),
      period: period || 'monthly',
      startDate: startDate || new Date()
    });

    const fullBudget = await Budget.findByPk(budget.id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'icon', 'color', 'type']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: fullBudget
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    const { categoryId, amount, amountLimit, period, startDate } = req.body;

    if (categoryId !== undefined) budget.categoryId = categoryId;
    if (amount !== undefined) {
      budget.amount = amount;
      budget.amountLimit = amount;
    }
    if (amountLimit !== undefined) {
      budget.amountLimit = amountLimit;
      budget.amount = amountLimit;
    }
    if (period !== undefined) budget.period = period;
    if (startDate !== undefined) budget.startDate = startDate;

    await budget.save();

    const updatedBudget = await Budget.findByPk(budget.id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'icon', 'color', 'type']
      }]
    });

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: updatedBudget
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    await budget.destroy();

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget status overview
// @route   GET /api/budgets/status
// @access  Private
const getBudgetStatus = async (req, res, next) => {
  try {
    const budgets = await Budget.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'icon', 'color', 'type']
      }]
    });

    const { startOfMonth, endOfMonth } = getMonthRange();
    const spendingMap = await getSpendingByCategory(req.user.id);

    const totalBudget = budgets.reduce((sum, b) => {
      return sum + parseFloat(b.amount || b.amountLimit || 0);
    }, 0);

    const totalSpent = await Transaction.sum('amount', {
      where: {
        userId: req.user.id,
        type: 'expense',
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      }
    }) || 0;

    const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const budgetsWithStatus = budgets.map(budget => {
      const budgetAmount = parseFloat(budget.amount || budget.amountLimit || 0);
      const spent = spendingMap[budget.categoryId] || 0;

      return {
        budgetId: budget.id,
        categoryId: budget.categoryId,
        spent: parseFloat(spent).toFixed(2),
        limit: budgetAmount.toFixed(2),
        percentage: budgetAmount > 0 ? ((spent / budgetAmount) * 100).toFixed(2) : 0
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalBudget: parseFloat(totalBudget).toFixed(2),
        totalSpent: parseFloat(totalSpent).toFixed(2),
        remaining: parseFloat(totalBudget - totalSpent).toFixed(2),
        percentage: parseFloat(overallPercentage).toFixed(2),
        budgetCount: budgets.length,
        budgets: budgetsWithStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetStatus
};
