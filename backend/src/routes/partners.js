const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const partners = await db('partners').where({ is_active: true }).orderBy('name');
    res.json({ data: partners });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/coverage', async (req, res) => {
  try {
    const coverage = await db('partner_coverage')
      .join('cities', 'cities.id', 'partner_coverage.city_id')
      .where({ partner_id: req.params.id })
      .select('cities.*', 'partner_coverage.priority');
    res.json({ data: coverage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;