const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { checkout, listOrders } = require('../services/orders.service');
const { confirmOrder } = require('../services/orders.service');

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
    const userId = extractUserId(event.order_id); // depends on how you encode it
    await confirmOrder(userId);
  }

  res.status(200).json({ received: true });
});

module.exports = router;
