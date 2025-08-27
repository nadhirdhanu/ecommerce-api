const crypto = require('crypto');
const { prisma } = require('../db/prisma')

function simulateCharge({ amount }) {
  // Simulate payment success after basic checks
  if (amount <= 0) {
    const err = new Error('Invalid amount');
    err.status = 400;
    throw err;
  }
  return { id: 'ch_' + crypto.randomUUID(), status: 'succeeded' };
}

async function checkout(userId) {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true }
  });

  if (cartItems.length === 0) {
    const err = new Error('Cart is empty');
    err.status = 400;
    throw err;
  }

  // Validate stock and calculate total
  const orderItems = [];
  let total = 0;

  for (const item of cartItems) {
    const { product, qty } = item;
    if (!product) throw new Error('Product not found');
    if (qty > product.stock) {
      const err = new Error(`Insufficient stock for ${product.name}`);
      err.status = 400;
      throw err;
    }
    total += product.price * qty;
    orderItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty
    });
  }

  // Simulate payment
  const charge = { id: 'ch_' + Date.now(), status: 'succeeded' };

  // Transaction: deduct stock, create order, clear cart
  const result = await prisma.$transaction(async tx => {
    // Deduct stock
    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty } }
      });
    }

    // Create order
    const order = await tx.order.create({
      data: {
        userId,
        total,
        status: charge.status,
        items: {
          create: orderItems
        }
      },
      include: { items: true }
    });

    // Clear cart
    await tx.cartItem.deleteMany({ where: { userId } });

    return order;
  });

  return result;
}

async function listOrders(userId) {
  return await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });
}

module.exports = { checkout, listOrders };
