const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const chatbotController = require('../controllers/chatbotController');

// POST /api/chatbot/message
router.post('/message', protect, chatbotController.sendMessage);

module.exports = router;