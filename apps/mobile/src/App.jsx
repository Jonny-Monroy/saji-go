import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import CustomerHome from './pages/customer/Home';
import CreateShipment from './pages/customer/CreateShipment';
import CourierHome from './pages/courier/Home';

function App() {
  const role = localStorage.getItem('saji_role');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={role ? <Navigate to={`/${role}`} /> : <Login />} />
        <Route path="/customer" element={<CustomerHome />} />
        <Route path="/customer/enviar" element={<CreateShipment />} />
        <Route path="/courier" element={<CourierHome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;