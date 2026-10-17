const express = require('express');
const router = express.Router();
const pricingEngine = require('../services/PricingEngine');

router.post('/calculate', async (req, res) => {
  try {
    const { destinationLng, destinationLat, destinationCityId, serviceScope, serviceType, weightKg } = req.body;

    let result;
    if (serviceScope === 'local') {
      result = await pricingEngine.calculateLocal(destinationLng, destinationLat, serviceType, weightKg);
    } else {
      result = await pricingEngine.calculateNational(destinationCityId, weightKg);
    }

    res.json({
      success: true,
      ...result,
      weightKg
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;