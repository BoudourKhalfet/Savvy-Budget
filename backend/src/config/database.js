require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password:  process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'savvy_budget',
    host:  process.env.DB_HOST || 'localhost',
    port:  parseInt(process.env.DB_PORT) || 5433,
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
      timezone: 'local'
    },
    pool: {
      max: 5,
      min:  0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: 'savvy_budget_test',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env. DB_PORT) || 5433,
    dialect: 'postgres',
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env. DB_PASSWORD,
    database:  process.env.DB_NAME,
    host: process.env. DB_HOST,
    port:  parseInt(process.env.DB_PORT),
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized:  false
      }
    }
  }
};