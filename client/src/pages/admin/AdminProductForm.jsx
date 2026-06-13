import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, Image as ImageIcon, Video } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getProduct, adminCreateProduct, adminUpdateProduct, getCategories } from '../../services/api';
import { LOCAL_IMAGES } from '../../assets/images';
import toast from 'react-hot-toast';

const FALLBACK_CATS = ['Wigs', 'Bundles', 'Closures', 'Frontals', 'Braiding Hair', 'Crochet Hair', 'Locs', 'Twists', 'Extensions', 'Accessories'];
const HAIR_TYPES    = ['Braids', 'Locs', 'Twists', 'Straight', 'Wavy', 'Curly', 'Kinky'];

const BLANK = {
  name: '', description: '',
  price: '', comparePrice: '',
  category: '', hairType: 'Braids',
  lengths: '', colors: '', stock: '',
  isFeatured: false, isNewArrival: false,
};

/* Local photo picker grid */
function LocalPicker({ selected, onToggle }) {
  return (
    <div className="local-picker">
      {LOCAL_IMAGES.map((src, i) => {
        const token = `local:${i}`;
        const active = selected.includes(token);
        return (
          <button key={i} type="button" className={`local-picker-item ${active ? 'selected' : ''}`} onClick={() => onToggle(token)}>
            <img src={src} alt={`Photo ${i + 1}`} />
            {active && <span className="local-picker-check">✓</span>}
          </button>
        );
      })}
    </div>
  );
}

