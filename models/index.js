const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config.json')['development'];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// models defined here
db.User = require('./user')(sequelize, DataTypes);
db.File = require('./file')(sequelize, DataTypes);
db.TokenBlackList = require('./tokenBlackList')(sequelize, DataTypes);

module.exports = db;