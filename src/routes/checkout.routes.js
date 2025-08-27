const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { checkout, listOrders } = require('../services/orders.service');

router.use(requireAuth);

router.post('/', async (req, res, next) => {
  try {
    const result = await checkout(req.user.id);
    res.status(200).json(result); // contains snapToken and redirectUrl
  } catch (err) {
    next(err);
  }
});

router.get('/orders', async (req, res, next) => {
  try {
    res.json({ items: await listOrders(req.user.id) });
  } catch (err) { next(err); }
});

router.post('/webhook/midtrans', async (req, res) => {
  const event = req.body;

  if (event.transaction_status === 'settlement') {
    const orderId = event.order_id;
    const userId = event.user_id || extractFromMetadata(orderId); // depends on how you pass user info

    await confirmOrder(userId); // deduct stock, create order, clear cart
  }

  res.status(200).json({ received: true });
});

module.exports = router;
