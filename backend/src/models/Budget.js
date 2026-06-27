module.exports = (sequelize, DataTypes) => {
  const Budget = sequelize.define('Budget', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'category_id',
      references: {
        model: 'categories',
        key: 'id'
      },
      onDelete:  'CASCADE'
    },
    amountLimit: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'amount_limit',
      validate: {
        min: 0
      }
    },
    period: {
      type: DataTypes.STRING(20),
      defaultValue: 'monthly'
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'start_date'
    }
  }, {
    tableName: 'budgets',
    underscored: true,
    timestamps: true
  });

  Budget.associate = (models) => {
    Budget.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Budget.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category'
    });
  };

  return Budget;
};