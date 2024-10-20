const express = require('express');
const router = express.Router();
const inventoryService = require('../inventories/inventory.service');

router.get('/', getInventory);
router.post('/', updateStock);

module.exports = router;

function getInventory(req, res, next) {
    inventoryService.getAll()
        .then(inventory => res.json(inventory))
        .catch(next);
}

function updateStock(req, res, next) {
    const { productId, quantity } = req.body;
    inventoryService.updateStock(productId, quantity)
        .then(() => res.json({ message: 'Stock updated' }))
        .catch(next);
}