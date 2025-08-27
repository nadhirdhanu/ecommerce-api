const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { checkout, listOrders } = require('../services/orders.service');

router.use(requireAuth);

router.post('/', async (req, res, next) => {
  try {
    const order = await checkout(req.user.id);
    res.status(201).json(order);
  } catch (err) { next(err); }
});

router.get('/orders', async (req, res, next) => {
  try {
    res.json({ items: await listOrders(req.user.id) });
  } catch (err) { next(err); }
});

module.exports = router;
