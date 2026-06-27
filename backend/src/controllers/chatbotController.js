const aiService = require('../services/aiService');
const { Transaction, Budget, Goal, ChatMessage } = require('../models');
const { Op } = require('sequelize');

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    await ChatMessage.create({ userId, message: message.trim(), sender: 'user' });

    const context = await getFinancialContext(userId);
    const response = await aiService.generateResponse(message, context);

    if (response.success && response.message) {
      await ChatMessage.create({ userId, message: response.message, sender: 'bot' });
    }

    res.json(response);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: error.message
    });
  }
};

async function getFinancialContext(userId) {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const transactions = await Transaction.findAll({
      where: {
        userId,
        date: { [Op.gte]: firstDayOfMonth }
      }
    });

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const budgetCount = await Budget.count({ where: { userId } });
    const goalCount = await Goal.count({ where: { userId } });

    return { totalIncome, totalExpenses, budgetCount, goalCount };
  } catch (error) {
    return null;
  }
}
