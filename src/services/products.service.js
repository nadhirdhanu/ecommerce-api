const crypto = require('crypto');
const { prisma } = require('../db/prisma')

async function listProducts({ q, limit = 20, offset = 0 }) {
  const where = q
    ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } }
      ]
    }
    : {};

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: Number(offset),
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({ where })
  ]);

  return { total, items };
}

async function getProduct(id) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  return product;
}

async function createProduct(data) {
  try {
    const product = await prisma.product.create({ data });
    return product;
  } catch (err) {
    if (err.code === 'P2002') {
      const conflict = new Error('SKU must be unique');
      conflict.status = 409;
      throw conflict;
    }
    throw err;
  }
}

async function updateProduct(id, patch) {
  try {
    const updated = await prisma.product.update({
      where: { id },
      data: patch
    });
    return updated;
  } catch (err) {
    if (err.code === 'P2025') {
      const notFound = new Error('Product not found');
      notFound.status = 404;
      throw notFound;
    }
    if (err.code === 'P2002') {
      const conflict = new Error('SKU must be unique');
      conflict.status = 409;
      throw conflict;
    }
    throw err;
  }
}

async function deleteProduct(id) {
  try {
    await prisma.product.delete({ where: { id } });
    return { deleted: true };
  } catch (err) {
    if (err.code === 'P2025') {
      const notFound = new Error('Product not found');
      notFound.status = 404;
      throw notFound;
    }
    throw err;
  }
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
