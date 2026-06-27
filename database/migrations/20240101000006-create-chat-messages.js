'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('chat_messages', {
      id: {
        type:  Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      message: {
        type: Sequelize. TEXT,
        allowNull: false
      },
      sender: {
        type: Sequelize. ENUM('user', 'bot'),
        allowNull: false
      },
      created_at:  {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue:  Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('chat_messages', ['user_id']);
    await queryInterface. addIndex('chat_messages', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('chat_messages');
  }
};