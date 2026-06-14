import { useEffect, useRef, useState } from 'react';
import { Trash2, Pencil, Plus, Check, X, Upload, Link as LinkIcon } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory, uploadCategoryImage } from '../../services/api';
import toast from 'react-hot-toast';

function ImagePicker({ value, onChange, label = 'Category Image' }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState('url'); // 'url' | 'file'

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await uploadCategoryImage(fd);
      onChange(data.imageUrl);
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed — use a URL instead');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <label className="admin-form-label" style={{ display: 'block', marginBottom: '.25rem' }}>{label}</label>

      {/* Toggle */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.5rem' }}>
        <button type="button" onClick={() => setMode('file')}
          style={{ fontSize: '.75rem', padding: '.2rem .6rem', borderRadius: 6,
            background: mode === 'file' ? '#C9A84C' : '#f3f4f6',
            color: mode === 'file' ? '#000' : '#555', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          <Upload size={11} style={{ display: 'inline', marginRight: 3 }} /> Upload
        </button>
        <button type="button" onClick={() => setMode('url')}
          style={{ fontSize: '.75rem', padding: '.2rem .6rem', borderRadius: 6,
            background: mode === 'url' ? '#C9A84C' : '#f3f4f6',
            color: mode === 'url' ? '#000' : '#555', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          <LinkIcon size={11} style={{ display: 'inline', marginRight: 3 }} /> Paste URL
        </button>
      </div>

      {mode === 'file' ? (
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: '2px dashed #e5e7eb', borderRadius: 8, padding: '.75rem 1rem',
            cursor: 'pointer', textAlign: 'center', background: '#fafafa',
            color: '#9ca3af', fontSize: '.8125rem',
          }}
        >
          {uploading ? 'Uploading…' : 'Click to choose an image (JPG, PNG, WEBP — max 8 MB)'}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>
      ) : (
        <input
          value={value} onChange={(e) => onChange(e.target.value)}
          className="admin-form-input" style={{ width: '100%' }}
          placeholder="https://images.unsplash.com/..."
        />
      )}

      {/* Preview */}
      {value && (
        <div style={{ marginTop: '.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <img src={value} alt="preview" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }}
            onError={(e) => { e.target.style.display = 'none'; }} />
          <button type="button" onClick={() => onChange('')}
            style={{ fontSize: '.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminCategories() {
  const [cats, setCats]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [newName, setNewName]     = useState('');
  const [newDesc, setNewDesc]     = useState('');
  const [newImage, setNewImage]   = useState('');
  const [adding, setAdding]       = useState(false);
  const [editId, setEditId]       = useState(null);
  const [editName, setEditName]   = useState('');
  const [editDesc, setEditDesc]   = useState('');
  const [editImage, setEditImage] = useState('');

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
      await adminCreateCategory({ name: newName.trim(), description: newDesc.trim(), image: newImage.trim() });
      toast.success(`"${newName}" added`);
      setNewName(''); setNewDesc(''); setNewImage('');
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
    setEditImage(cat.image || '');
  };

  const cancelEdit = () => { setEditId(null); setEditName(''); setEditDesc(''); setEditImage(''); };

  const handleEdit = async (id) => {
    if (!editName.trim()) return;
    try {
      await adminUpdateCategory(id, { name: editName.trim(), description: editDesc.trim(), image: editImage.trim() });
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
        <form onSubmit={handleAdd}>
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
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
                className="admin-form-input" placeholder="Short description shown on homepage"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem', maxWidth: '480px' }}>
            <ImagePicker value={newImage} onChange={setNewImage} label="Background Image (shown on homepage)" />
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
                <th>Image</th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Slug</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="admin-empty"><div className="spinner" /></td></tr>
              ) : cats.length === 0 ? (
                <tr><td colSpan={7} className="admin-empty">No categories yet — add one above.</td></tr>
              ) : cats.map((cat, idx) => (
                <tr key={cat._id}>
                  <td style={{ color: '#9ca3af', fontSize: '.75rem' }}>{idx + 1}</td>

                  {/* Image cell */}
                  <td>
                    {editId === cat._id ? (
                      <div style={{ minWidth: '220px' }}>
                        <ImagePicker value={editImage} onChange={setEditImage} label="" />
                      </div>
                    ) : cat.image ? (
                      <img src={cat.image} alt={cat.name}
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }}
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <span style={{ color: '#d1d5db', fontSize: '.75rem' }}>—</span>
                    )}
                  </td>

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
