const bcrypt = require('bcrypt');
const crypto = require('crypto');

const { prisma } = require('../db/prisma')
const { signToken } = require('../utils/jwt');

async function signup({ email, password, role = 'user' }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role
    }
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return {
    user: { id: user.id, email: user.email, role: user.role },
    token
  };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return {
    user: { id: user.id, email: user.email, role: user.role },
    token
  };
}

module.exports = { signup, login };
