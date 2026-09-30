import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, lowStockData] = await Promise.all([
        api.getDashboard(),
        api.getLowStockItems(10),
      ]);
      setStats(statsData);
      setLowStockItems(lowStockData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to connect to backend server. Make sure Spring Boot is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of inventory status, stock levels, and supplier network</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchDashboardData} disabled={loading}>
          {loading ? 'Refreshing...' : '↻ Refresh Data'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
          <button className="btn btn-sm btn-secondary" onClick={fetchDashboardData}>
            Retry
          </button>
        </div>
      )}

      {loading && !stats ? (
        <div className="spinner"></div>
      ) : (
        <>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-title">Total Items</div>
              <div className="metric-value">{stats?.totalItems ?? 0}</div>
            </div>

            <div className="metric-card">
              <div className="metric-title">Total Suppliers</div>
              <div className="metric-value">{stats?.totalSuppliers ?? 0}</div>
            </div>

            <div className={`metric-card ${stats?.lowStockItems > 0 ? 'danger-card' : ''}`}>
              <div className="metric-title">Low Stock Items</div>
              <div className="metric-value">{stats?.lowStockItems ?? 0}</div>
            </div>

            <div className="metric-card">
              <div className="metric-title">Total Inventory Value</div>
              <div className="metric-value" style={{ fontSize: '1.65rem' }}>
                {formatCurrency(stats?.totalInventoryValue)}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Low Stock Alerts (&lt; 10 Units)</h2>
                <p className="page-subtitle" style={{ margin: 0 }}>
                  Items requiring immediate replenishment
                </p>
              </div>
              <Link to="/low-stock" className="btn btn-sm btn-secondary">
                View Full Low-Stock List &rarr;
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Remaining Stock</th>
                    <th>Unit Price</th>
                    <th>Supplier</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        All items are healthy and adequately stocked!
                      </td>
                    </tr>
                  ) : (
                    lowStockItems.slice(0, 5).map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td>
                          <span className="badge badge-neutral">{item.category}</span>
                        </td>
                        <td>
                          <span className="badge badge-danger">
                            {item.quantity} units left
                          </span>
                        </td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>{item.supplierName || '—'}</td>
                        <td>
                          <Link to="/items" className="btn btn-sm btn-secondary">
                            Manage
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
