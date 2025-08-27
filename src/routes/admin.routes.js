const router = require('express').Router();
const { z } = require('zod');
const { requireAuth, requireRole } = require('../middleware/auth');
const { prisma } = require('../db/prisma');

router.use(requireAuth, requireRole('admin'));

// GET /admin/orders?status=paid
router.get('/orders', async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const orders = await prisma.order.findMany({
      where,
      include: { items: true, user: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ items: orders });
  } catch (err) {
    next(err);
  }
});

// GET /admin/orders/:id
router.get('/orders/:id', async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true, user: true }
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// PATCH /admin/orders/:id
router.patch('/orders/:id', async (req, res, next) => {
  try {
    const schema = z.object({
      status: z.enum(['paid', 'pending', 'failed', 'refunded', 'shipped']).optional()
    });
    const patch = schema.parse(req.body);
    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: patch
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
