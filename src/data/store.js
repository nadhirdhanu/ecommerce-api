const crypto = require('crypto');

// Users, Products, Carts, Orders in-memory
const db = {
  users: [], // { id, email, passwordHash, role: 'user'|'admin', createdAt }
  products: [], // { id, name, description, price, sku, stock, createdAt, updatedAt }
  carts: new Map(), // userId -> [{ productId, qty }]
  orders: [] // { id, userId, items: [{productId, name, price, qty}], total, createdAt, status }
};

// Seed an admin user and sample products on boot
function seed() {
  if (db.products.length === 0) {
    db.products.push(
      { id: crypto.randomUUID(), name: 'T-Shirt', description: 'Cotton tee', price: 120000, sku: 'TS-001', stock: 20, createdAt: new Date(), updatedAt: new Date() },
      { id: crypto.randomUUID(), name: 'Hoodie', description: 'Fleece hoodie', price: 350000, sku: 'HD-001', stock: 10, createdAt: new Date(), updatedAt: new Date() }
    );
  }
}
seed();

module.exports = { db };
