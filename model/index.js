const { DB, HOST, PASSWORD, USER, dialect, pool } = require('../config/db.config.js');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(DB, USER, PASSWORD, {
  host: HOST,
  dialect: dialect,
  operatorsAliases: false,
  port: 3306,
  pool: {
    max: pool.max,
    min: pool.min,
    acquire: pool.acquire,
    idle: pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// importing the SchemaModel of the tabel
db.blog = require('./blog.model.js')(sequelize, DataTypes);
db.user = require('./user.model.js')(sequelize, DataTypes);

// Database Relation
db.blog.belongsTo(db.user, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

db.user.hasMany(db.blog, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

// to make any change to the db schema make it true and default let it be false
db.sequelize.sync({ force: false }).then(() => {
  console.log('re-sync done');
});

module.exports = db;
