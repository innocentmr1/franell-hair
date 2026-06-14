import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Megaphone, Image, Tag } from 'lucide-react';
import { getAnnouncement, updateAnnouncement, getHeroPill, updateHeroPill } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [text, setText]       = useState('');
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);

  const [pill, setPill]           = useState({ label: 'Free Ship', amount: '$150+' });
  const [pillSaving, setPillSaving] = useState(false);

  useEffect(() => {
    getAnnouncement()
      .then(({ data }) => setText(data.value || ''))
      .catch(() => {})
      .finally(() => setLoading(false));
    getHeroPill()
      .then(({ data }) => setPill(data))
      .catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!text.trim()) return toast.error('Announcement cannot be empty');
    setSaving(true);
    try {
      await updateAnnouncement(text.trim());
      toast.success('Announcement updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePillSave = async (e) => {
    e.preventDefault();
    setPillSaving(true);
    try {
      await updateHeroPill(pill);
      toast.success('Hero pill updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setPillSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <Link to="/admin" className="admin-back-link">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <h1 className="admin-page-title">Site Settings</h1>
        </div>
      </div>

      <div className="settings-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Hero Ship Pill */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon"><Tag size={18} /></div>
            <div>
              <h2 className="settings-card-title">Hero Shipping Pill</h2>
              <p className="settings-card-sub">The gold badge on the hero section showing your shipping offer.</p>
            </div>
          </div>
          <form onSubmit={handlePillSave} className="settings-form">
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '140px' }}>
                <label className="admin-form-label" style={{ display: 'block', marginBottom: '.25rem' }}>Label</label>
                <input
                  className="admin-form-input" style={{ width: '100%' }}
                  value={pill.label}
                  onChange={e => setPill(p => ({ ...p, label: e.target.value }))}
                  placeholder="e.g. Free Ship"
                />
              </div>
              <div style={{ flex: 1, minWidth: '140px' }}>
                <label className="admin-form-label" style={{ display: 'block', marginBottom: '.25rem' }}>Amount / Sub-line</label>
                <input
                  className="admin-form-input" style={{ width: '100%' }}
                  value={pill.amount}
                  onChange={e => setPill(p => ({ ...p, amount: e.target.value }))}
                  placeholder="e.g. $150+"
                />
              </div>
            </div>
            <p className="settings-hint" style={{ marginTop: '.5rem' }}>
              Preview: <strong>{pill.label || 'Free Ship'}</strong> / <strong>{pill.amount || '$150+'}</strong>
            </p>
            <button type="submit" disabled={pillSaving} className="settings-save-btn">
              <Save size={14} />
              {pillSaving ? 'Saving…' : 'Save Pill'}
            </button>
          </form>
        </div>

        {/* Hero Slides shortcut */}
        <div className="settings-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="settings-card-header" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
            <div className="settings-card-icon"><Image size={18} /></div>
            <div>
              <h2 className="settings-card-title">Hero Slider Images</h2>
              <p className="settings-card-sub">Upload and manage the rotating images on the home page hero.</p>
            </div>
          </div>
          <Link to="/admin/hero-slides" className="settings-save-btn" style={{ textDecoration: 'none' }}>
            Manage Slides →
          </Link>
        </div>
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon"><Megaphone size={18} /></div>
            <div>
              <h2 className="settings-card-title">Announcement Bar</h2>
              <p className="settings-card-sub">Shown at the top of every page. Scrolls automatically.</p>
            </div>
          </div>

          {loading ? (
            <div className="settings-skeleton" />
          ) : (
            <form onSubmit={handleSave} className="settings-form">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="settings-textarea"
                placeholder="e.g. ✦ FREE SHIPPING ON ORDERS $150+  ·  NEW ARRIVALS EVERY WEEK ✦"
              />
              <p className="settings-hint">
                Use <code>·</code> to separate items. Use <code>✦</code> as decorative symbols at the start and end.
              </p>

              <div className="settings-preview">
                <p className="settings-preview-label">Preview</p>
                <div className="settings-preview-bar">
                  <div className="settings-preview-track">
                    <span>{text}</span>
                    <span>{text}</span>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={saving} className="settings-save-btn">
                <Save size={14} />
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
