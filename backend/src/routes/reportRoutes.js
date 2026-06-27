const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getReportSummary,
  exportReport,
  getTrend
} = require('../controllers/reportController');

// Routes
router.get('/summary', protect, getReportSummary);
router.get('/export', protect, exportReport);
router.get('/trend', protect, getTrend);

module.exports = router;