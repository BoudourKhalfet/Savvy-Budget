require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const { processRecurringTransactions } = require('./services/recurringService');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { sequelize } = require('./models');           // ← Changed
const routes = require('./routes');                   // ← Changed
const errorHandler = require('./middleware/errorHandler');  // ← Changed
const chatbotRoutes = require('./routes/chatbotRoutes');   // ← Changed

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    /\.vercel\.app$/,
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app. use('/api', routes);
app.use('/api/chatbot', chatbotRoutes);  // ← Add this

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Savvy Budget API',
    version:  '1.0.0',
    endpoints: {
      health:  '/api/health',
      auth: '/api/auth',
      transactions: '/api/transactions',
      categories: '/api/categories',
      budgets: '/api/budgets',
      goals:  '/api/goals',
      dashboard: '/api/dashboard',
      reports: '/api/reports',
      chatbot: '/api/chatbot'
    }
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Database connection and server start
const PORT = process. env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize. authenticate();
    console.log('✅ Database connected successfully');

    // Sync models (in development only - use migrations in production)
    if (process.env.NODE_ENV === 'development') {
      // await sequelize.sync({ alter: false });
      console.log('✅ Models synced');
    }

    // Process recurring transactions on startup then daily at midnight
    await processRecurringTransactions();
    cron.schedule('0 0 * * *', processRecurringTransactions);

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`📍 API available at http://localhost:${PORT}/api`);
      console.log(`🤖 Chatbot available at http://localhost:${PORT}/api/chatbot`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;