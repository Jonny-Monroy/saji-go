const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const zones = await db('zones').where({ is_active: true }).orderBy('name');
    res.json({ data: zones });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;