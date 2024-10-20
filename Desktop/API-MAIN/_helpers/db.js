const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    const Order = require('../order/order.model');
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    
    await connection.end();

    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });

    db.Account = require('../accounts/account.model')(sequelize);
    db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);

    db.Account.hasMany(db.RefreshToken,{ onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    db.ActivityLog = require('../models/activitylog.model')(sequelize);
    db.Order = require('../order/order.model')(sequelize);
    
    
    db.Product = require('../product/product.model')(sequelize);
    db.Inventory = require('../inventories/inventory.model')(sequelize);
    db.Product.hasOne(db.Inventory, { foreignKey: 'productId', as: 'inventory', onDelete: 'CASCADE' });
    db.Inventory.belongsTo(db.Product, { foreignKey: 'productId' });
    await sequelize.sync({ alter: true });
}