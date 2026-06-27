const { Transaction, Category, Budget, Goal } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

// @desc    Get financial report
// @route   GET /api/reports/summary
// @access  Private
const getReportSummary = async (req, res, next) => {
  try {
    const { startDate, endDate, period = 'month', year, month } = req.query;

    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else if (year && month) {
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 0);
    } else {
      // Default to current month
      start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    }

    // Total income
    const totalIncome = await Transaction.sum('amount', {
      where: {
        userId:  req.user.id,
        type: 'income',
        date: { [Op.between]: [start, end] }
      }
    }) || 0;

    // Total expenses
    const totalExpenses = await Transaction.sum('amount', {
      where: {
        userId: req.user.id,
        type: 'expense',
        date: { [Op. between]: [start, end] }
      }
    }) || 0;

    // Category breakdown
    const categoryBreakdown = await Transaction.findAll({
      attributes: [
        'categoryId',
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('Transaction.id')), 'count']
      ],
      where: {
        userId: req.user. id,
        date: { [Op.between]: [start, end] }
      },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name', 'icon', 'color']
      }],
      group: ['categoryId', 'type', 'category.id'],
      order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']]
    });

    // Average daily spending
    const daysInPeriod = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const avgDailySpending = totalExpenses / daysInPeriod;

    // Transaction count
    const transactionCount = await Transaction.count({
      where: {
        userId: req. user.id,
        date: { [Op.between]: [start, end] }
      }
    });

    // Top spending categories
    const topCategories = categoryBreakdown
      .filter(item => item.type === 'expense')
      .slice(0, 5)
      .map(item => ({
        category: item.category,
        total: parseFloat(item.dataValues.total).toFixed(2),
        count: parseInt(item.dataValues.count)
      }));

    res.status(200).json({
      success: true,
      data: {
        period:  {
          start,
          end,
          days: daysInPeriod
        },
        summary: {
          totalIncome:  parseFloat(totalIncome).toFixed(2),
          totalExpenses: parseFloat(totalExpenses).toFixed(2),
          netSavings: parseFloat(totalIncome - totalExpenses).toFixed(2),
          avgDailySpending:  parseFloat(avgDailySpending).toFixed(2),
          transactionCount
        },
        topCategories,
        categoryBreakdown: categoryBreakdown.map(item => ({
          category: item.category,
          type: item.type,
          total: parseFloat(item.dataValues.total).toFixed(2),
          count: parseInt(item. dataValues.count)
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export report data
// @route   GET /api/reports/export
// @access  Private
const exportReport = async (req, res, next) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;

    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      start = new Date();
      start.setDate(1);
      end = new Date();
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    }

    const transactions = await Transaction.findAll({
      where: {
        userId: req.user.id,
        date: { [Op.between]: [start, end] }
      },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name', 'icon', 'type']
      }],
      order: [['date', 'DESC']]
    });

    if (format === 'csv') {
      // Create CSV
      let csv = 'Date,Type,Category,Amount,Description\n';
      transactions.forEach(t => {
        csv += `${t.date},${t.type},${t. category ?  t.category.name : 'N/A'},${t.amount},"${t.description || ''}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      res.status(200).send(csv);
    } else {
      // JSON format
      res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get income vs expense trend for last 7 periods
// @route   GET /api/reports/trend
// @access  Private
const getTrend = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    const today = new Date();
    const results = [];

    for (let i = 6; i >= 0; i--) {
      let start, end, label;

      if (period === 'week') {
        start = new Date(today);
        start.setDate(today.getDate() - i * 7 - today.getDay());
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (period === 'year') {
        const year = today.getFullYear() - i;
        start = new Date(year, 0, 1);
        end = new Date(year, 11, 31, 23, 59, 59);
        label = year.toString();
      } else {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        start = new Date(d.getFullYear(), d.getMonth(), 1);
        end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }

      const [income, expenses] = await Promise.all([
        Transaction.sum('amount', {
          where: { userId: req.user.id, type: 'income', date: { [Op.between]: [start, end] } }
        }),
        Transaction.sum('amount', {
          where: { userId: req.user.id, type: 'expense', date: { [Op.between]: [start, end] } }
        })
      ]);

      results.push({
        label,
        income: parseFloat(income || 0),
        expenses: parseFloat(expenses || 0)
      });
    }

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReportSummary,
  exportReport,
  getTrend
};