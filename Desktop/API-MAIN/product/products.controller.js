const express = require('express');
const router = express.Router();
const productService = require('../product/product.service');

router.get('/', getProduct);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;

function getProduct(req, res, next) {
    productService.getAll()
        .then(products => res.json(products))
        .catch(next);
}
function getProductById(req, res, next) {
    productService.getById(req.params.id)
        .then(product => res.json(product))
        .catch(next);
}
function createProduct(req, res, next) {
    productService.create(req.body)
        .then(() => res.json({ message: 'Product created' }))
        .catch(next);
}
function updateProduct(req, res, next) {
    productService.update(req.params.id, req.body)
        .then(() => res.json({ message: 'Product updated' }))
        .catch(next);
}
function deleteProduct(req, res, next) {
    productService.deleteProduct(req.params.id, req.body)
        .then(() => res.json({ message: 'Product deleted' }))
        .catch(next);
}
