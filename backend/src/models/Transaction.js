module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
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
      onDelete:  'CASCADE'
    },
    type: {
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'category_id',
      references: {
        model: 'categories',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date:  {
      type: DataTypes. DATEONLY,
      allowNull:  false,
      defaultValue: DataTypes. NOW
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_recurring'
    },
    recurrenceType: {
      type: DataTypes.ENUM('monthly_day', 'every_30_days'),
      allowNull: true,
      defaultValue: null,
      field: 'recurrence_type'
    },
    lastProcessedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
      field: 'last_processed_date'
    }
  }, {
    tableName: 'transactions',
    underscored: true,
    timestamps: true
  });

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Transaction.belongsTo(models. Category, {
      foreignKey:  'categoryId',
      as: 'category'
    });
  };

  return Transaction;
};