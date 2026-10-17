import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function CustomerHome() {
  const [shipments, setShipments] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('saji_user') || '{}');
    setUser(u);
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const token = localStorage.getItem('saji_token');
      const res = await axios.get(`${API_URL}/shipments?limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShipments(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  const statusColors = {
    requested: '#FF6B00',
    assigned: '#7ED321',
    picked_up: '#7ED321',
    in_transit: '#7ED321',
    delivered: '#0A1628'
  };

  const statusLabels = {
    requested: 'Solicitado',
    assigned: 'Asignado',
    picked_up: 'Recogido',
    in_transit: 'En ruta',
    delivered: 'Entregado'
  };

  return (
    <div style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, padding: '8px 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, background: 'var(--saji-green)',
            borderRadius: 10, display: 'flex', alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>S</span>
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600 }}>SAJI GO</h1>
            <p style={{ fontSize: 12, color: '#666' }}>Hola, {user?.full_name || 'Cliente'}</p>
          </div>
        </div>
        <button onClick={logout} style={{
          background: 'none', border: 'none', color: '#666', fontSize: 13,
          cursor: 'pointer'
        }}>Salir</button>
      </header>

      <Link to="/customer/enviar" style={{ textDecoration: 'none' }}>
        <div style={{
          background: 'var(--saji-green)', color: 'white', padding: 24,
          borderRadius: 16, marginBottom: 16, textAlign: 'center'
        }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📦</div>
          <h2 style={{ fontSize: 18, marginBottom: 4 }}>Enviar paquete</h2>
          <p style={{ opacity: 0.9, fontSize: 14 }}>
            Local en Bogotá o a cualquier ciudad
          </p>
        </div>
      </Link>

      <div style={{ background: 'white', padding: 20, borderRadius: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, marginBottom: 12, fontWeight: 600 }}>
          Mis envíos recientes
        </h3>
        {shipments.length === 0 ? (
          <p style={{ color: '#999', fontSize: 14 }}>No tienes envíos aún</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {shipments.map(s => (
              <div key={s.id} style={{
                padding: 12, borderRadius: 10, border: '1px solid #eee',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{s.tracking_number}</p>
                  <p style={{ fontSize: 12, color: '#666' }}>
                    {s.destination_address?.substring(0, 30)}...
                  </p>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: 11,
                  fontWeight: 500, background: (statusColors[s.status] || '#666') + '20',
                  color: statusColors[s.status] || '#666'
                }}>
                  {statusLabels[s.status] || s.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        background: 'white', padding: 20, borderRadius: 16,
        display: 'flex', gap: 12, overflowX: 'auto'
      }}>
        {[
          { icon: '🚚', label: 'Local', desc: 'Mismo día' },
          { icon: '⚡', label: 'Express', desc: '60-90 min' },
          { icon: '🏙️', label: 'Nacional', desc: '1-3 días' }
        ].map(s => (
          <div key={s.label} style={{
            minWidth: 100, padding: 16, borderRadius: 12,
            border: '1px solid #eee', textAlign: 'center'
          }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
            <p style={{ fontSize: 13, fontWeight: 500 }}>{s.label}</p>
            <p style={{ fontSize: 11, color: '#999' }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}