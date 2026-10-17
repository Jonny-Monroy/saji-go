# SAJI GO · Plataforma de mensajería y última milla

Sistema completo de envíos para Bogotá con dos ámbitos: **local** (mismo día / express, 60–90 min) y **nacional** (1–3 días a través de aliados logísticos). Monorepo con backend API, app móvil PWA para clientes y couriers, y dashboard administrativo.

## Lo que lo hace interesante

**El motor de tarifas usa consultas espaciales reales de PostGIS** — no tablas planas:

| Ámbito | Cálculo | SQL espacial |
|---|---|---|
| Express | $6.000 base + $1.200/km desde el hub, +80 % lluvia | `ST_Distance` sobre `GEOGRAPHY(POINT)` |
| Local | Tarifa por zona con puntos en memoria (radio de cobertura) | `ST_Within` punto-en-polígono contra `zone_rates` |
| Nacional | Tarifa base por ciudad + kg adicional (10 ciudades) | `city_rates` con plantillas de rastreo por aliado |

## Arquitectura

```
┌─ apps/mobile  (React 18 + Vite + PWA) ──── cliente & courier: wizard de envíos multi-paso
├─ apps/admin   (React 18 + Vite) ─────────── dashboard operativo: KPIs, asignación de aliados
└─ backend      (Node + Express + Knex + PostGIS)
     ├─ auth        JWT + bcrypt, rate-limit, helmet
     ├─ pricing     cotizador geoespacial (el corazón del negocio)
     ├─ shipments   guías + shipment_legs (pickup → hub → transporte → entrega)
     ├─ zones/cities coberturas y tarifas
     ├─ partners    aliados (Servientrega, Coordinadora) con URL de rastreo
     └─ admin       métricas del día, estados, ingresos
```

## Modelo de datos (migraciones Knex)

9 tablas con tipos geográficos nativos (`GEOGRAPHY(POINT/POLYGON, 4326)`), UUIDs, y `shipment_legs` para las etapas del envío (`pickup`, `hub_transfer`, `national_transport`, `local_delivery`). Seeds con 10 ciudades colombianas, malla de tarifas y aliados reales con plantillas de tracking.

## Ejecución

```bash
docker compose up --build
# db (PostGIS)  → localhost:5432  · healthcheck
# backend API   → localhost:3000
# app móvil     → localhost:5173
# admin         → localhost:5174
```

Variables del backend en `backend/.env` (ver estructura en `.env.example`): `DATABASE_URL`, `JWT_SECRET`, `PORT`.

## Stack

`Node.js` `Express` `Knex` `PostGIS` `JWT` `React 18` `Vite` `PWA` `Docker Compose` `helmet` `express-rate-limit`

---
**Jonny Alejandro Monroy Chavez** · [GitHub](https://github.com/Jonny-Monroy) · [LinkedIn](https://linkedin.com/in/jonny-alejandro-monroy-chavez)
