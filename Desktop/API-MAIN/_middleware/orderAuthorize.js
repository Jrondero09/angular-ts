// /middleware/orderAuthorize.js

const jwt = require('express-jwt');
const { secret } = require('config.json');
const db = require('_helpers/db');

module.exports = authorizeOrder;

function authorizeOrder(roles = []) {
    // roles param can be a single role or an array of roles
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // authenticate JWT token
        jwt({ secret, algorithms: ['HS256'] }),

        // authorize based on user role
        async (req, res, next) => {
            const Order = await db.Order.findByPk(req.user.id);
            if (!user || (roles.length && !roles.includes(user.role))) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // authorization successful
            req.user.role = Order.role;
            next();
        }
    ];
}
