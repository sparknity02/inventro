import { useState, useEffect } from 'react';

export default function ItemForm({ isOpen, onClose, onSubmit, initialData, suppliers, categories }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    price: '',
    supplierId: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || '',
        quantity: initialData.quantity !== undefined ? initialData.quantity : '',
        price: initialData.price !== undefined ? initialData.price : '',
        supplierId: initialData.supplierId || '',
      });
    } else {
      setFormData({
        name: '',
        category: '',
        quantity: '',
        price: '',
        supplierId: suppliers && suppliers.length > 0 ? suppliers[0].id : '',
      });
    }
    setErrors({});
  }, [initialData, isOpen, suppliers]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Item name is required';
    if (!formData.category.trim()) errs.category = 'Category is required';
    if (formData.quantity === '' || Number(formData.quantity) < 0) {
      errs.quantity = 'Quantity cannot be negative';
    }
    if (formData.price === '' || Number(formData.price) <= 0) {
      errs.price = 'Price must be greater than zero';
    }
    if (!formData.supplierId) {
      errs.supplierId = 'Please select a supplier';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: formData.name.trim(),
      category: formData.category.trim(),
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      supplierId: Number(formData.supplierId),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{initialData ? 'Edit Item' : 'Add New Item'}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'is-invalid' : ''}`}
                placeholder="e.g. Wireless Mouse"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <input
                type="text"
                list="category-suggestions"
                className={`form-input ${errors.category ? 'is-invalid' : ''}`}
                placeholder="e.g. Electronics, Accessories..."
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
              <datalist id="category-suggestions">
                {categories && categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              {errors.category && <p className="error-text">{errors.category}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input
                  type="number"
                  min="0"
                  className={`form-input ${errors.quantity ? 'is-invalid' : ''}`}
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
                {errors.quantity && <p className="error-text">{errors.quantity}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={`form-input ${errors.price ? 'is-invalid' : ''}`}
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
                {errors.price && <p className="error-text">{errors.price}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Supplier *</label>
              <select
                className={`form-input ${errors.supplierId ? 'is-invalid' : ''}`}
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              >
                <option value="">-- Select Supplier --</option>
                {suppliers && suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
              {errors.supplierId && <p className="error-text">{errors.supplierId}</p>}
              {(!suppliers || suppliers.length === 0) && (
                <p className="error-text" style={{ color: '#d97706' }}>
                  No suppliers found. Please add a supplier first.
                </p>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!suppliers || suppliers.length === 0}
            >
              {initialData ? 'Update Item' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
