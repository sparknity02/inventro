import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import ItemForm from '../components/ItemForm';

export default function LowStock({ onStockUpdated }) {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [threshold, setThreshold] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Edit item state
  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadLowStockItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, suppliersData, categoriesData] = await Promise.all([
        api.getLowStockItems(threshold),
        api.getSuppliers(),
        api.getCategories(),
      ]);
      setItems(data);
      setSuppliers(suppliersData);
      setCategories(categoriesData);
      if (onStockUpdated) onStockUpdated(data.length);
    } catch (err) {
      console.error('Error loading low stock items:', err);
      setError(err.response?.data?.message || 'Failed to load low-stock items.');
    } finally {
      setLoading(false);
    }
  }, [threshold, onStockUpdated]);

  useEffect(() => {
    loadLowStockItems();
  }, [loadLowStockItems]);

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setError(null);
      await api.updateItem(editingItem.id, formData);
      setSuccessMsg(`Stock for "${formData.name}" updated successfully.`);
      setIsFormOpen(false);
      setEditingItem(null);
      loadLowStockItems();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item stock.');
    }
  };

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
          <h1 className="page-title">Low Stock Alert</h1>
          <p className="page-subtitle">
            Items currently below critical replenishment threshold
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label htmlFor="threshold-select" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            Threshold:
          </label>
          <select
            id="threshold-select"
            className="select-input"
            style={{ minWidth: '110px' }}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
          >
            <option value={5}>&lt; 5 units</option>
            <option value={10}>&lt; 10 units</option>
            <option value={15}>&lt; 15 units</option>
            <option value={25}>&lt; 25 units</option>
          </select>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success">
          <span>{successMsg}</span>
          <button className="close-btn" onClick={() => setSuccessMsg(null)}>&times;</button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
          <button className="close-btn" onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <span>
            <strong>Attention needed:</strong> {items.length} item{items.length > 1 ? 's are' : ' is'} below the stock threshold of {threshold} units. Immediate reordering recommended.
          </span>
        </div>
      )}

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Unit Price</th>
                <th>Supplier to Contact</th>
                <th style={{ textAlign: 'right' }}>Restock Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">
                    <div className="spinner"></div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <div className="empty-state-icon">✅</div>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Healthy Stock Levels</p>
                      <p style={{ fontSize: '0.875rem' }}>
                        No items found with quantity under {threshold} units.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td>
                      <span className="badge badge-neutral">{item.category}</span>
                    </td>
                    <td>
                      <span className="badge badge-danger" style={{ fontWeight: 700 }}>
                        {item.quantity} units remaining
                      </span>
                    </td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>
                      <div>
                        <strong>{item.supplierName || '—'}</strong>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOpenEdit(item)}
                      >
                        Update Stock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Modal Form to restock / edit quantity */}
      <ItemForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
        suppliers={suppliers}
        categories={categories}
      />
    </div>
  );
}
