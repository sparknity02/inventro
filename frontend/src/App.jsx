import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import Suppliers from './pages/Suppliers';
import LowStock from './pages/LowStock';
import api from './services/api';

function App() {
  const [lowStockCount, setLowStockCount] = useState(0);

  const fetchLowStockCount = async () => {
    try {
      const lowStock = await api.getLowStockItems(10);
      setLowStockCount(lowStock.length);
    } catch {
      // Backend may still be spinning up
    }
  };

  useEffect(() => {
    fetchLowStockCount();
    const interval = setInterval(fetchLowStockCount, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Navbar lowStockCount={lowStockCount} />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/items" element={<Items />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route
              path="/low-stock"
              element={<LowStock onStockUpdated={setLowStockCount} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>
            Sparknity Inventro &copy; {new Date().getFullYear()} &bull; Professional Inventory Management System
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
