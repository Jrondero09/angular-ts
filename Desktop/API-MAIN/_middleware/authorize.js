// middleware/authorize.js
const Role = require('_helpers/role');
const jwt = require('express-jwt');
const { secret } = require('config.json');
const db = require('_helpers/db');

module.exports = authorize;

function authorize(roles = []) {

    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        jwt({ secret, algorithms: ['HS256'] }),

        async (req, res, next) => {
            const account = await db.Account.findByPk(req.user.id);
            if (!account || (roles.length && !roles.includes (account.role))) {
            return res.status(401).json({ message: 'Unauthorized' });
            }

            req.user.role = account.role;
            const refreshTokens = await account.getRefreshTokens();
            req.user.ownsToken = token => !!refreshTokens.find(x => x.token === token);
            next();
        }
    ]
}
    

module.exports = function authorize(roles = []) {
    return (req, res, next) => {
        // Allow access to the login route without a token
        if (req.path.startsWith('/api/auth/login')) {
            return next();
        }

        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided. Please authenticate.' });
        }

        // Add your logic here to verify token and role...
    };

};





module.exports = function (roles) {
    return (req, res, next) => {
        // Check if the logged-in user's role is authorized
        if (!roles.includes(req.Customer.role)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // If the user is a 'User' role, they can only access their own data
        if (req.Customer.role === Role.Customer) {
            const customerId = req.user.id;      // ID of the logged-in user
            const requestedcustomerId = parseInt(req.params.id, 10);  // ID being requested in the route

            // Ensure that the user can only access their own data
            if (customerId !== requestedcustomerId) {
                return res.status(403).json({ message: 'Unauthorized to access this data' });
            }
        }

        // If authorized, proceed to the next middleware
        next();
    };
}
