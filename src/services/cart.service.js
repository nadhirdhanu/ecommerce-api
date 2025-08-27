const { prisma } = require('../db/prisma')
const { getProduct } = require('./products.service');

async function getCart(userId) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true }
  });

  const detailed = items.map(ci => ({
    productId: ci.productId,
    name: ci.product.name,
    price: ci.product.price,
    qty: ci.qty,
    subtotal: ci.product.price * ci.qty
  }));

  const total = detailed.reduce((sum, item) => sum + item.subtotal, 0);
  return { items: detailed, total };
}

async function addToCart(userId, productId, qty) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error('Product not found');
  if (qty < 1) qty = 1;

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId, productId } }
  });

  const desiredQty = (existing?.qty || 0) + qty;
  if (desiredQty > product.stock) throw new Error('Insufficient stock');

  if (existing) {
    await prisma.cartItem.update({
      where: { userId_productId: { userId, productId } },
      data: { qty: desiredQty }
    });
  } else {
    await prisma.cartItem.create({
      data: { userId, productId, qty }
    });
  }

  return getCart(userId);
}

async function updateCartItem(userId, productId, qty) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error('Product not found');

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId, productId } }
  });

  if (!existing) throw new Error('Item not in cart');

  if (qty <= 0) {
    await prisma.cartItem.delete({
      where: { userId_productId: { userId, productId } }
    });
  } else {
    if (qty > product.stock) throw new Error('Insufficient stock');
    await prisma.cartItem.update({
      where: { userId_productId: { userId, productId } },
      data: { qty }
    });
  }

  return getCart(userId);
}

async function removeFromCart(userId, productId) {
  await prisma.cartItem.deleteMany({
    where: { userId, productId }
  });
  return getCart(userId);
}

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
