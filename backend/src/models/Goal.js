module.exports = (sequelize, DataTypes) => {
  const Goal = sequelize.define('Goal', {
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    targetAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'target_amount',
      validate: {
        min: 0
      }
    },
    currentAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      field: 'current_amount',
      validate: {
        min: 0
      }
    },
    deadline: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    targetDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'target_date'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_completed'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at'
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'cancelled'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'goals',
    underscored: true,
    timestamps: true
  });

  Goal.associate = (models) => {
    Goal.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Goal;
};
