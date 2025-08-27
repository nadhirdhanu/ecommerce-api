const router = require('express').Router();
const { z } = require('zod');
const { requireAuth, requireRole } = require('../middleware/auth');
const svc = require('../services/products.service');

// Public: list & get
router.get('/', async (req, res, next) => {
  try {
    const { q, limit, offset } = req.query;
    const data = await svc.listProducts({ q, limit, offset });
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    res.json(await svc.getProduct(req.params.id));
  } catch (err) { next(err); }
});

// Admin: create, update, delete
const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  price: z.number().int().positive(), // in IDR
  sku: z.string().min(1),
  stock: z.number().int().nonnegative()
});
const updateSchema = productSchema.partial();

router.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const body = productSchema.parse(req.body);
    const created = await svc.createProduct(body);
    res.status(201).json(created);
  } catch (err) { next(err); }
});

router.put('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const patch = updateSchema.parse(req.body);
    const updated = await svc.updateProduct(req.params.id, patch);
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    res.json(await svc.deleteProduct(req.params.id));
  } catch (err) { next(err); }
});

module.exports = router;
