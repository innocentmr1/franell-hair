import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Upload } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminGetSaloons, adminCreateSaloon, adminUpdateSaloon, adminDeleteSaloon, uploadProductFile } from '../../services/api';
import toast from 'react-hot-toast';

const BLANK = { name: '', address: '', phone: '', images: [''] };

function ImageUploadRow({ images, onChange }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await uploadProductFile(fd);
      onChange([...images, data.url]);
    } catch { toast.error('Upload failed'); }
    finally { setBusy(false); e.target.value = ''; }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
      {images.map((url, i) => (
        <div key={i} style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
          <input value={url} onChange={(e) => {
            const next = [...images]; next[i] = e.target.value; onChange(next);
          }} className="admin-form-input" placeholder="Image URL" style={{ flex: 1 }} />
          {images.length > 1 && (
            <button type="button" onClick={() => onChange(images.filter((_, x) => x !== i))}
              className="admin-media-remove"><Trash2 size={13} /></button>
          )}
        </div>
      ))}
      <div style={{ display: 'flex', gap: '.4rem' }}>
        <button type="button" onClick={() => onChange([...images, ''])} className="admin-add-field-btn">
          <Plus size={12} /> Add URL
        </button>
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={upload} />
        <button type="button" className="admin-upload-btn" onClick={() => ref.current.click()} disabled={busy}>
          <Upload size={12} /> {busy ? 'Uploading…' : 'Upload'}
        </button>
      </div>
    </div>
  );
}

export default function AdminSaloons() {
  const [saloons, setSaloons] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = () => adminGetSaloons().then(({ data }) => setSaloons(data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminCreateSaloon({ ...form, images: form.images.filter(Boolean) });
      toast.success('Salon added!');
      setForm(BLANK);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (s) => {
    await adminUpdateSaloon(s._id, { active: !s.active });
    load();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    await adminDeleteSaloon(id);
    toast.success('Deleted');
    load();
  };

  return (
    <AdminLayout title="Salon Recommendations">
      <div className="admin-page-hd">
        <span className="admin-page-title">Salon Recommendations ({saloons.length})</span>
        <button onClick={() => setShowForm(!showForm)} className="admin-btn admin-btn-primary">
          <Plus size={14} /> Add Salon
        </button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-form-grid-2">
              <div className="admin-form-group">
                <label className="admin-form-label">Salon Name *</label>
                <input name="name" required value={form.name} onChange={set} className="admin-form-input" placeholder="e.g. Luxe Hair Studio" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Phone</label>
                <input name="phone" value={form.phone} onChange={set} className="admin-form-input" placeholder="+1 (416) 555-0100" />
              </div>
              <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="admin-form-label">Address *</label>
                <input name="address" required value={form.address} onChange={set} className="admin-form-input" placeholder="123 King St W, Toronto, ON" />
              </div>
              <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="admin-form-label">Photos</label>
                <ImageUploadRow images={form.images} onChange={(imgs) => setForm((f) => ({ ...f, images: imgs }))} />
              </div>
            </div>
            <div className="admin-form-submit">
              <button type="submit" disabled={loading} className="admin-submit-btn">
                {loading ? 'Saving…' : 'Add Salon'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="admin-cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Photo</th><th>Name</th><th>Address</th><th>Phone</th><th>Active</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {saloons.length === 0 ? (
                <tr><td colSpan={6} className="admin-empty">No salons added yet</td></tr>
              ) : saloons.map((s) => (
                <tr key={s._id}>
                  <td>
                    {s.images?.[0]
                      ? <img src={s.images[0]} alt={s.name} className="admin-table-img" onError={(e) => { e.target.style.display='none'; }} />
                      : <div style={{ width:40, height:40, background:'#f3f4f6', borderRadius:6 }} />}
                  </td>
                  <td><strong>{s.name}</strong></td>
                  <td style={{ fontSize: '.8125rem' }}>{s.address}</td>
                  <td style={{ fontSize: '.8125rem' }}>{s.phone || '—'}</td>
                  <td>
                    <button onClick={() => toggleActive(s)} style={{ background:'none', border:'none', cursor:'pointer', color: s.active ? '#16a34a' : '#9ca3af' }}>
                      {s.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(s._id, s.name)} className="admin-btn admin-btn-delete">
                      <Trash2 size={12} /> Delete
                    </button>
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
