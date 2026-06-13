import { useEffect, useState } from 'react';
import { Trash2, Pencil, Plus, Check, X } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [cats, setCats]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [newName, setNewName]   = useState('');
  const [newDesc, setNewDesc]   = useState('');
  const [adding, setAdding]     = useState(false);
  const [editId, setEditId]     = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const load = () => {
    setLoading(true);
    getCategories()
      .then(({ data }) => setCats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await adminCreateCategory({ name: newName.trim(), description: newDesc.trim() });
      toast.success(`"${newName}" added`);
      setNewName(''); setNewDesc('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add category');
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (cat) => {
    setEditId(cat._id);
    setEditName(cat.name);
    setEditDesc(cat.description || '');
  };

  const cancelEdit = () => { setEditId(null); setEditName(''); setEditDesc(''); };

  const handleEdit = async (id) => {
    if (!editName.trim()) return;
    try {
      await adminUpdateCategory(id, { name: editName.trim(), description: editDesc.trim() });
      toast.success('Category updated');
      cancelEdit();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?\nProducts using it will keep their category label but the category will no longer appear in filters.`)) return;
    try {
      await adminDeleteCategory(id);
      toast.success(`"${name}" deleted`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <AdminLayout title="Categories">
      <div className="admin-page-hd">
        <span className="admin-page-title">Categories ({cats.length})</span>
      </div>

      {/* Add form */}
      <div className="admin-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <p style={{ fontWeight: 600, fontSize: '.875rem', color: '#111', marginBottom: '.875rem' }}>
          Add New Category
        </p>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', minWidth: '160px' }}>
            <label className="admin-form-label" style={{ marginBottom: '.25rem', display: 'block' }}>Name *</label>
            <input
              value={newName} onChange={(e) => setNewName(e.target.value)}
              className="admin-form-input" placeholder="e.g. Wigs"
              required style={{ width: '100%' }}
            />
          </div>
          <div style={{ flex: '2', minWidth: '200px' }}>
            <label className="admin-form-label" style={{ marginBottom: '.25rem', display: 'block' }}>Description (optional)</label>
            <input
              value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
              className="admin-form-input" placeholder="Short description shown on shop page"
              style={{ width: '100%' }}
            />
          </div>
          <button type="submit" disabled={adding || !newName.trim()} className="admin-submit-btn"
            style={{ height: '38px', padding: '0 1.25rem', whiteSpace: 'nowrap' }}>
            <Plus size={14} style={{ display: 'inline', marginRight: '.3rem' }} />
            {adding ? 'Adding…' : 'Add Category'}
          </button>
        </form>
      </div>

      {/* Categories table */}
      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Slug</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="admin-empty"><div className="spinner" /></td></tr>
              ) : cats.length === 0 ? (
                <tr><td colSpan={6} className="admin-empty">No categories yet — add one above.</td></tr>
              ) : cats.map((cat, idx) => (
                <tr key={cat._id}>
                  <td style={{ color: '#9ca3af', fontSize: '.75rem' }}>{idx + 1}</td>
                  <td>
                    {editId === cat._id ? (
                      <input
                        value={editName} onChange={(e) => setEditName(e.target.value)}
                        className="admin-form-input" style={{ minWidth: '130px' }}
                        autoFocus
                      />
                    ) : (
                      <span style={{ fontWeight: 600 }}>{cat.name}</span>
                    )}
                  </td>
                  <td>
                    {editId === cat._id ? (
                      <input
                        value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                        className="admin-form-input" style={{ minWidth: '180px' }}
                        placeholder="Description"
                      />
                    ) : (
                      <span style={{ color: '#777', fontSize: '.8125rem' }}>{cat.description || '—'}</span>
                    )}
                  </td>
                  <td style={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: '.75rem' }}>{cat.slug}</td>
                  <td style={{ color: '#9ca3af', fontSize: '.8125rem', whiteSpace: 'nowrap' }}>
                    {new Date(cat.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    {editId === cat._id ? (
                      <div className="admin-btn-actions">
                        <button onClick={() => handleEdit(cat._id)} className="admin-btn admin-btn-primary">
                          <Check size={12} /> Save
                        </button>
                        <button onClick={cancelEdit} className="admin-btn" style={{ background: '#f3f4f6', color: '#374151' }}>
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="admin-btn-actions">
                        <button onClick={() => startEdit(cat)} className="admin-btn admin-btn-edit">
                          <Pencil size={12} /> Edit
                        </button>
                        <button onClick={() => handleDelete(cat._id, cat.name)} className="admin-btn admin-btn-delete">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
