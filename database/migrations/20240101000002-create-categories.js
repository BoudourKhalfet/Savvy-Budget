'use strict';

module. exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface. createTable('categories', {
      id: {
        type:  Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type:  Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      icon: {
        type: Sequelize. STRING(50),
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('income', 'expense', 'both'),
        allowNull: false
      },
      color: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      created_at:  {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue:  Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('categories', ['user_id']);
    await queryInterface.addIndex('categories', ['type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('categories');
  }
};