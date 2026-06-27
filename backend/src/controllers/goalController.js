const { Goal } = require('../models');

// @desc    Get all goals
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId: req.user.id };
    if (status) where.status = status;

    const { count, rows: goals } = await Goal.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const goalsWithProgress = goals.map(goal => {
      const goalJson = goal.toJSON();
      const progress = (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100;

      let daysRemaining = null;
      const deadline = goal.deadline || goal.targetDate;
      if (deadline) {
        const timeDiff = new Date(deadline) - new Date();
        daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      }

      return {
        ...goalJson,
        progress: parseFloat(progress).toFixed(2),
        daysRemaining,
        isOverdue: daysRemaining !== null && daysRemaining < 0
      };
    });

    res.status(200).json({
      success: true,
      count: goalsWithProgress.length,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / parseInt(limit)),
      data: goalsWithProgress
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Private
const getGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res, next) => {
  try {
    const { name, targetAmount, currentAmount, deadline, targetDate, description } = req.body;

    const goal = await Goal.create({
      userId: req.user.id,
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline: deadline || targetDate || null,
      targetDate: targetDate || deadline || null,
      description: description || null,
      status: 'active',
      isCompleted: false
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    const { name, targetAmount, currentAmount, deadline, targetDate, status, description } = req.body;

    if (name !== undefined) goal.name = name;
    if (targetAmount !== undefined) goal.targetAmount = targetAmount;
    if (currentAmount !== undefined) {
      goal.currentAmount = currentAmount;
      if (parseFloat(currentAmount) >= parseFloat(goal.targetAmount)) {
        goal.status = 'completed';
        goal.isCompleted = true;
        goal.completedAt = new Date();
      }
    }
    if (deadline !== undefined) goal.deadline = deadline;
    if (targetDate !== undefined) goal.targetDate = targetDate;
    if (description !== undefined) goal.description = description;
    if (status !== undefined) goal.status = status;

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    await goal.destroy();

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add contribution to goal
// @route   POST /api/goals/:id/contribute
// @access  Private
const addContribution = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    const goal = await Goal.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    const newAmount = parseFloat(goal.currentAmount || 0) + parseFloat(amount);
    goal.currentAmount = newAmount;

    if (newAmount >= parseFloat(goal.targetAmount) && !goal.isCompleted) {
      goal.isCompleted = true;
      goal.status = 'completed';
      goal.completedAt = new Date();
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Contribution added successfully',
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark goal as complete
// @route   PUT /api/goals/:id/complete
// @access  Private
const markComplete = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    goal.isCompleted = true;
    goal.status = 'completed';
    goal.completedAt = new Date();
    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Goal marked as complete',
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  addContribution,
  markComplete
};
