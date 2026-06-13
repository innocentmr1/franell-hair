import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, ImagePlus, Link as LinkIcon } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getHeroSlides, addHeroSlide, deleteHeroSlide, uploadHeroImage } from '../../services/api';
import toast from 'react-hot-toast';

const resolveUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/uploads/')) return `http://localhost:5000${url}`;
  return url;
};

export default function AdminHeroSlides() {
  const [slides, setSlides]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [urlInput, setUrlInput] = useState('');
  const [adding, setAdding]     = useState(false);
  const [tab, setTab]           = useState('upload'); // 'upload' | 'url'
  const fileRef = useRef(null);

  const load = () => {
    getHeroSlides()
      .then(({ data }) => setSlides(data))
      .catch(() => toast.error('Failed to load slides'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAdding(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data: uploaded } = await uploadHeroImage(fd);
      await addHeroSlide(uploaded.imageUrl);
      toast.success('Slide added!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setAdding(false);
      e.target.value = '';
    }
  };

  const handleAddUrl = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setAdding(true);
    try {
      await addHeroSlide(urlInput.trim());
      toast.success('Slide added!');
      setUrlInput('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add slide');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this slide?')) return;
    try {
      await deleteHeroSlide(id);
      setSlides((s) => s.filter((sl) => sl._id !== id));
      toast.success('Slide removed');
    } catch {
      toast.error('Failed to remove slide');
    }
  };

  return (
    <AdminLayout title="Hero Slides">
      <div className="admin-page-header">
        <div>
          <Link to="/admin/settings" className="admin-back-link">
            <ArrowLeft size={14} /> Settings
          </Link>
          <h1 className="admin-page-title">Hero Slider Images</h1>
          <p className="admin-page-sub">Images appear in the home page hero section and rotate every 5 seconds.</p>
        </div>
      </div>

      {/* Add slide */}
      <div className="hs-add-card">
        <div className="hs-add-tabs">
          <button className={`hs-tab ${tab === 'upload' ? 'active' : ''}`} onClick={() => setTab('upload')}>
            <Upload size={14} /> Upload Photo
          </button>
          <button className={`hs-tab ${tab === 'url' ? 'active' : ''}`} onClick={() => setTab('url')}>
            <LinkIcon size={14} /> Paste URL
          </button>
        </div>

        {tab === 'upload' ? (
          <div className="hs-upload-zone" onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept="image/*" className="hs-file-input" onChange={handleFileUpload} />
            <ImagePlus size={32} className="hs-upload-icon" />
            <p className="hs-upload-label">{adding ? 'Uploading…' : 'Click to upload an image'}</p>
            <p className="hs-upload-hint">JPG, PNG, WEBP — max 8 MB</p>
          </div>
        ) : (
          <form onSubmit={handleAddUrl} className="hs-url-form">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="hs-url-input"
              required
            />
            <button type="submit" disabled={adding} className="hs-url-btn">
              {adding ? 'Adding…' : 'Add Slide'}
            </button>
          </form>
        )}
      </div>

      {/* Slides grid */}
      <div className="hs-grid">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="hs-skeleton" />)
        ) : slides.length === 0 ? (
          <p className="hs-empty">No slides yet. Upload your first hero image above.</p>
        ) : (
          slides.map((slide, i) => (
            <div key={slide._id} className="hs-card">
              <img src={resolveUrl(slide.imageUrl)} alt={`Slide ${i + 1}`} className="hs-card-img"
                onError={(e) => { e.target.src = 'https://placehold.co/400x260/111/C9A84C?text=Image'; }} />
              <div className="hs-card-overlay">
                <span className="hs-card-num">Slide {i + 1}</span>
                <button className="hs-card-delete" onClick={() => handleDelete(slide._id)} title="Remove">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
