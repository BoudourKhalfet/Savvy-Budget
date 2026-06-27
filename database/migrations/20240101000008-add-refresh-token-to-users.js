'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'refresh_token', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'refresh_token');
  }
};
