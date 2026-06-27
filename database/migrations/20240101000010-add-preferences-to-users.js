'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'preferences', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {
        emailNotifications: true,
        budgetAlerts: true,
        goalReminders: true
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'preferences');
  }
};
