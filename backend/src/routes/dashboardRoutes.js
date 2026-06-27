const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getDashboardSummary,
  getChartData
} = require('../controllers/dashboardController');

// Routes
router.get('/summary', protect, getDashboardSummary);
router.get('/charts', protect, getChartData);

module.exports = router;