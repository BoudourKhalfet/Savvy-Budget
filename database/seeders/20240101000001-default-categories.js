'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categories', [
      // Expense Categories
      {
        user_id: null,
        name: 'Food & Dining',
        icon:  '🍔',
        type: 'expense',
        color: 'orange',
        created_at: new Date()
      },
      {
        user_id: null,
        name: 'Transportation',
        icon: '🚗',
        type: 'expense',
        color: 'blue',
        created_at:  new Date()
      },
      {
        user_id: null,
        name: 'Housing/Rent',
        icon: '🏠',
        type:  'expense',
        color:  'purple',
        created_at: new Date()
      },
      {
        user_id: null,
        name: 'Utilities',
        icon: '⚡',
        type: 'expense',
        color: 'yellow',
        created_at: new Date()
      },
      {
        user_id: null,
        name: 'Shopping',
        icon: '🛒',
        type: 'expense',
        color: 'pink',
        created_at: new Date()
      },
      {
        user_id: null,
        name: 'Entertainment',
        icon: '🎬',
        type: 'expense',
        color: 'red',
        created_at: new Date()
      },
      {
        user_id: null,
        name: 'Healthcare',
        icon: '💊',
        type: 'expense',
        color: 'green',
        created_at: new Date()
      },
      {
        user_id: null,
        name: 'Education',
        icon: '📚',
        type: 'expense',
        color: 'indigo',
        created_at: new Date()
      },
      {
        user_id: null,
        name: 'Fitness',
        icon: '💪',
        type: 'expense',
        color: 'teal',
        created_at:  new Date()
      },
      {
        user_id: null,
        name: 'Travel',
        icon: '✈️',
        type: 'expense',
        color: 'cyan',
        created_at: new Date()
      },
      {
        user_id: null,
        name: 'Subscriptions',
        icon: '📱',
        type: 'expense',
        color: 'violet',
        created_at: new Date()
      },
      {
        user_id: null,
        name: 'Gifts',
        icon: '🎁',
        type: 'expense',
        color: 'rose',
        created_at: new Date()
      },
      {
        user_id: null,
        name: 'Other Expenses',
        icon: '💼',
        type: 'expense',
        color: 'gray',
        created_at: new Date()
      },
      // Income Categories
      {
        user_id: null,
        name: 'Salary',
        icon: '💰',
        type: 'income',
        color: 'green',
        created_at: new Date()
      },
      {
        user_id: null,
        name: 'Freelance',
        icon: '💼',
        type: 'income',
        color: 'blue',
        created_at: new Date()
      },
      {
        user_id: null,
        name: 'Investments',
        icon: '📈',
        type: 'income',
        color: 'purple',
        created_at:  new Date()
      },
      {
        user_id: null,
        name: 'Gifts Received',
        icon: '🎁',
        type: 'income',
        color: 'pink',
        created_at: new Date()
      },
      {
        user_id:  null,
        name: 'Other Income',
        icon: '💵',
        type: 'income',
        color: 'teal',
        created_at:  new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface. bulkDelete('categories', { user_id: null }, {});
  }
};