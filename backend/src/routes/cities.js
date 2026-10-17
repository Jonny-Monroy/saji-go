const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const cities = await db('cities')
      .where({ is_active: true })
      .whereNot('name', 'Bogotá')
      .orderBy('name');
    
    res.json({ data: cities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;