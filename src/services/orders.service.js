const crypto = require('crypto');
const { prisma } = require('../db/prisma');
const { snap } = require('../lib/midtrans');

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

  if (cartItems.length === 0) throw new Error('Cart is empty');

  let total = 0;
  const orderItems = [];

  for (const item of cartItems) {
    const { product, qty } = item;
    if (!product) throw new Error('Product not found');
    if (qty > product.stock) throw new Error(`Insufficient stock for ${product.name}`);
    total += product.price * qty;
    orderItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty
    });
  }

  // Create Midtrans transaction
  const transaction = await snap.createTransaction({
    transaction_details: {
      order_id: `order-${Date.now()}`,
      gross_amount: total
    },
    customer_details: {
      first_name: 'User',
      email: 'user@example.com'
    },
    item_details: cartItems.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.qty
    }))
  });

  return {
    snapToken: transaction.token,
    redirectUrl: transaction.redirect_url,
    total,
    currency: 'IDR',
    items: orderItems
  };
}

async function listOrders(userId) {
  return await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });
}

async function confirmOrder(userId) {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true }
  });

  if (cartItems.length === 0) throw new Error('Cart is empty');

  const orderItems = [];
  let total = 0;

  for (const item of cartItems) {
    const { product, qty } = item;
    if (!product) throw new Error('Product not found');
    if (qty > product.stock) throw new Error(`Insufficient stock for ${product.name}`);
    total += product.price * qty;
    orderItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty
    });
  }

  const order = await prisma.$transaction(async tx => {
    // Deduct stock
    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty } }
      });
    }

    // Create order
    const createdOrder = await tx.order.create({
      data: {
        userId,
        total,
        status: 'paid',
        items: {
          create: orderItems
        }
      },
      include: { items: true }
    });

    // Clear cart
    await tx.cartItem.deleteMany({ where: { userId } });

    return createdOrder;
  });

  return order;
}

module.exports = { checkout, listOrders };
