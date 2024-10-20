const db = require('_helpers/db');


module.exports = {
    getProduct,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};

async function getProduct() {
    return await db.Product.findAll({ where: { status: 'active' } });
}
async function getProductById(id) {
    return await db.Product.findByPk(id);
}
async function createProduct(params) {
    let product = await db.Product.findOne({ where: { model: params.model } });

    if (product) {
        const inventory = await db.Inventory.findOne({ where: { productId: product.id } });
        
        if (inventory) {
            inventory.quantity += params.quantity || 1;
            await inventory.save();
        } else {
            await db.Inventory.createProduct({
                productId: product.id,
                quantity: params.quantity || 1
            });
        }

        return { message: 'Product already exists, inventory updated', product };
    } else {
        product = await db.Product.createProduct({
            model: params.model,
            brand: params.brand,
            price: params.price,
            status: 'active'
        });

        await db.Inventory.createProduct({
            productId: product.id,
            quantity: params.quantity || 1
        });

        return { message: 'New product created', product };
    }
}
async function updateProduct(id, params) {
    const product = await getById(id);
    if (!product) throw 'Product not found';

    Object.assign(product, params);
    return await product.save();
}
async function deleteProduct(productId) {
    const product = await db.Product.findByPk(productId);
    if (!product) {
        throw 'Product not found';
    }

    await db.Inventory.destroy({
        where: { productId: product.id }
    });

    await product.destroy();

    return { message: 'Product deleted permanently' };
}

