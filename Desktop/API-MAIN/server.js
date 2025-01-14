require('rootpath')();
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const errorHandler = require('_middleware/error-handler');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
//const authorizeOrder = require('../middleware/orderAuthorize');
//const authenticateToken = require('_middleware/authenticateToken');




//console.log(require.resolve('../_middleware/orderAuthorize'));


app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors({origin:(origin,callback) => callback(null, true), credentials: true}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
//app.use(authenticateToken);
//app.use(authorizeOrder(['Admin', 'Manager'])); 



app.use('/users', require('./users/users.controller'));
app.use('/api/users', require('./users/users.controller'));
app.use('/api/auth', require('./users/users.controller'));

app.use('/api/branches', require('./branches/branch.controller'));
app.use('/api/product', require('./product/products.controller'));
app.use('/api/inventory', require('./inventories/inventory.controller'));

app.use('/api/orders', require('./order/order.controller'));
//app.use('/api/auth', require('./order/order.controller'));
app.use('/accounts', require('./accounts/accounts.controller'));

app.use('/api-docs', require('_helpers/swagger'));

app.use(errorHandler);

const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => console.log('Server listening on port ' + port));