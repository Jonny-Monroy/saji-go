const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const totalToday = await db('shipments').whereRaw('DATE(created_at) = ?', [today]).count('* as count').first();
    const pending = await db('shipments').where({ status: 'requested' }).count('* as count').first();
    const inTransit = await db('shipments').where({ status: 'in_transit' }).count('* as count').first();
    const delivered = await db('shipments').where({ status: 'delivered' }).count('* as count').first();
    const revenue = await db('shipments').whereRaw('DATE(created_at) = ?', [today]).sum('shipping_fee as total').first();
    res.json({
      today: { total: parseInt(totalToday.count), revenue: parseInt(revenue.total || 0) },
      pending: parseInt(pending.count),
      inTransit: parseInt(inTransit.count),
      delivered: parseInt(delivered.count)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/shipments/pending-national', async (req, res) => {
  try {
    const shipments = await db('shipments')
      .where({ service_scope: 'national', status: 'requested' })
      .orderBy('created_at', 'desc');
    res.json({ data: shipments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/shipments/:id/assign-partner', async (req, res) => {
  try {
    const { partnerId, externalTrackingNumber, partnerCost } = req.body;
    await db('shipments').where('id', req.params.id).update({ status: 'in_transit', updated_at: new Date() });
    await db('shipment_legs').insert({
      shipment_id: req.params.id,
      leg_number: 3,
      leg_type: 'national_transport',
      partner_id: partnerId,
      external_tracking_number: externalTrackingNumber,
      status: 'in_transit',
      started_at: new Date()
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;