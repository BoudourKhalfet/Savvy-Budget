'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('transactions', 'recurrence_type', {
      type: Sequelize.ENUM('monthly_day', 'every_30_days'),
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn('transactions', 'last_processed_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('transactions', 'recurrence_type');
    await queryInterface.removeColumn('transactions', 'last_processed_date');
  }
};
