const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const attributes = {
        model: { type: DataTypes.STRING, allowNull: false },
        brand: { type: DataTypes.STRING, allowNull: true },
        price: { type: DataTypes.FLOAT, allowNull: false },
        status: { type: DataTypes.ENUM('active', 'deleted'), allowNull: false, defaultValue: 'active' }
    };

    return sequelize.define('Product', attributes);
};