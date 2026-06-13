import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getProducts, adminDeleteProduct } from '../../services/api';
import { resolveImg } from '../../assets/images';
import toast from 'react-hot-toast';

const HAIR_IMG = {
  'Body Wave':  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=80&h=80&fit=crop&q=70',
  'Straight':   'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=80&h=80&fit=crop&q=70',
  'Deep Wave':  'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=80&h=80&fit=crop&q=70',
  'Water Wave': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=80&h=80&fit=crop&q=70',
  'Kinky Curly':'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=80&h=80&fit=crop&q=70',
  'Jerry Curly':'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=80&h=80&fit=crop&q=70',
  'Loose Wave': 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&q=70',
};

function resolveThumb(p) {
  const raw = p.images?.[0];
  const resolved = raw ? resolveImg(raw) : null;
  if (resolved && !resolved.includes('placehold.co')) return resolved;
  return HAIR_IMG[p.hairType] || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=80&h=80&fit=crop&q=70';
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [total, setTotal]       = useState(0);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);

  const CATS = ['', 'Wigs', 'Bundles', 'Closures', 'Frontals', 'Extensions', 'Accessories'];

  const load = () => {
    setLoading(true);
    getProducts({ search, category, page, limit: 15 })
      .then(({ data }) => { setProducts(data.products); setTotal(data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, category, page]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await adminDeleteProduct(id);
      toast.success('Product deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <AdminLayout title="Products">
      <div className="admin-page-hd">
        <span className="admin-page-title">Products ({total})</span>
        <Link to="/admin/products/new" className="admin-btn admin-btn-primary">
          <Plus size={14} /> Add Product
        </Link>
      </div>

      <div className="admin-search-row">
        <input
          type="text" placeholder="Search products…" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="admin-search-input"
        />
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="admin-filter-select">
          {CATS.map((c) => <option key={c} value={c}>{c || 'All Categories'}</option>)}
        </select>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>Hair Type</th>
                <th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="admin-empty"><div className="spinner" /></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="admin-empty">No products found</td></tr>
              ) : products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                      <img src={resolveThumb(p)} alt={p.name} className="admin-table-img"
                        onError={(e) => { e.target.src = 'https://placehold.co/40x40/111/C9A84C?text=H'; }} />
                      <span style={{ fontWeight: 500, maxWidth: '180px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td>{p.hairType || '—'}</td>
                  <td style={{ fontWeight: 600 }}>${p.price.toFixed(2)}</td>
                  <td>
                    <span className={`admin-badge ${p.stock > 10 ? 'green' : p.stock > 0 ? 'gold' : 'red'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${p.isFeatured ? 'gold' : 'gray'}`}>
                      {p.isFeatured ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-btn-actions">
                      <Link to={`/admin/products/${p._id}/edit`} className="admin-btn admin-btn-edit">
                        <Pencil size={12} /> Edit
                      </Link>
                      <button onClick={() => handleDelete(p._id, p.name)} className="admin-btn admin-btn-delete">
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > 15 && (
        <div className="pagination">
          {[...Array(Math.ceil(total / 15))].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`page-btn ${page === i + 1 ? 'active' : ''}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
