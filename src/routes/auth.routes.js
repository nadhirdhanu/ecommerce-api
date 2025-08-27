const router = require('express').Router();
const { z } = require('zod');
const { signup, login } = require('../services/auth.service');

// Validation schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['user', 'admin']).optional()
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/signup', async (req, res, next) => {
  try {
    const body = signupSchema.parse(req.body);
    const result = await signup(body);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const result = await login(body);
    res.json(result);
  } catch (err) { next(err); }
});

module.exports = router;
