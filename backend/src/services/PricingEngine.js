const db = require('../config/database');

class PricingEngine {
  async calculateLocal(destinationLng, destinationLat, serviceType, weightKg = 1) {
    if (serviceType === 'express') {
      // Hub más cercano (Suba o Usaquén)
      const hub = await db.raw(`
        SELECT id, name,
          ST_Distance(
            ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
            ST_SetSRID(ST_MakePoint(-74.072, 4.711), 4326)::geography
          ) / 1000 as distance_km
      `, [destinationLng, destinationLat]).then(r => r.rows[0]);

      const distanceKm = Math.round(hub.distance_km || 5);
      const chargeableKm = Math.max(0, distanceKm - 3);
      const fee = 6000 + (chargeableKm * 1200);
      const courierCost = 4000 + (chargeableKm * 500);
      
      return {
        fee,
        courierCost,
        distanceKm,
        sla: '60-90 min',
        serviceType: 'express'
      };
    }

    // Servicio local por zona
    const zone = await db.raw(`
      SELECT z.id, z.name, zr.base_fee, zr.courier_cost, zr.sla_hours
      FROM zones z
      JOIN zone_rates zr ON zr.zone_id = z.id
      WHERE zr.service_type = 'local'
        AND ST_Within(
          ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
          z.polygon::geography
        )
      LIMIT 1
    `, [destinationLng, destinationLat]).then(r => r.rows[0]);

    if (!zone) {
      throw new Error('Dirección fuera de zona de cobertura local');
    }

    return {
      fee: zone.base_fee,
      courierCost: zone.courier_cost,
      zoneId: zone.id,
      zoneName: zone.name,
      sla: `${zone.sla_hours}h`,
      serviceType: 'local'
    };
  }

  async calculateNational(destinationCityId, weightKg) {
    const rate = await db('city_rates')
      .where({ destination_city_id: destinationCityId, is_active: true })
      .first();

    if (!rate) {
      throw new Error('Ciudad destino no disponible');
    }

    const extraKg = Math.max(0, weightKg - 1);
    const fee = rate.base_fee + (extraKg * rate.per_kg_fee);

    return {
      fee: Math.round(fee),
      baseFee: rate.base_fee,
      perKgFee: rate.per_kg_fee,
      sla: `${rate.min_sla_days}-${rate.max_sla_days} días`,
      serviceType: 'national'
    };
  }
}

module.exports = new PricingEngine();