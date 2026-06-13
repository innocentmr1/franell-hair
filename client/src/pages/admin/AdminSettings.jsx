import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Megaphone, Image } from 'lucide-react';
import { getAnnouncement, updateAnnouncement } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [text, setText]       = useState('');
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnnouncement()
      .then(({ data }) => setText(data.value || ''))
      .catch(() => {})
      .finally(() => setLoading(false));
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
