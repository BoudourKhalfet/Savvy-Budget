const { Transaction, Category, Budget, Goal } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;

    // Calculate date range
    let startDate = new Date();
    let endDate = new Date();

    if (period === 'day') {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      const day = startDate.getDay();
      const diff = startDate.getDate() - day;
      startDate = new Date(startDate.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'year') {
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(11, 31);
      endDate.setHours(23, 59, 59, 999);
    }

    // Get total income
    const totalIncome = await Transaction.sum('amount', {
      where: {
        userId: req.user.id,
        type: 'income',
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    }) || 0;

    // Get total expenses
    const totalExpenses = await Transaction.sum('amount', {
      where: {
        userId: req.user.id,
        type: 'expense',
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    }) || 0;

    // Net balance
    const netBalance = totalIncome - totalExpenses;

    // Get recent transactions
    const recentTransactions = await Transaction.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'icon', 'color']
      }],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit: 10
    });

    // Get expense by category
    const expensesByCategory = await Transaction.findAll({
      attributes: [
        'categoryId',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('Transaction.id')), 'count']
      ],
      where:  {
        userId: req.user. id,
        type: 'expense',
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name', 'icon', 'color']
      }],
      group: ['categoryId', 'category.id', 'category.name', 'category.icon', 'category.color'],
      order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
      limit: 10
    });

    // Transaction count
    const transactionCount = await Transaction.count({
      where: {
        userId: req.user. id,
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        period,
        startDate,
        endDate,
        totalIncome:  parseFloat(totalIncome).toFixed(2),
        totalExpenses: parseFloat(totalExpenses).toFixed(2),
        netBalance: parseFloat(netBalance).toFixed(2),
        transactionCount,
        recentTransactions,
        expensesByCategory: expensesByCategory.map(item => ({
          category: item.category,
          total: parseFloat(item.dataValues.total).toFixed(2),
          count: parseInt(item.dataValues.count)
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chart data
// @route   GET /api/dashboard/charts
// @access  Private
const getChartData = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;

    let startDate = new Date();
    let endDate = new Date();

    if (period === 'month') {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'year') {
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(11, 31);
      endDate.setHours(23, 59, 59, 999);
    }

    // Income vs Expenses over time
    const transactions = await Transaction.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'ASC']]
    });

    // Group by date
    const dateMap = {};
    transactions.forEach(t => {
      const date = t.date.toISOString().split('T')[0];
      if (!dateMap[date]) {
        dateMap[date] = { date, income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        dateMap[date].income += parseFloat(t. amount);
      } else {
        dateMap[date].expense += parseFloat(t.amount);
      }
    });

    const incomeVsExpense = Object.values(dateMap).map(item => ({
      date: item. date,
      income: parseFloat(item.income).toFixed(2),
      expense: parseFloat(item.expense).toFixed(2)
    }));

    res.status(200).json({
      success: true,
      data: {
        incomeVsExpense
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getChartData
};