export default function AdminProductForm() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const isEdit     = Boolean(id);

  const [form, setForm]           = useState(BLANK);
  const [imageInputs, setImgs]    = useState(['']);
  const [videoInputs, setVids]    = useState(['']);
  const [cats, setCats]           = useState(FALLBACK_CATS);
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(isEdit);

  useEffect(() => {
    getCategories().then(({ data }) => { if (data.length) setCats(data.map((c) => c.name)); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getProduct(id)
      .then(({ data }) => {
        setForm({
          name: data.name, description: data.description,
          price: data.price, comparePrice: data.comparePrice || '',
          category: data.category, hairType: data.hairType || 'Braids',
          lengths: data.lengths?.join(', ') || '',
          colors:  data.colors?.join(', ')  || '',
          stock: data.stock,
          isFeatured: data.isFeatured, isNewArrival: data.isNewArrival,
        });
        setImgs(data.images?.length ? data.images : ['']);
        const vids = data.videos?.length ? data.videos : (data.video ? [data.video] : ['']);
        setVids(vids.length ? vids : ['']);
      })
      .catch(() => toast.error('Failed to load product'))
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  const set = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  /* Image helpers */
  const addImg    = ()       => setImgs((p) => [...p, '']);
  const removeImg = (i)      => setImgs((p) => p.filter((_, x) => x !== i));
  const updateImg = (i, v)   => setImgs((p) => p.map((u, x) => x === i ? v : u));
  const toggleLocal = (token) => {
    setImgs((prev) => {
      if (prev.includes(token)) return prev.filter((u) => u !== token);
      const empty = prev.findIndex((u) => !u);
      if (empty >= 0) return prev.map((u, i) => i === empty ? token : u);
      return [...prev, token];
    });
  };

  /* Video helpers */
  const addVid    = ()     => setVids((p) => [...p, '']);
  const removeVid = (i)    => setVids((p) => p.filter((_, x) => x !== i));
  const updateVid = (i, v) => setVids((p) => p.map((u, x) => x === i ? v : u));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanVideos = videoInputs.filter(Boolean);
      const payload = {
        ...form,
        price:        parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : 0,
        stock:        parseInt(form.stock, 10),
        lengths: form.lengths.split(',').map((s) => s.trim()).filter(Boolean),
        colors:  form.colors.split(',').map((s) => s.trim()).filter(Boolean),
        images:  imageInputs.filter(Boolean),
        videos:  cleanVideos,
        video:   cleanVideos[0] || '',
      };
      if (isEdit) {
        await adminUpdateProduct(id, payload);
        toast.success('Product updated!');
      } else {
        await adminCreateProduct(payload);
        toast.success('Product created!');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <AdminLayout title={isEdit ? 'Edit Product' : 'Add Product'}>
      <div className="page-loading"><div className="spinner" /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout title={isEdit ? 'Edit Product' : 'Add Product'}>
      <div className="admin-page-hd">
        <span className="admin-page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</span>
      </div>

      <div className="admin-card" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSubmit} className="admin-form">

          {/* ── Basic info ── */}
          <div className="admin-form-grid-2">
            <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="admin-form-label">Product Name *</label>
              <input name="name" required value={form.name} onChange={set}
                className="admin-form-input" placeholder='e.g. HD Lace Front Wig Body Wave 13x4 24"' />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Category *</label>
              <select name="category" value={form.category} onChange={set} className="admin-form-select" required>
                <option value="">— select —</option>
                {cats.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Hair Type</label>
              <select name="hairType" value={form.hairType} onChange={set} className="admin-form-select">
                {HAIR_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Description *</label>
            <textarea name="description" required value={form.description} onChange={set}
              className="admin-form-textarea" placeholder="Describe the product…" rows={4} />
          </div>

          {/* ── Pricing ── */}
          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label className="admin-form-label">Sale Price ($) *</label>
              <input name="price" type="number" step="0.01" min="0" required value={form.price} onChange={set}
                className="admin-form-input" placeholder="45.99" />
              <span className="admin-form-hint">The price customers pay</span>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Original Price ($) <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional — shown crossed out)</span></label>
              <input name="comparePrice" type="number" step="0.01" min="0" value={form.comparePrice} onChange={set}
                className="admin-form-input" placeholder="59.99" />
              <span className="admin-form-hint">Leave blank if there's no discount</span>
            </div>
          </div>

          {/* ── Inventory ── */}
          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label className="admin-form-label">Stock *</label>
              <input name="stock" type="number" min="0" required value={form.stock} onChange={set}
                className="admin-form-input" placeholder="50" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Lengths (comma-separated, inches)</label>
              <input name="lengths" value={form.lengths} onChange={set}
                className="admin-form-input" placeholder="14, 16, 18, 20, 22, 24" />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Colors (comma-separated)</label>
            <input name="colors" value={form.colors} onChange={set}
              className="admin-form-input" placeholder="Natural Black, T30 Honey Brown, Burgundy" />
          </div>

          {/* ── Images ── */}
          <div className="admin-form-group">
            <label className="admin-form-label"><ImageIcon size={14} style={{ display:'inline', marginRight:'.3rem' }} />Product Images</label>

            {/* Local photo picker */}
            <p className="admin-form-hint" style={{ marginBottom: '.5rem' }}>
              Click to select from pre-loaded store photos:
            </p>
            <LocalPicker selected={imageInputs} onToggle={toggleLocal} />

            {/* URL inputs */}
            <p className="admin-form-hint" style={{ margin: '.875rem 0 .5rem' }}>
              Or paste image URLs (first image is the main photo):
            </p>
            {imageInputs.map((url, i) => (
              <div key={i} className="admin-media-row">
                <input
                  value={url} onChange={(e) => updateImg(i, e.target.value)}
                  className="admin-form-input" placeholder={`Image URL ${i + 1} or local:0–8`}
                />
                {imageInputs.length > 1 && (
                  <button type="button" onClick={() => removeImg(i)} className="admin-media-remove">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addImg} className="admin-add-field-btn">
              <Plus size={13} /> Add another image
            </button>
          </div>

          {/* ── Videos ── */}
          <div className="admin-form-group">
            <label className="admin-form-label"><Video size={14} style={{ display:'inline', marginRight:'.3rem' }} />Product Videos</label>
            <p className="admin-form-hint" style={{ marginBottom: '.5rem' }}>
              Paste a YouTube link (<code>youtube.com/watch?v=…</code> or <code>youtu.be/…</code>) or a direct .mp4 URL. Multiple videos are supported.
            </p>
            {videoInputs.map((url, i) => (
              <div key={i} className="admin-media-row">
                <input
                  value={url} onChange={(e) => updateVid(i, e.target.value)}
                  className="admin-form-input" placeholder="https://youtube.com/watch?v=...  or  https://…/video.mp4"
                />
                {videoInputs.length > 1 && (
                  <button type="button" onClick={() => removeVid(i)} className="admin-media-remove">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addVid} className="admin-add-field-btn">
              <Plus size={13} /> Add another video
            </button>
          </div>

          {/* ── Flags ── */}
          <div className="admin-form-group">
            <label className="admin-form-label">Options</label>
            <div className="admin-form-check-row">
              <label className="admin-form-check">
                <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={set} />
                Featured Product
              </label>
              <label className="admin-form-check">
                <input type="checkbox" name="isNewArrival" checked={form.isNewArrival} onChange={set} />
                New Arrival
              </label>
            </div>
          </div>

          <div className="admin-form-submit">
            <button type="submit" disabled={loading} className="admin-submit-btn">
              {loading ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
            <Link to="/admin/products" className="admin-cancel-btn">Cancel</Link>
          </div>

        </form>
      </div>
    </AdminLayout>
  );
}
