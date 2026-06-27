'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('budgets', {
      id: {
        type: Sequelize. INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id:  {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete:  'CASCADE'
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model:  'categories',
          key:  'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount_limit: {
        type:  Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      period: {
        type: Sequelize.STRING(20),
        defaultValue:  'monthly'
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      created_at:  {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue:  Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface. addIndex('budgets', ['user_id']);
    await queryInterface.addIndex('budgets', ['category_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('budgets');
  }
};