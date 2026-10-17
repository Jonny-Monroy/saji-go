exports.seed = async function(knex) {
  // Ciudades
  await knex('cities').del();
  await knex('cities').insert([
    { id: '11111111-1111-1111-1111-111111111111', name: 'Bogotá', department: 'Cundinamarca', center_point: knex.raw('ST_SetSRID(ST_MakePoint(-74.072, 4.711), 4326)') },
    { name: 'Medellín', department: 'Antioquia', center_point: knex.raw('ST_SetSRID(ST_MakePoint(-75.563, 6.251), 4326)') },
    { name: 'Cali', department: 'Valle del Cauca', center_point: knex.raw('ST_SetSRID(ST_MakePoint(-76.522, 3.452), 4326)') },
    { name: 'Barranquilla', department: 'Atlántico', center_point: knex.raw('ST_SetSRID(ST_MakePoint(-74.797, 10.963), 4326)') },
    { name: 'Cartagena', department: 'Bolívar', center_point: knex.raw('ST_SetSRID(ST_MakePoint(-75.514, 10.391), 4326)') },
    { name: 'Bucaramanga', department: 'Santander', center_point: knex.raw('ST_SetSRID(ST_MakePoint(-73.119, 7.125), 4326)') },
    { name: 'Pereira', department: 'Risaralda', center_point: knex.raw('ST_SetSRID(ST_MakePoint(-75.695, 4.814), 4326)') },
    { name: 'Manizales', department: 'Caldas', center_point: knex.raw('ST_SetSRID(ST_MakePoint(-75.518, 5.069), 4326)') },
    { name: 'Villavicencio', department: 'Meta', center_point: knex.raw('ST_SetSRID(ST_MakePoint(-73.637, 4.142), 4326)') },
    { name: 'Ibagué', department: 'Tolima', center_point: knex.raw('ST_SetSRID(ST_MakePoint(-75.233, 4.438), 4326)') }
  ]);

  // Tarifas nacionales (desde Bogotá)
  const bogotaId = '11111111-1111-1111-1111-111111111111';
  const cities = await knex('cities').whereNot('id', bogotaId).select('id', 'name');
  
  const cityRates = [
    { destination: 'Medellín', base: 18000, kg: 3500, min: 1, max: 2 },
    { destination: 'Cali', base: 18000, kg: 3500, min: 1, max: 2 },
    { destination: 'Barranquilla', base: 25000, kg: 4500, min: 2, max: 3 },
    { destination: 'Cartagena', base: 25000, kg: 4500, min: 2, max: 3 },
    { destination: 'Bucaramanga', base: 20000, kg: 3500, min: 1, max: 2 },
    { destination: 'Pereira', base: 18000, kg: 3500, min: 1, max: 2 },
    { destination: 'Manizales', base: 18000, kg: 3500, min: 1, max: 2 },
    { destination: 'Villavicencio', base: 15000, kg: 3000, min: 1, max: 1 },
    { destination: 'Ibagué', base: 16000, kg: 3200, min: 1, max: 2 }
  ];

  await knex('city_rates').del();
  for (const rate of cityRates) {
    const city = cities.find(c => c.name === rate.destination);
    if (city) {
      await knex('city_rates').insert({
        origin_city_id: bogotaId,
        destination_city_id: city.id,
        base_fee: rate.base,
        per_kg_fee: rate.kg,
        min_sla_days: rate.min,
        max_sla_days: rate.max
      });
    }
  }

  // Aliados
  await knex('partners').del();
  await knex('partners').insert([
    { name: 'Servientrega', tracking_url_template: 'https://www.servientrega.com/wps/portal/rastreo/detalle/{guide}', cost_per_kg: 12000 },
    { name: 'Coordinadora', tracking_url_template: 'https://www.coordinadora.com/portafolio-de-servicios/rastreo/{guide}', cost_per_kg: 11000 }
  ]);
};