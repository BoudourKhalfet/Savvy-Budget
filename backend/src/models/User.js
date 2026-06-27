const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique:  true,
      validate: {
        isEmail: true
      }
    },
    username: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull:  true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'full_name'
    },
    avatarUrl: {
      type:  DataTypes.TEXT,
      allowNull: true,
      field: 'avatar_url'
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD'
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      field: 'refresh_token'
    },
    preferences: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        emailNotifications: true,
        budgetAlerts: true,
        goalReminders: true
      }
    }
  }, {
    tableName: 'users',
    underscored: true,
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  User.associate = (models) => {
    User.hasMany(models.Transaction, {
      foreignKey: 'userId',
      as: 'transactions'
    });
    User.hasMany(models.Category, {
      foreignKey: 'userId',
      as: 'categories'
    });
    User.hasMany(models.Budget, {
      foreignKey: 'userId',
      as: 'budgets'
    });
    User.hasMany(models. Goal, {
      foreignKey:  'userId',
      as:  'goals'
    });
    User.hasMany(models.ChatMessage, {
      foreignKey:  'userId',
      as:  'chatMessages'
    });
  };

  // Method to compare passwords
  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  // Remove password from JSON
  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.refreshToken;
    return values;
  };

  return User;
};