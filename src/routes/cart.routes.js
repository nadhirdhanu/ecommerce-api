const router = require('express').Router();
const { z } = require('zod');
const { requireAuth } = require('../middleware/auth');
const svc = require('../services/cart.service');

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    res.json(await svc.getCart(req.user.id));
  } catch (err) { next(err); }
});

router.post('/items', async (req, res, next) => {
  try {
    const schema = z.object({
      productId: z.string().uuid(),
      qty: z.number().int().positive().default(1)
    });
    const body = schema.parse(req.body);
    const cart = await svc.addToCart(req.user.id, body.productId, body.qty);
    res.status(201).json(cart);
  } catch (err) { next(err); }
});

router.put('/items/:productId', async (req, res, next) => {
  try {
    const schema = z.object({ qty: z.number().int().nonnegative() });
    const body = schema.parse(req.body);
    const cart = await svc.updateCartItem(req.user.id, req.params.productId, body.qty);
    res.json(cart);
  } catch (err) { next(err); }
});

router.delete('/items/:productId', async (req, res, next) => {
  try {
    const cart = await svc.removeFromCart(req.user.id, req.params.productId);
    res.json(cart);
  } catch (err) { next(err); }
});

module.exports = router;
