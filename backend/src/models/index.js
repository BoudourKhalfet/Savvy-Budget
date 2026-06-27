const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

let sequelize;

if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
  );
}

const db = {};

// Import models
db.User = require('./User')(sequelize, Sequelize. DataTypes);
db.Category = require('./Category')(sequelize, Sequelize.DataTypes);
db.Transaction = require('./Transaction')(sequelize, Sequelize.DataTypes);
db.Budget = require('./Budget')(sequelize, Sequelize.DataTypes);
db.Goal = require('./Goal')(sequelize, Sequelize.DataTypes);
db.ChatMessage = require('./ChatMessage')(sequelize, Sequelize.DataTypes);

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;