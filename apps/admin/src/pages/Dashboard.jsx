import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ today: { total: 0, revenue: 0 }, pending: 0, inTransit: 0, delivered: 0 });
  const [nationalShipments, setNationalShipments] = useState([]);
  const [partners, setPartners] = useState([]);

  useEffect(() => { fetchDashboard(); fetchNational(); fetchPartners(); }, []);

  const fetchDashboard = async () => {
    try { const res = await axios.get(`${API_URL}/admin/dashboard`); setStats(res.data); }
    catch (err) { console.error(err); }
  };

  const fetchNational = async () => {
    try { const res = await axios.get(`${API_URL}/admin/shipments/pending-national`); setNationalShipments(res.data.data || []); }
    catch (err) { console.error(err); }
  };

  const fetchPartners = async () => {
    try { const res = await axios.get(`${API_URL}/partners`); setPartners(res.data.data || []); }
    catch (err) { console.error(err); }
  };

  const assignPartner = async (shipmentId, partnerId, externalTracking) => {
    try {
      await axios.post(`${API_URL}/admin/shipments/${shipmentId}/assign-partner`, {
        partnerId, externalTrackingNumber: externalTracking, partnerCost: 15000
      });
      fetchNational(); fetchDashboard();
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ width: 40, height: 40, background: 'var(--saji-green)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'white', fontWeight: 'bold' }}>S</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>SAJI GO Admin</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Envíos hoy', value: stats.today.total, color: 'var(--saji-green)' },
          { label: 'Ingresos hoy', value: `$${stats.today.revenue.toLocaleString()}`, color: 'var(--saji-green)' },
          { label: 'Pendientes', value: stats.pending, color: 'var(--saji-orange)' },
          { label: 'En ruta', value: stats.inTransit, color: '#333' }
        ].map(s => (
          <div key={s.label} style={{ background: 'white', padding: 20, borderRadius: 12, borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: s.color }}>{s.value}</div>
            <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', padding: 24, borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16, fontWeight: 600 }}>Envíos nacionales pendientes de aliado</h2>
        {nationalShipments.length === 0 ? (
          <p style={{ color: '#999' }}>No hay envíos nacionales pendientes</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '10px 0' }}>Guía</th>
                <th>Destino</th>
                <th>Peso</th>
                <th>Tarifa</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {nationalShipments.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 0', fontWeight: 500 }}>{s.tracking_number}</td>
                  <td>{s.destination_address?.substring(0, 30)}...</td>
                  <td>{s.weight_kg} kg</td>
                  <td>${s.shipping_fee?.toLocaleString()}</td>
                  <td>
                    <select onChange={e => { if (e.target.value) { const ext = prompt('Número de guía del aliado:'); if (ext) assignPartner(s.id, e.target.value, ext); } }} style={{ padding: 6, borderRadius: 6, border: '1px solid #ddd' }}>
                      <option value="">Asignar aliado...</option>
                      {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}