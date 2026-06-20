import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAboutPage, updateAboutPage } from '../../services/api';
import toast from 'react-hot-toast';

const BLANK_VALUE = {
  heroTitle: '',
  heroSub: '',
  storyTag: '',
  storyTitle: '',
  storyParagraph1: '',
  storyParagraph2: '',
  storyImage: '',
  valuesTitle: '',
  values: [{ icon: '', title: '', body: '' }],
};

export default function AdminAboutPage() {
  const [form, setForm] = useState(BLANK_VALUE);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    getAboutPage()
      .then(({ data }) => setForm(data))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const setVal = (i, key, val) =>
    setForm((f) => ({
      ...f,
      values: f.values.map((v, x) => (x === i ? { ...v, [key]: val } : v)),
    }));

  const addValue    = () => setForm((f) => ({ ...f, values: [...f.values, { icon: '', title: '', body: '' }] }));
  const removeValue = (i) => setForm((f) => ({ ...f, values: f.values.filter((_, x) => x !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateAboutPage(form);
      toast.success('About page saved!');
    } catch {
      toast.error('Save failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <AdminLayout title="About Page">
      <div className="page-loading"><div className="spinner" /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="About Page">
      <div className="admin-page-hd">
        <span className="admin-page-title">Edit About Page</span>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">

        {/* Hero */}
        <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 className="admin-section-label">Hero Section</h3>
          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label className="admin-form-label">Page Title</label>
              <input name="heroTitle" value={form.heroTitle} onChange={set} className="admin-form-input" placeholder="About Franell Hair" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Subtitle</label>
              <input name="heroSub" value={form.heroSub} onChange={set} className="admin-form-input" placeholder="Premium hair for every queen." />
            </div>
          </div>
        </div>

        {/* Story */}
        <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 className="admin-section-label">Our Story Section</h3>
          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label className="admin-form-label">Tag (small label above title)</label>
              <input name="storyTag" value={form.storyTag} onChange={set} className="admin-form-input" placeholder="Our Story" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Section Title</label>
              <input name="storyTitle" value={form.storyTitle} onChange={set} className="admin-form-input" placeholder="Born from passion, built for you" />
            </div>
            <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="admin-form-label">Paragraph 1</label>
              <textarea name="storyParagraph1" rows={3} value={form.storyParagraph1} onChange={set} className="admin-form-textarea" />
            </div>
            <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="admin-form-label">Paragraph 2</label>
              <textarea name="storyParagraph2" rows={3} value={form.storyParagraph2} onChange={set} className="admin-form-textarea" />
            </div>
            <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="admin-form-label">Story Image URL</label>
              <input name="storyImage" value={form.storyImage} onChange={set} className="admin-form-input" placeholder="https://..." />
              {form.storyImage && (
                <img src={form.storyImage} alt="preview" style={{ marginTop: '.5rem', width: 120, height: 140, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }}
                  onError={(e) => { e.target.style.display = 'none'; }} />
              )}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 className="admin-section-label">Value Cards Section</h3>
          <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
            <label className="admin-form-label">Section Title</label>
            <input name="valuesTitle" value={form.valuesTitle} onChange={set} className="admin-form-input" placeholder="Why choose Franell?" />
          </div>

          {form.values.map((v, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 2fr auto', gap: '.5rem', alignItems: 'start', marginBottom: '.75rem' }}>
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label className="admin-form-label">Icon</label>
                <input value={v.icon} onChange={(e) => setVal(i, 'icon', e.target.value)} className="admin-form-input" placeholder="✦" style={{ textAlign: 'center' }} />
              </div>
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label className="admin-form-label">Title</label>
                <input value={v.title} onChange={(e) => setVal(i, 'title', e.target.value)} className="admin-form-input" placeholder="Premium Quality" />
              </div>
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label className="admin-form-label">Description</label>
                <input value={v.body} onChange={(e) => setVal(i, 'body', e.target.value)} className="admin-form-input" placeholder="Short description..." />
              </div>
              <button type="button" onClick={() => removeValue(i)} className="admin-media-remove" style={{ marginTop: '1.6rem' }} disabled={form.values.length === 1}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          <button type="button" onClick={addValue} className="admin-add-field-btn">
            <Plus size={13} /> Add card
          </button>
        </div>

        <div className="admin-form-submit">
          <button type="submit" disabled={loading} className="admin-submit-btn">
            {loading ? 'Saving…' : 'Save About Page'}
          </button>
        </div>

      </form>
    </AdminLayout>
  );
}
