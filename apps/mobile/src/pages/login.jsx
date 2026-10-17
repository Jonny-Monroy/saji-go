import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Login() {
  const [role, setRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'register') {
        await axios.post(`${API_URL}/auth/register`, {
          email, password, full_name: fullName, role
        });
      }
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('saji_token', res.data.token);
      localStorage.setItem('saji_role', res.data.user.role);
      localStorage.setItem('saji_user', JSON.stringify(res.data.user));
      navigate(`/${res.data.user.role}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24,
      background: 'var(--saji-navy)'
    }}>
      <div style={{
        width: 72, height: 72, background: 'var(--saji-green)',
        borderRadius: 20, display: 'flex', alignItems: 'center',
        justifyContent: 'center', marginBottom: 20
      }}>
        <span style={{ fontSize: 36, fontWeight: 'bold', color: 'white' }}>S</span>
      </div>
      <h1 style={{ color: 'white', fontSize: 22, marginBottom: 4 }}>SAJI GO</h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32, fontSize: 14 }}>
        Mensajería que te mueve
      </p>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 320 }}>
        {mode === 'register' && (
          <input
            type="text" placeholder="Nombre completo" required
            value={fullName} onChange={e => setFullName(e.target.value)}
            style={{
              width: '100%', padding: 14, borderRadius: 12, border: 'none',
              marginBottom: 12, fontSize: 16, background: 'rgba(255,255,255,0.1)',
              color: 'white'
            }}
          />
        )}
        <input
          type="email" placeholder="Email" required
          value={email} onChange={e => setEmail(e.target.value)}
          style={{
            width: '100%', padding: 14, borderRadius: 12, border: 'none',
            marginBottom: 12, fontSize: 16, background: 'rgba(255,255,255,0.1)',
            color: 'white'
          }}
        />
        <input
          type="password" placeholder="Contraseña" required
          value={password} onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%', padding: 14, borderRadius: 12, border: 'none',
            marginBottom: 16, fontSize: 16, background: 'rgba(255,255,255,0.1)',
            color: 'white'
          }}
        />

        <select
          value={role} onChange={e => setRole(e.target.value)}
          style={{
            width: '100%', padding: 14, borderRadius: 12, border: 'none',
            marginBottom: 16, fontSize: 16, background: 'rgba(255,255,255,0.1)',
            color: 'white'
          }}
        >
          <option value="customer" style={{ color: 'black' }}>Soy Cliente</option>
          <option value="courier" style={{ color: 'black' }}>Soy Mensajero</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: 16, borderRadius: 12, border: 'none',
            background: 'var(--saji-green)', color: 'white', fontSize: 16,
            fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Registrarme'}
        </button>

        <p
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          style={{
            color: 'var(--saji-green)', textAlign: 'center', marginTop: 16,
            cursor: 'pointer', fontSize: 14
          }}
        >
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Ingresa'}
        </p>
      </form>
    </div>
  );
}