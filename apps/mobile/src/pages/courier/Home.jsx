import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function CourierHome() {
  const [available, setAvailable] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('saji_user') || '{}');
    setUser(u);
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('saji_token');
      const res = await axios.get(`${API_URL}/shipments?status=assigned&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  const toggleAvailable = () => {
    setAvailable(!available);
  };

  return (
    <div style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24
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
            <p style={{ fontSize: 12, color: '#666' }}>Mensajero</p>
          </div>
        </div>
        <button onClick={logout} style={{
          background: 'none', border: 'none', color: '#666', fontSize: 13,
          cursor: 'pointer'
        }}>Salir</button>
      </header>

      <button onClick={toggleAvailable} style={{
        width: '100%', padding: 20, borderRadius: 16,
        border: 'none', background: available ? 'var(--saji-green)' : '#ddd',
        color: available ? 'white' : '#666', fontSize: 16, fontWeight: 600,
        cursor: 'pointer', marginBottom: 24, transition: 'all 0.3s'
      }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>
          {available ? '✅' : '⏸️'}
        </div>
        {available ? 'Disponible - Esperando asignaciones' : 'No disponible'}
      </button>

      <div style={{ background: 'white', padding: 20, borderRadius: 16 }}>
        <h3 style={{ fontSize: 16, marginBottom: 12, fontWeight: 600 }}>
          Asignaciones de hoy
        </h3>
        {assignments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
            <p style={{ color: '#999', fontSize: 14 }}>
              {available ? 'Esperando nuevas asignaciones...' : 'Activa disponibilidad para recibir'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {assignments.map(a => (
              <div key={a.id} style={{
                padding: 12, borderRadius: 10, border: '1px solid #eee'
              }}>
                <p style={{ fontSize: 13, fontWeight: 500 }}>{a.tracking_number}</p>
                <p style={{ fontSize: 12, color: '#666' }}>
                  {a.origin_address?.substring(0, 30)}...
                </p>
                <button style={{
                  marginTop: 8, padding: '8px 16px', borderRadius: 8,
                  border: 'none', background: 'var(--saji-green)', color: 'white',
                  fontSize: 13, cursor: 'pointer'
                }}>
                  Aceptar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}