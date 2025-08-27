const express = require('express');
const cors = require('cors');
const { errorHandler, notFound } = require('./middleware/error');

const adminRoutes = require('./routes/admin.routes');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/products.routes');
const cartRoutes = require('./routes/cart.routes');
const checkoutRoutes = require('./routes/checkout.routes');

const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Routes
app.use('/admin', adminRoutes);

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/checkout', checkoutRoutes);

// 404 + error
app.use(notFound);
app.use(errorHandler);

module.exports = app;
