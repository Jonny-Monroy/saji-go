const express = require('express');
const router = express.Router();
const db = require('../config/database');

function generateTrackingNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `SJ-${timestamp}-${random}`;
}

router.post('/', async (req, res) => {
  try {
    const { customerId, serviceScope, serviceType, destinationCityId, originAddress, destinationAddress, weightKg, dimensions, paymentType, shippingFee, productValue, totalCollect } = req.body;
    const trackingNumber = generateTrackingNumber();
    const [shipment] = await db('shipments').insert({
      tracking_number: trackingNumber,
      service_scope: serviceScope,
      service_type: serviceType,
      destination_city_id: destinationCityId || null,
      customer_id: customerId,
      origin_address: originAddress,
      destination_address: destinationAddress,
      weight_kg: weightKg,
      dimensions_cm: dimensions ? JSON.stringify(dimensions) : null,
      payment_type: paymentType,
      shipping_fee: shippingFee,
      product_value: productValue || 0,
      total_collect: totalCollect,
      status: 'requested'
    }).returning('*');
    res.status(201).json({ success: true, shipment });
  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { status, customerId, page = 1, limit = 50 } = req.query;
    let query = db('shipments').orderBy('created_at', 'desc');
    if (status) query = query.where({ status });
    if (customerId) query = query.where({ customer_id: customerId });
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const shipments = await query.limit(parseInt(limit)).offset(offset);
    const count = await db('shipments').count('* as total').first();
    res.json({ data: shipments, total: parseInt(count.total), page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const shipment = await db('shipments').where('id', req.params.id).orWhere('tracking_number', req.params.id).first();
    if (!shipment) return res.status(404).json({ error: 'Envio no encontrado' });
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status, courierId } = req.body;
    const updateData = { status, updated_at: new Date() };
    if (courierId) updateData.courier_id = courierId;
    if (status === 'delivered') updateData.delivered_at = new Date();
    await db('shipments').where('id', req.params.id).update(updateData);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;