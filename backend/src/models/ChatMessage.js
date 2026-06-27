module.exports = (sequelize, DataTypes) => {
  const ChatMessage = sequelize.define('ChatMessage', {
    id:  {
      type: DataTypes. INTEGER,
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
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    sender: {
      type: DataTypes. ENUM('user', 'bot'),
      allowNull: false
    }
  }, {
    tableName: 'chat_messages',
    underscored: true,
    timestamps: true,
    updatedAt: false
  });

  ChatMessage.associate = (models) => {
    ChatMessage. belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return ChatMessage;
};