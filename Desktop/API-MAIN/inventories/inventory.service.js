const db = require('_helpers/db');

module.exports = {
    getInventory,
    updateStock
};

async function getInventory() {
    return await db.Inventory.findAll({ include: db.Product });
}

async function updateStock(productId, quantity) {
    const inventory = await db.Inventory.findOne({ where: { productId } });
    if (!inventory) throw 'Inventory not found for this product';

    inventory.quantity = quantity;
    await inventory.save();
    
    return inventory;
}