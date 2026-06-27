const { Transaction, Category } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const { 
      type, 
      categoryId, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 50,
      sort = 'date',
      order = 'DESC'
    } = req.query;

    const where = { userId: req.user.id };

    // Add filters
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = startDate;
      if (endDate) where.date[Op.lte] = endDate;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Transaction. findAndCountAll({
      where,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'icon', 'color', 'type']
      }],
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      where: { id:  req.params.id, userId: req.user.id },
      include: [{
        model: Category,
        as: 'category'
      }]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, categoryId, description, date, isRecurring, recurrenceType } = req.body;
    const transactionDate = date || new Date().toISOString().split('T')[0];

    const transaction = await Transaction.create({
      userId: req.user.id,
      type,
      amount,
      categoryId,
      description,
      date: transactionDate,
      isRecurring: isRecurring || false,
      recurrenceType: isRecurring ? (recurrenceType || 'monthly_day') : null,
      lastProcessedDate: isRecurring ? transactionDate : null
    });

    // Fetch with category info
    const fullTransaction = await Transaction.findByPk(transaction.id, {
      include: [{
        model: Category,
        as: 'category'
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: fullTransaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      where: { id:  req.params.id, userId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const { type, amount, categoryId, description, date, isRecurring, recurrenceType } = req.body;

    // Update fields
    if (type !== undefined) transaction.type = type;
    if (amount !== undefined) transaction.amount = amount;
    if (categoryId !== undefined) transaction.categoryId = categoryId;
    if (description !== undefined) transaction.description = description;
    if (date !== undefined) transaction.date = date;
    if (isRecurring !== undefined) {
      transaction.isRecurring = isRecurring;
      transaction.recurrenceType = isRecurring ? (recurrenceType || transaction.recurrenceType || 'monthly_day') : null;
      if (isRecurring && !transaction.lastProcessedDate) {
        transaction.lastProcessedDate = transaction.date;
      }
      if (!isRecurring) transaction.lastProcessedDate = null;
    } else if (recurrenceType !== undefined && transaction.isRecurring) {
      transaction.recurrenceType = recurrenceType;
    }

    await transaction.save();

    // Fetch with category info
    const updatedTransaction = await Transaction.findByPk(transaction.id, {
      include: [{
        model: Category,
        as: 'category'
      }]
    });

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data:  updatedTransaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await transaction.destroy();

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction
};