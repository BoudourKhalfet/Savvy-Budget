module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    name:  {
      type: DataTypes. STRING(100),
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    type: {
      type: DataTypes. ENUM('income', 'expense', 'both'),
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    tableName: 'categories',
    underscored: true,
    timestamps: true,
    updatedAt: false
  });

  Category.associate = (models) => {
    Category.belongsTo(models. User, {
      foreignKey:  'userId',
      as:  'user'
    });
    Category.hasMany(models.Transaction, {
      foreignKey: 'categoryId',
      as: 'transactions'
    });
    Category.hasMany(models.Budget, {
      foreignKey: 'categoryId',
      as:  'budgets'
    });
  };

  return Category;
};