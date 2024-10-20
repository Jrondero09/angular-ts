const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const attributes = {
        productId: { type: DataTypes.INTEGER, allowNull: false },
        quantity: { type: DataTypes.INTEGER, allowNull: false }
    };

    return sequelize.define('Inventory', attributes);
};