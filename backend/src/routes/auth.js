const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'saji-go-dev-secret';

router.post('/register', async (req, res) => {
  try {
    const { email, phone, password, full_name, role, document_number } = req.body;
    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }
    const existing = await db('users').where({ email }).first();
    if (existing) return res.status(409).json({ error: 'Email ya registrado' });

    const password_hash = await bcrypt.hash(password, 10);
    const [user] = await db('users')
      .insert({ email, phone, password_hash, full_name, role: role || 'customer', document_number })
      .returning(['id', 'email', 'full_name', 'role']);

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db('users').where({ email }).first();
    if (!user) return res.status(401).json({ error: 'Credenciales invalidas' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Credenciales invalidas' });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;