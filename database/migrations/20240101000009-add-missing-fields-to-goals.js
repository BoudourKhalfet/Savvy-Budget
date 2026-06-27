'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('goals', 'target_date', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });

    await queryInterface.addColumn('goals', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('goals', 'is_completed', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    await queryInterface.addColumn('goals', 'completed_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('goals', 'target_date');
    await queryInterface.removeColumn('goals', 'description');
    await queryInterface.removeColumn('goals', 'is_completed');
    await queryInterface.removeColumn('goals', 'completed_at');
  }
};
