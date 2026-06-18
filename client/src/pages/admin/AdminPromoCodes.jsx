import { useEffect, useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminGetPromos, adminCreatePromo, adminUpdatePromo, adminDeletePromo } from '../../services/api';
import toast from 'react-hot-toast';

const BLANK = { code: '', type: 'percent', value: '', minOrder: '', maxUses: '', expiresAt: '', active: true };

export default function AdminPromoCodes() {
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = () => adminGetPromos().then(({ data }) => setPromos(data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const set = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminCreatePromo({
        ...form,
        value: parseFloat(form.value),
        minOrder: parseFloat(form.minOrder) || 0,
        maxUses: parseInt(form.maxUses) || 0,
        expiresAt: form.expiresAt || null,
      });
      toast.success('Promo code created!');
      setForm(BLANK);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (p) => {
    await adminUpdatePromo(p._id, { active: !p.active });
    load();
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete code "${code}"?`)) return;
    await adminDeletePromo(id);
    toast.success('Deleted');
    load();
  };

  return (
    <AdminLayout title="Promo Codes">
      <div className="admin-page-hd">
        <span className="admin-page-title">Promo Codes ({promos.length})</span>
        <button onClick={() => setShowForm(!showForm)} className="admin-btn admin-btn-primary">
          <Plus size={14} /> New Code
        </button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-form-grid-2">
              <div className="admin-form-group">
                <label className="admin-form-label">Code *</label>
                <input name="code" required value={form.code} onChange={set}
                  className="admin-form-input" placeholder="SUMMER20" style={{ textTransform: 'uppercase' }} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Type</label>
                <select name="type" value={form.type} onChange={set} className="admin-form-select">
                  <option value="percent">Percentage off (%)</option>
                  <option value="fixed">Fixed amount off ($)</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Value * {form.type === 'percent' ? '(%)' : '($)'}</label>
                <input name="value" type="number" step="0.01" min="0" required value={form.value} onChange={set}
                  className="admin-form-input" placeholder={form.type === 'percent' ? '20' : '10.00'} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Min Order ($)</label>
                <input name="minOrder" type="number" step="0.01" min="0" value={form.minOrder} onChange={set}
                  className="admin-form-input" placeholder="0 = no minimum" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Max Uses (0 = unlimited)</label>
                <input name="maxUses" type="number" min="0" value={form.maxUses} onChange={set}
                  className="admin-form-input" placeholder="0" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Expires At</label>
                <input name="expiresAt" type="date" value={form.expiresAt} onChange={set}
                  className="admin-form-input" />
              </div>
            </div>
            <div className="admin-form-submit">
              <button type="submit" disabled={loading} className="admin-submit-btn">
                {loading ? 'Creating…' : 'Create Promo Code'}
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
              <tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Uses</th><th>Expires</th><th>Active</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {promos.length === 0 ? (
                <tr><td colSpan={8} className="admin-empty">No promo codes yet</td></tr>
              ) : promos.map((p) => (
                <tr key={p._id}>
                  <td><strong style={{ letterSpacing: '.05em' }}>{p.code}</strong></td>
                  <td>{p.type === 'percent' ? 'Percent' : 'Fixed'}</td>
                  <td>{p.type === 'percent' ? `${p.value}%` : `$${p.value.toFixed(2)}`}</td>
                  <td>{p.minOrder > 0 ? `$${p.minOrder}` : '—'}</td>
                  <td>{p.usedCount}{p.maxUses > 0 ? ` / ${p.maxUses}` : ''}</td>
                  <td>{p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <button onClick={() => toggleActive(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.active ? '#16a34a' : '#9ca3af' }}>
                      {p.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(p._id, p.code)} className="admin-btn admin-btn-delete">
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
