'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id:  {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement:  true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      username: {
        type: Sequelize.STRING(100),
        unique: true,
        allowNull: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull:  false
      },
      full_name: {
        type:  Sequelize.STRING(255),
        allowNull: true
      },
      avatar_url:  {
        type: Sequelize.TEXT,
        allowNull: true
      },
      currency:  {
        type: Sequelize.STRING(10),
        defaultValue: 'USD'
      },
      created_at: {
        type: Sequelize. DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type:  Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('users', ['email']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};