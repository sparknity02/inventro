import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import ItemForm from '../components/ItemForm';
import ConfirmModal from '../components/ConfirmModal';

export default function Items() {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (searchTerm.trim()) params.name = searchTerm.trim();
      if (selectedCategory.trim()) params.category = selectedCategory.trim();

      const [itemsData, suppliersData, categoriesData] = await Promise.all([
        api.getItems(params),
        api.getSuppliers(),
        api.getCategories(),
      ]);

      setItems(itemsData);
      setSuppliers(suppliersData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading items:', err);
      setError(err.response?.data?.message || 'Failed to load inventory items.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setError(null);
      if (editingItem) {
        await api.updateItem(editingItem.id, formData);
        setSuccessMsg(`"${formData.name}" updated successfully.`);
      } else {
        await api.createItem(formData);
        setSuccessMsg(`"${formData.name}" created successfully.`);
      }
      setIsFormOpen(false);
      setEditingItem(null);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save item. Please verify all inputs.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setError(null);
      await api.deleteItem(deleteTarget.id);
      setSuccessMsg(`"${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete item.');
      setDeleteTarget(null);
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
          <h1 className="page-title">Inventory Items</h1>
          <p className="page-subtitle">Track, filter, and manage items in stock</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          + Add Item
        </button>
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

      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search items by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="select-input"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {(searchTerm || selectedCategory) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price (₹)</th>
                <th>Supplier</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
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
                      <div className="empty-state-icon">📦</div>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No items found</p>
                      <p style={{ fontSize: '0.875rem' }}>
                        {searchTerm || selectedCategory
                          ? 'Try adjusting your search query or category filter.'
                          : 'Get started by creating your first inventory item.'}
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
                      <span
                        className={`badge ${
                          item.quantity < 5
                            ? 'badge-danger'
                            : item.quantity < 10
                            ? 'badge-warning'
                            : 'badge-success'
                        }`}
                      >
                        {item.quantity} units
                      </span>
                    </td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{item.supplierName || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteTarget(item)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Modal Form */}
      <ItemForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
        suppliers={suppliers}
        categories={categories}
      />

      {/* Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDanger={true}
      />
    </div>
  );
}
