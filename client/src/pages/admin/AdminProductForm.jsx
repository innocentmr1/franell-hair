import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, Image as ImageIcon, Video, Upload, Bold, Italic, Underline, List } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getProduct, adminCreateProduct, adminUpdateProduct, getCategories, uploadProductFile } from '../../services/api';
import { LOCAL_IMAGES } from '../../assets/images';
import toast from 'react-hot-toast';

const BLANK = {
  name: '', description: '',
  price: '', comparePrice: '',
  category: '',
  lengths: '', stock: '',
  isFeatured: false, isNewArrival: false,
};

/* ── Rich text editor ── */
function RichTextEditor({ value, onChange }) {
  const ref = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (ref.current && !initialized.current) {
      ref.current.innerHTML = value || '';
      initialized.current = true;
    }
  }, [value]);

  const exec = (cmd, val = null) => {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    onChange(ref.current?.innerHTML || '');
  };

  return (
    <div className="rte-wrap">
      <div className="rte-toolbar">
        <button type="button" title="Bold" onMouseDown={(e) => { e.preventDefault(); exec('bold'); }}><strong>B</strong></button>
        <button type="button" title="Italic" onMouseDown={(e) => { e.preventDefault(); exec('italic'); }}><em>I</em></button>
        <button type="button" title="Underline" onMouseDown={(e) => { e.preventDefault(); exec('underline'); }}><u>U</u></button>
        <select
          defaultValue=""
          onMouseDown={(e) => e.preventDefault()}
          onChange={(e) => { exec('fontSize', e.target.value); e.target.value = ''; }}>
          <option value="" disabled>Size</option>
          <option value="2">Small</option>
          <option value="3">Normal</option>
          <option value="4">Large</option>
          <option value="5">X-Large</option>
        </select>
        <button type="button" title="Bullet list" onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList'); }}>• List</button>
        <button type="button" title="Clear formatting" onMouseDown={(e) => { e.preventDefault(); exec('removeFormat'); }}>Clear</button>
      </div>
      <div
        ref={ref}
        contentEditable
        className="rte-editor"
        onInput={() => onChange(ref.current?.innerHTML || '')}
        suppressContentEditableWarning
      />
    </div>
  );
}

/* ── Upload button ── */
function UploadBtn({ accept, onUrl, label = 'Upload' }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await uploadProductFile(fd);
      onUrl(data.url);
    } catch {
      toast.error('Upload failed');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  return (
    <>
      <input ref={ref} type="file" accept={accept} style={{ display: 'none' }} onChange={handleFile} />
      <button type="button" className="admin-upload-btn" onClick={() => ref.current.click()} disabled={busy}>
        <Upload size={13} /> {busy ? 'Uploading…' : label}
      </button>
    </>
  );
}

/* ── Local photo picker ── */
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
  const [colorItems, setColorItems] = useState([{ name: '', image: '' }]);
  const [cats, setCats]           = useState([]);
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
          category: data.category,
          lengths: data.lengths?.join(', ') || '',
          stock: data.stock,
          isFeatured: data.isFeatured, isNewArrival: data.isNewArrival,
        });
        setImgs(data.images?.length ? data.images : ['']);
        const vids = data.videos?.length ? data.videos : (data.video ? [data.video] : ['']);
        setVids(vids.length ? vids : ['']);
        if (data.colors?.length) {
          setColorItems(data.colors.map((c) => ({
            name: c,
            image: data.colorImages?.find((ci) => ci.color === c)?.image || '',
          })));
        }
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

  /* Color helpers */
  const addColor    = ()            => setColorItems((p) => [...p, { name: '', image: '' }]);
  const removeColor = (i)           => setColorItems((p) => p.filter((_, x) => x !== i));
  const updateColor = (i, key, v)   => setColorItems((p) => p.map((c, x) => x === i ? { ...c, [key]: v } : c));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanVideos = videoInputs.filter(Boolean);
      const validColors = colorItems.filter((c) => c.name.trim());
      const payload = {
        ...form,
        price:        parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : 0,
        stock:        parseInt(form.stock, 10),
        lengths: form.lengths.split(',').map((s) => s.trim()).filter(Boolean),
        colors:  validColors.map((c) => c.name.trim()),
        colorImages: validColors.filter((c) => c.image).map((c) => ({ color: c.name.trim(), image: c.image })),
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
            <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="admin-form-label">Category *</label>
              <select name="category" value={form.category} onChange={set} className="admin-form-select" required>
                <option value="">— select —</option>
                {cats.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Description *</label>
            <RichTextEditor
              value={form.description}
              onChange={(html) => setForm((f) => ({ ...f, description: html }))}
            />
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

          {/* ── Colors with images ── */}
          <div className="admin-form-group">
            <label className="admin-form-label">Colors & Color Images</label>
            <p className="admin-form-hint" style={{ marginBottom: '.5rem' }}>Add each color and optionally a photo that shows that colour — customers will see it when they select the colour.</p>
            {colorItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '.5rem', alignItems: 'center', marginBottom: '.5rem', flexWrap: 'wrap' }}>
                <input
                  value={item.name}
                  onChange={(e) => updateColor(i, 'name', e.target.value)}
                  className="admin-form-input"
                  placeholder="e.g. Natural Black"
                  style={{ flex: '1', minWidth: '140px' }}
                />
                <input
                  value={item.image}
                  onChange={(e) => updateColor(i, 'image', e.target.value)}
                  className="admin-form-input"
                  placeholder="Image URL for this colour (optional)"
                  style={{ flex: '2', minWidth: '180px' }}
                />
                <UploadBtn accept="image/*" onUrl={(u) => updateColor(i, 'image', u)} label="Upload" />
                {colorItems.length > 1 && (
                  <button type="button" onClick={() => removeColor(i)} className="admin-media-remove">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addColor} className="admin-add-field-btn">
              <Plus size={13} /> Add colour
            </button>
          </div>

          {/* ── Images ── */}
          <div className="admin-form-group">
            <label className="admin-form-label"><ImageIcon size={14} style={{ display:'inline', marginRight:'.3rem' }} />Product Images</label>
            <p className="admin-form-hint" style={{ marginBottom: '.5rem' }}>
              Click to select from pre-loaded store photos:
            </p>
            <LocalPicker selected={imageInputs} onToggle={toggleLocal} />
            <p className="admin-form-hint" style={{ margin: '.875rem 0 .5rem' }}>
              Paste an image URL, a YouTube link, or upload from your device:
            </p>
            {imageInputs.map((url, i) => (
              <div key={i} className="admin-media-row">
                <input
                  value={url} onChange={(e) => updateImg(i, e.target.value)}
                  className="admin-form-input" placeholder={`Image URL, YouTube link, or local:0–8`}
                />
                <UploadBtn accept="image/*" onUrl={(u) => updateImg(i, u)} />
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
              Paste a YouTube link, upload an MP4 from your phone or laptop (up to 50 MB), or use a direct .mp4 URL.
            </p>
            {videoInputs.map((url, i) => (
              <div key={i} className="admin-media-row">
                <input
                  value={url} onChange={(e) => updateVid(i, e.target.value)}
                  className="admin-form-input" placeholder="YouTube link or video URL"
                />
                <UploadBtn accept="video/*" onUrl={(u) => updateVid(i, u)} label="Upload Video" />
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
