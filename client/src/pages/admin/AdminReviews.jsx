import { useEffect, useState } from 'react';
import { Star, Trash2, Search } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getProducts, getProduct, adminAddReview, adminDeleteReview } from '../../services/api';
import toast from 'react-hot-toast';

const AMBER = '#f5b301';
const BLANK = { name: '', rating: 5, comment: '', date: new Date().toISOString().slice(0, 10) };

export default function AdminReviews() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!search.trim()) return setResults([]);
      getProducts({ search: search.trim(), limit: 8 })
        .then(({ data }) => setResults(data.products))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const selectProduct = (p) => {
    setSelected(p);
    setResults([]);
    setSearch('');
    setForm(BLANK);
  };

  const refreshSelected = () => {
    if (!selected) return;
    getProduct(selected._id).then(({ data }) => setSelected(data)).catch(() => {});
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) return toast.error('Name and comment are required');
    setLoading(true);
    try {
      await adminAddReview(selected._id, {
        name: form.name.trim(),
        rating: Number(form.rating),
        comment: form.comment.trim(),
        createdAt: form.date,
      });
      toast.success('Review added');
      setForm(BLANK);
      refreshSelected();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add review');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await adminDeleteReview(selected._id, reviewId);
      toast.success('Review deleted');
      refreshSelected();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
  };

  return (
    <AdminLayout title="Reviews">
      <div className="admin-page-hd">
        <span className="admin-page-title">Manage Product Reviews</span>
      </div>

      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <label className="admin-form-label">Find a Product</label>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#9ca3af' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name…"
            className="admin-form-input"
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
        {results.length > 0 && (
          <div style={{ marginTop: '.5rem', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            {results.map((p) => (
              <button
                key={p._id}
                onClick={() => selectProduct(p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '.75rem', width: '100%',
                  padding: '.625rem .875rem', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                }}
              >
                <img
                  src={p.images?.[0] || 'https://placehold.co/32x32/111/C9A84C?text=H'}
                  alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                  onError={(e) => { e.target.src = 'https://placehold.co/32x32/111/C9A84C?text=H'; }}
                />
                <span style={{ fontSize: '.875rem', fontWeight: 500 }}>{p.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: '.75rem', color: '#9ca3af' }}>{p.numReviews} reviews</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <>
          <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.875rem', marginBottom: '1.25rem' }}>
              <img
                src={selected.images?.[0] || 'https://placehold.co/48x48/111/C9A84C?text=H'}
                alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
                onError={(e) => { e.target.src = 'https://placehold.co/48x48/111/C9A84C?text=H'; }}
              />
              <div>
                <p style={{ fontWeight: 700 }}>{selected.name}</p>
                <p style={{ fontSize: '.8125rem', color: '#6b7280' }}>
                  {selected.rating?.toFixed(1) || '0.0'} average · {selected.numReviews || 0} reviews
                </p>
              </div>
            </div>

            <form onSubmit={handleAdd} className="admin-form">
              <div className="admin-form-grid-2">
                <div className="admin-form-group">
                  <label className="admin-form-label">Reviewer Name *</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="admin-form-input" placeholder="e.g. Sarah M." />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="admin-form-input" />
                </div>
                <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="admin-form-label">Rating</label>
                  <div style={{ display: 'flex', gap: '.25rem' }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button type="button" key={i} onClick={() => setForm((f) => ({ ...f, rating: i }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                        <Star size={22} style={{ fill: i <= form.rating ? AMBER : '#e5e7eb', color: i <= form.rating ? AMBER : '#e5e7eb' }} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="admin-form-label">Comment *</label>
                  <textarea value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                    className="admin-form-input" rows={3} placeholder="What did they say about it?" />
                </div>
              </div>
              <div className="admin-form-submit">
                <button type="submit" disabled={loading} className="admin-submit-btn">
                  {loading ? 'Adding…' : 'Add Review'}
                </button>
              </div>
            </form>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <span className="admin-card-title">Existing Reviews</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Name</th><th>Rating</th><th>Comment</th><th>Date</th><th>Source</th><th></th></tr>
                </thead>
                <tbody>
                  {!selected.reviews?.length && (
                    <tr><td colSpan={6} className="admin-empty">No reviews yet</td></tr>
                  )}
                  {selected.reviews?.map((r) => (
                    <tr key={r._id}>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td>
                        <div style={{ display: 'flex' }}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} size={13} style={{ fill: i <= r.rating ? AMBER : '#e5e7eb', color: i <= r.rating ? AMBER : '#e5e7eb' }} />
                          ))}
                        </div>
                      </td>
                      <td style={{ maxWidth: 320, fontSize: '.8125rem' }}>{r.comment}</td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '.8125rem', color: '#6b7280' }}>
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td>
                        <span className={`admin-badge ${r.isAdminAdded ? 'gray' : 'green'}`}>
                          {r.isAdminAdded ? 'Admin' : 'Customer'}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleDelete(r._id)} className="admin-btn admin-btn-delete">
                          <Trash2 size={12} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
