import { useState, useEffect } from 'react';
import api from '../services/api';
import SupplierForm from '../components/SupplierForm';
import ConfirmModal from '../components/ConfirmModal';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error('Error loading suppliers:', err);
      setError(err.response?.data?.message || 'Failed to load suppliers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setError(null);
      if (editingSupplier) {
        await api.updateSupplier(editingSupplier.id, formData);
        setSuccessMsg(`Supplier "${formData.name}" updated successfully.`);
      } else {
        await api.createSupplier(formData);
        setSuccessMsg(`Supplier "${formData.name}" created successfully.`);
      }
      setIsFormOpen(false);
      setEditingSupplier(null);
      loadSuppliers();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save supplier. Please check details.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setError(null);
      await api.deleteSupplier(deleteTarget.id);
      setSuccessMsg(`Supplier "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      loadSuppliers();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      // Cleanly handle associated items error
      setError(err.response?.data?.message || 'Cannot delete supplier associated with items.');
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">Manage supplier contacts and vendor partnerships</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          + Add Supplier
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

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Supplier Name</th>
                <th>Phone Number</th>
                <th>Email Address</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4">
                    <div className="spinner"></div>
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    <div className="empty-state">
                      <div className="empty-state-icon">🏢</div>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No suppliers found</p>
                      <p style={{ fontSize: '0.875rem' }}>Add a supplier to start assigning inventory items.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                suppliers.map((sup) => (
                  <tr key={sup.id}>
                    <td style={{ fontWeight: 600 }}>{sup.name}</td>
                    <td>{sup.phone || <span style={{ color: 'var(--text-muted)' }}>Not provided</span>}</td>
                    <td>{sup.email || <span style={{ color: 'var(--text-muted)' }}>Not provided</span>}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEdit(sup)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteTarget(sup)}
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

      {/* Supplier Modal Form */}
      <SupplierForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingSupplier}
      />

      {/* Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Supplier"
        message={`Are you sure you want to delete supplier "${deleteTarget?.name}"? If any items belong to this supplier, deletion will be blocked.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDanger={true}
      />
    </div>
  );
}
