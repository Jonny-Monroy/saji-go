import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function CreateShipment() {
  const [step, setStep] = useState(1);
  const [serviceScope, setServiceScope] = useState('local');
  const [serviceType, setServiceType] = useState('local');
  const [destinationCityId, setDestinationCityId] = useState('');
  const [cities, setCities] = useState([]);
  const [weightKg, setWeightKg] = useState(1);
  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState('contado');
  const navigate = useNavigate();

  useEffect(() => {
    if (serviceScope === 'national') fetchCities();
  }, [serviceScope]);

  const fetchCities = async () => {
    try {
      const res = await axios.get(`${API_URL}/cities`);
      setCities(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const getQuote = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/pricing/calculate`, {
        serviceScope,
        destinationCityId: serviceScope === 'national' ? destinationCityId : null,
        serviceType: serviceScope === 'local' ? serviceType : 'national',
        weightKg
      });
      setQuote(res.data);
      setStep(3);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cotizar');
    }
    setLoading(false);
  };

  const createShipment = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('saji_user') || '{}');
      const token = localStorage.getItem('saji_token');
      await axios.post(`${API_URL}/shipments`, {
        customerId: user.id,
        serviceScope,
        serviceType: serviceScope === 'local' ? serviceType : 'national',
        destinationCityId,
        originAddress,
        destinationAddress,
        weightKg,
        paymentType,
        shippingFee: quote.fee,
        productValue: 0,
        totalCollect: quote.fee
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert('¡Envío creado exitosamente!');
      navigate('/customer');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al crear envío');
    }
    setLoading(false);
  };

  const scopeCards = [
    {
      scope: 'local', icon: '🚚', title: 'Dentro de Bogotá',
      desc: 'Entrega el mismo día', color: 'var(--saji-green)'
    },
    {
      scope: 'national', icon: '🏙️', title: 'A otra ciudad',
      desc: '1-3 días hábiles', color: 'var(--saji-orange)'
    }
  ];

  const localTypes = [
    { type: 'express', icon: '⚡', title: 'Express', price: 'Desde $6.000', time: '60-90 min' },
    { type: 'local', icon: '📍', title: 'Local', price: 'Desde $9.500', time: 'Mismo día' }
  ];

  return (
    <div style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/customer')}
          style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>
          ←
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 600 }}>Nuevo envío</h1>
      </header>

      {/* Indicador de pasos */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: s <= step ? 'var(--saji-green)' : '#ddd'
          }} />
        ))}
      </div>

      {step === 1 && (
        <div>
          <h2 style={{ fontSize: 16, marginBottom: 16, fontWeight: 500 }}>
            ¿Dónde envías?
          </h2>
          {scopeCards.map(card => (
            <button key={card.scope} onClick={() => {
              setServiceScope(card.scope);
              setStep(2);
            }} style={{
              width: '100%', padding: 20, borderRadius: 16,
              border: `2px solid ${card.color}`, background: 'white',
              marginBottom: 12, textAlign: 'left', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 16
            }}>
              <span style={{ fontSize: 32 }}>{card.icon}</span>
              <div>
                <strong style={{ fontSize: 16 }}>{card.title}</strong>
                <p style={{ color: '#666', fontSize: 13, marginTop: 2 }}>{card.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {step === 2 && serviceScope === 'local' && (
        <div>
          <h2 style={{ fontSize: 16, marginBottom: 16, fontWeight: 500 }}>
            Tipo de servicio
          </h2>
          {localTypes.map(t => (
            <button key={t.type} onClick={() => {
              setServiceType(t.type);
            }} style={{
              width: '100%', padding: 16, borderRadius: 12,
              border: serviceType === t.type ? '2px solid var(--saji-green)' : '1px solid #ddd',
              background: 'white', marginBottom: 12, textAlign: 'left',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12
            }}>
              <span style={{ fontSize: 24 }}>{t.icon}</span>
              <div style={{ flex: 1 }}>
                <strong>{t.title}</strong>
                <p style={{ color: '#666', fontSize: 12 }}>{t.time}</p>
              </div>
              <span style={{ color: 'var(--saji-green)', fontWeight: 600, fontSize: 14 }}>
                {t.price}
              </span>
            </button>
          ))}

          <input
            type="text" placeholder="Dirección de origen"
            value={originAddress} onChange={e => setOriginAddress(e.target.value)}
            style={{
              width: '100%', padding: 14, borderRadius: 12, border: '1px solid #ddd',
              marginBottom: 12, fontSize: 15
            }}
          />
          <input
            type="text" placeholder="Dirección de destino"
            value={destinationAddress} onChange={e => setDestinationAddress(e.target.value)}
            style={{
              width: '100%', padding: 14, borderRadius: 12, border: '1px solid #ddd',
              marginBottom: 12, fontSize: 15
            }}
          />
          <input
            type="number" step="0.1" placeholder="Peso (kg)"
            value={weightKg} onChange={e => setWeightKg(parseFloat(e.target.value) || 1)}
            style={{
              width: '100%', padding: 14, borderRadius: 12, border: '1px solid #ddd',
              marginBottom: 16, fontSize: 15
            }}
          />

          <button onClick={getQuote} disabled={!originAddress || !destinationAddress || loading}
            style={{
              width: '100%', padding: 16, borderRadius: 12, border: 'none',
              background: 'var(--saji-green)', color: 'white', fontSize: 16,
              fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1
            }}>
            {loading ? 'Calculando...' : 'Cotizar envío'}
          </button>
        </div>
      )}

      {step === 2 && serviceScope === 'national' && (
        <div>
          <h2 style={{ fontSize: 16, marginBottom: 16, fontWeight: 500 }}>
            Ciudad destino
          </h2>
          <select
            value={destinationCityId}
            onChange={e => setDestinationCityId(e.target.value)}
            style={{
              width: '100%', padding: 14, borderRadius: 12, border: '1px solid #ddd',
              marginBottom: 12, fontSize: 15
            }}
          >
            <option value="">Selecciona una ciudad...</option>
            {cities.map(c => (
              <option key={c.id} value={c.id}>{c.name}, {c.department}</option>
            ))}
          </select>

          <input
            type="text" placeholder="Dirección de origen (Bogotá)"
            value={originAddress} onChange={e => setOriginAddress(e.target.value)}
            style={{
              width: '100%', padding: 14, borderRadius: 12, border: '1px solid #ddd',
              marginBottom: 12, fontSize: 15
            }}
          />
          <input
            type="text" placeholder="Dirección de destino"
            value={destinationAddress} onChange={e => setDestinationAddress(e.target.value)}
            style={{
              width: '100%', padding: 14, borderRadius: 12, border: '1px solid #ddd',
              marginBottom: 12, fontSize: 15
            }}
          />
          <input
            type="number" step="0.1" placeholder="Peso (kg)"
            value={weightKg} onChange={e => setWeightKg(parseFloat(e.target.value) || 1)}
            style={{
              width: '100%', padding: 14, borderRadius: 12, border: '1px solid #ddd',
              marginBottom: 16, fontSize: 15
            }}
          />

          <button onClick={getQuote} disabled={!destinationCityId || !originAddress || !destinationAddress || loading}
            style={{
              width: '100%', padding: 16, borderRadius: 12, border: 'none',
              background: 'var(--saji-green)', color: 'white', fontSize: 16,
              fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1
            }}>
            {loading ? 'Calculando...' : 'Cotizar envío'}
          </button>
        </div>
      )}

      {step === 3 && quote && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>📦</div>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Tu cotización</h2>
          <div style={{
            fontSize: 48, fontWeight: 'bold', color: 'var(--saji-green)',
            marginBottom: 8
          }}>
            ${quote.fee.toLocaleString()}
          </div>
          <p style={{ color: '#666', marginBottom: 8 }}>
            {quote.weightKg} kg · {quote.serviceType === 'national' ? 'Nacional' : 'Local'}
          </p>
          <p style={{
            color: 'var(--saji-orange)', fontWeight: 500, marginBottom: 24
          }}>
            Entrega: {quote.sla}
          </p>

          <div style={{ background: 'white', padding: 16, borderRadius: 12, marginBottom: 16, textAlign: 'left' }}>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Método de pago</p>
            {['contado', 'contraentrega'].map(p => (
              <label key={p} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0',
                cursor: 'pointer'
              }}>
                <input
                  type="radio" name="payment" value={p}
                  checked={paymentType === p}
                  onChange={() => setPaymentType(p)}
                />
                <span style={{ fontSize: 14 }}>
                  {p === 'contado' ? 'Pago inmediato' : 'Contra entrega'}
                </span>
              </label>
            ))}
          </div>

          <button onClick={createShipment} disabled={loading}
            style={{
              width: '100%', padding: 16, borderRadius: 12, border: 'none',
              background: 'var(--saji-orange)', color: 'white', fontSize: 16,
              fontWeight: 600, cursor: 'pointer', marginBottom: 12
            }}>
            {loading ? 'Creando...' : 'Confirmar y pagar'}
          </button>
          <button onClick={() => setStep(1)}
            style={{
              width: '100%', padding: 14, borderRadius: 12, border: '1px solid #ddd',
              background: 'white', color: '#666', fontSize: 14, cursor: 'pointer'
            }}>
            Volver a cotizar
          </button>
        </div>
      )}
    </div>
  );
}