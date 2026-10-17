exports.up = async function(knex) {
  // Extension PostGIS
  await knex.raw('CREATE EXTENSION IF NOT EXISTS postgis');

  // Ciudades
  await knex.schema.createTable('cities', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable();
    table.string('department', 100);
    table.string('country', 50).defaultTo('Colombia');
    table.specificType('center_point', 'GEOGRAPHY(POINT, 4326)');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
  
// Zonas (Bogotá)
  await knex.schema.createTable('zones', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 50).notNullable(); // Norte, Centro, Sur
    table.uuid('city_id').references('id').inTable('cities');
    table.specificType('polygon', 'GEOGRAPHY(POLYGON, 4326)');
    table.specificType('service_types', 'TEXT[]').defaultTo('{"local","express"}');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });


  // Usuarios
  await knex.schema.createTable('users', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('role').notNullable(); // customer | courier | admin | operator
    table.string('email').unique();
    table.string('phone').unique();
    table.string('password_hash');
    table.string('full_name');
    table.string('document_number');
    table.string('bank_info', 500);
    table.uuid('zone_id').references('id').inTable('zones');
    table.specificType('location', 'GEOGRAPHY(POINT, 4326)');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  
  // Tarifas locales por zona
  await knex.schema.createTable('zone_rates', table => {
    table.uuid('zone_id').references('id').inTable('zones');
    table.string('service_type', 20); // local | express
    table.integer('base_fee').notNullable();
    table.integer('per_km_fee').defaultTo(0);
    table.integer('min_distance_km').defaultTo(0);
    table.integer('courier_cost').notNullable();
    table.time('cutoff_time');
    table.integer('sla_hours');
    table.primary(['zone_id', 'service_type']);
  });

  // Tarifas nacionales por ciudad
  await knex.schema.createTable('city_rates', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('origin_city_id').references('id').inTable('cities');
    table.uuid('destination_city_id').references('id').inTable('cities');
    table.integer('base_fee').notNullable();
    table.integer('per_kg_fee').notNullable();
    table.integer('min_sla_days').defaultTo(1);
    table.integer('max_sla_days').defaultTo(3);
    table.string('transport_mode', 20).defaultTo('terrestre');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Aliados logísticos
  await knex.schema.createTable('partners', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable();
    table.string('contact_phone', 20);
    table.string('contact_email', 100);
    table.string('tracking_url_template', 255);
    table.integer('cost_per_kg');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Cobertura de aliados
  await knex.schema.createTable('partner_coverage', table => {
    table.uuid('partner_id').references('id').inTable('partners');
    table.uuid('city_id').references('id').inTable('cities');
    table.integer('priority').defaultTo(1);
    table.primary(['partner_id', 'city_id']);
  });

  // Envíos
  await knex.schema.createTable('shipments', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('tracking_number', 50).unique();
    table.string('service_scope', 20); // local | national
    table.string('service_type', 20); // express | local | city | extended
    table.uuid('origin_zone_id').references('id').inTable('zones');
    table.uuid('destination_zone_id').references('id').inTable('zones');
    table.uuid('destination_city_id').references('id').inTable('cities');
    table.uuid('customer_id').references('id').inTable('users');
    table.uuid('courier_id').references('id').inTable('users');
    table.text('origin_address');
    table.text('destination_address');
    table.specificType('origin_point', 'GEOGRAPHY(POINT, 4326)');
    table.specificType('destination_point', 'GEOGRAPHY(POINT, 4326)');
    table.decimal('weight_kg', 6, 2);
    table.jsonb('dimensions_cm');
    table.string('payment_type', 20); // contado | cobro | contraentrega
    table.integer('shipping_fee');
    table.integer('product_value').defaultTo(0);
    table.integer('total_collect');
    table.string('status', 20).defaultTo('requested');
    table.timestamp('estimated_delivery');
    table.timestamp('delivered_at');
    table.timestamps(true, true);
  });

  // Etapas del envío
  await knex.schema.createTable('shipment_legs', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('shipment_id').references('id').inTable('shipments');
    table.integer('leg_number').notNullable();
    table.string('leg_type', 30); // pickup | hub_transfer | national_transport | local_delivery
    table.uuid('partner_id').references('id').inTable('partners');
    table.string('external_tracking_number', 50);
    table.uuid('courier_id').references('id').inTable('users');
    table.specificType('from_location', 'GEOGRAPHY(POINT, 4326)');
    table.specificType('to_location', 'GEOGRAPHY(POINT, 4326)');
    table.string('status', 20).defaultTo('pending');
    table.timestamp('started_at');
    table.timestamp('completed_at');
    table.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('shipment_legs');
  await knex.schema.dropTableIfExists('shipments');
  await knex.schema.dropTableIfExists('partner_coverage');
  await knex.schema.dropTableIfExists('partners');
  await knex.schema.dropTableIfExists('city_rates');
  await knex.schema.dropTableIfExists('zone_rates');
  await knex.schema.dropTableIfExists('zones');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('cities');
};