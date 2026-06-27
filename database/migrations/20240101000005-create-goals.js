'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('goals', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull:  false
      },
      user_id: {
        type:  Sequelize.INTEGER,
        allowNull: false,
        references:  {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      target_amount: {
        type:  Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      current_amount: {
        type:  Sequelize.DECIMAL(12, 2),
        defaultValue: 0
      },
      deadline: {
        type: Sequelize. DATEONLY,
        allowNull:  true
      },
      status:  {
        type: Sequelize.ENUM('active', 'completed', 'cancelled'),
        defaultValue: 'active'
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
    await queryInterface. addIndex('goals', ['user_id']);
    await queryInterface.addIndex('goals', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('goals');
  }
};