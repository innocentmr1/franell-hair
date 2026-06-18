import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ShoppingCart, ChevronLeft, ChevronRight, X, ZoomIn, Ruler } from 'lucide-react';
import { getProduct, addReview, getRelatedProducts, notifyWhenInStock } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { resolveImg } from '../assets/images';
import ProductCard from '../components/ui/ProductCard';
import toast from 'react-hot-toast';

function toYouTubeEmbed(url) {
  if (!url) return null;
  let id = null;
  if (url.includes('/embed/')) { const m = url.match(/\/embed\/([^?&#/]+)/); id = m?.[1]; }
  else if (url.match(/\/shorts\/([^?&#/]+)/)) id = url.match(/\/shorts\/([^?&#/]+)/)[1];
  else if (url.match(/youtu\.be\/([^?&#/]+)/))  id = url.match(/youtu\.be\/([^?&#/]+)/)[1];
  else if (url.match(/[?&]v=([^&#]+)/))         id = url.match(/[?&]v=([^&#]+)/)[1];
  if (!id) return null;
  const p = new URLSearchParams({
    autoplay: '1', mute: '1', loop: '1', playlist: id,
    controls: '0', rel: '0', modestbranding: '1',
    iv_load_policy: '3', cc_load_policy: '0', disablekb: '1', fs: '0',
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${p}`;
}

function ProductVideos({ videos = [], legacy = '' }) {
  const all = [...videos, ...(legacy && !videos.includes(legacy) ? [legacy] : [])].filter(Boolean);
  if (!all.length) return null;
  return (
    <div className="product-video-wrap">
      <h3 className="product-video-title">Product Video{all.length > 1 ? 's' : ''}</h3>
      {all.map((url, i) => {
        const embed = toYouTubeEmbed(url);
        return embed ? (
          <div key={i} className="product-video-clip">
            <iframe src={embed} className="product-video-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen title={`Product video ${i + 1}`} />
          </div>
        ) : (
          <video key={i} src={url} autoPlay muted loop playsInline controls className="product-video-el" />
        );
      })}
    </div>
  );
}

function StockAlert({ productId }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await notifyWhenInStock(productId, email);
      setSent(true);
    } catch {
      toast.error('Could not save. Try again.');
    } finally {
      setBusy(false);
    }
  };

  if (sent) return <p className="stock-alert-sent">We'll email you when this is back in stock!</p>;
  return (
    <form onSubmit={submit} className="stock-alert-form">
      <p className="stock-alert-label">Get notified when back in stock:</p>
      <div className="stock-alert-row">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com" className="stock-alert-input" />
        <button type="submit" disabled={busy} className="stock-alert-btn">
          {busy ? '…' : 'Notify Me'}
        </button>
      </div>
    </form>
  );
}

const SIZE_GUIDE = [
  { length: '10"', straight: '~25 cm', bodyWave: '~23 cm', curly: '~20 cm' },
  { length: '12"', straight: '~30 cm', bodyWave: '~28 cm', curly: '~24 cm' },
  { length: '14"', straight: '~35 cm', bodyWave: '~33 cm', curly: '~28 cm' },
  { length: '16"', straight: '~40 cm', bodyWave: '~38 cm', curly: '~32 cm' },
  { length: '18"', straight: '~45 cm', bodyWave: '~43 cm', curly: '~36 cm' },
  { length: '20"', straight: '~50 cm', bodyWave: '~48 cm', curly: '~40 cm' },
  { length: '22"', straight: '~55 cm', bodyWave: '~53 cm', curly: '~44 cm' },
  { length: '24"', straight: '~60 cm', bodyWave: '~58 cm', curly: '~48 cm' },
  { length: '26"', straight: '~65 cm', bodyWave: '~63 cm', curly: '~52 cm' },
  { length: '28"', straight: '~70 cm', bodyWave: '~68 cm', curly: '~56 cm' },
];

const GOLD  = '#C9A84C';
const EMPTY = '#e5e7eb';
const AMBER = '#fbbf24';

const HAIR_IMG = {
  'Body Wave':  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=700&h=800&fit=crop&q=80',
  'Straight':   'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=700&h=800&fit=crop&q=80',
  'Deep Wave':  'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=700&h=800&fit=crop&q=80',
  'Water Wave': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=700&h=800&fit=crop&q=80',
  'Kinky Curly':'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=700&h=800&fit=crop&q=80',
  'Jerry Curly':'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=700&h=800&fit=crop&q=80',
  'Loose Wave': 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=700&h=800&fit=crop&q=80',
  'Wigs':       'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=700&h=800&fit=crop&q=80',
  'Bundles':    'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=700&h=800&fit=crop&q=80',
  'Closures':   'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=700&h=800&fit=crop&q=80',
  'Frontals':   'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=700&h=800&fit=crop&q=80',
  'Extensions': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=700&h=800&fit=crop&q=80',
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedLength, setSelectedLength] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [related, setRelated] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [sizeGuide, setSizeGuide] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    setImgIdx(0);
    getProduct(id)
      .then(({ data }) => {
        setProduct(data);
        setSelectedLength(data.lengths?.[0] || '');
        setSelectedColor(data.colors?.[0] || '');
      })
      .catch(() => toast.error('Failed to load product'))
      .finally(() => setLoading(false));
    getRelatedProducts(id).then(({ data }) => setRelated(data)).catch(() => {});
  }, [id]);

  const handleAddToCart = () => {
    if (product.lengths?.length && !selectedLength) return toast.error('Please select a length');
    addToCart(product, qty, selectedLength, selectedColor);
    toast.success('Added to cart!');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please sign in to leave a review');
    setReviewLoading(true);
    try {
      await addReview(id, reviewForm);
      toast.success('Review submitted!');
      const { data } = await getProduct(id);
      setProduct(data);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return (
    <div className="product-detail">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
        <div style={{ aspectRatio: '1', background: '#e5e7eb', borderRadius: '16px', animation: 'pulse-fade 1.5s ease-in-out infinite' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[60, 100, 60].map((w, i) => (
            <div key={i} style={{ height: i === 1 ? '2rem' : '1.5rem', width: `${w}%`, background: '#e5e7eb', borderRadius: '8px', animation: 'pulse-fade 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
    </div>
  );

  if (!product) return <div className="page-not-found">Product not found</div>;

  const fallback = HAIR_IMG[product.hairType] || HAIR_IMG[product.category]
    || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=700&h=800&fit=crop&q=80';

  // Build gallery: YouTube URLs → iframe, everything else → image
  const galleryItems = (product.images || []).filter(Boolean).map(url => {
    const isYT = url.includes('youtube.com') || url.includes('youtu.be');
    if (isYT) {
      const embed = toYouTubeEmbed(url);
      if (embed) return { type: 'video', embed, thumb: resolveImg(url), isShorts: url.includes('/shorts/') };
    }
    const src = resolveImg(url);
    if (src && !src.includes('placehold.co')) return { type: 'image', src, thumb: src };
    return null;
  }).filter(Boolean);
  if (!galleryItems.length) galleryItems.push({ type: 'image', src: fallback, thumb: fallback });

  const current = galleryItems[imgIdx] || galleryItems[0];

  return (
    <div className="product-detail">
      <div className="product-detail-grid">

        {/* Gallery */}
        <div>
          <div className={`gallery-main${current.type === 'video' && current.isShorts ? ' gallery-main-shorts' : ''}`}>
            {current.type === 'video' ? (
              <div className="gallery-video-clip">
                <iframe src={current.embed} className="gallery-video-iframe"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen title="Product video" />
              </div>
            ) : (
              <>
                <img src={current.src} alt={product.name} className="gallery-main-img"
                  onError={(e) => { e.target.src = fallback; }} />
                <button className="gallery-zoom-btn" onClick={() => setLightbox(current.src)} title="View full size">
                  <ZoomIn size={16} />
                </button>
              </>
            )}
            {galleryItems.length > 1 && (
              <>
                <button className="gallery-nav gallery-nav-prev"
                  onClick={() => setImgIdx((i) => (i - 1 + galleryItems.length) % galleryItems.length)}>
                  <ChevronLeft size={18} />
                </button>
                <button className="gallery-nav gallery-nav-next"
                  onClick={() => setImgIdx((i) => (i + 1) % galleryItems.length)}>
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
          <div className="gallery-thumbs">
            {galleryItems.map((item, i) => (
              <button key={i} onClick={() => setImgIdx(i)} className={`gallery-thumb ${i === imgIdx ? 'active' : ''}`}>
                <img src={item.thumb} alt="" onError={(e) => { e.target.src = fallback; }} />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="product-info-cat">{product.category}</p>
          <h1 className="product-info-title">{product.name}</h1>
          {product.numReviews > 0 && (
            <div className="product-info-rating">
              <div className="product-info-stars">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} size={14}
                    style={{ fill: i <= Math.round(product.rating) ? AMBER : EMPTY,
                             color: i <= Math.round(product.rating) ? AMBER : EMPTY }} />
                ))}
              </div>
              <span className="product-info-rating-text">
                {product.rating?.toFixed(1)} ({product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}

          <div className="product-info-price-row">
            <span className="product-info-price">${product.price?.toFixed(2)}</span>
            {product.comparePrice > product.price && (
              <span className="product-info-price-old">${product.comparePrice?.toFixed(2)}</span>
            )}
          </div>

          {product.lengths?.length > 0 && (
            <div className="product-selector">
              <p className="product-selector-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Length: <span>{selectedLength}"</span></span>
                <button className="size-guide-link" onClick={() => setSizeGuide(true)}>
                  <Ruler size={13} /> Size Guide
                </button>
              </p>
              <div className="product-selector-opts">
                {product.lengths.map((l) => (
                  <button key={l} onClick={() => setSelectedLength(l)}
                    className={`selector-btn ${selectedLength === l ? 'active' : ''}`}>
                    {l}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="product-selector">
              <p className="product-selector-label">
                Color: <span>{selectedColor}</span>
              </p>
              <div className="product-selector-opts">
                {product.colors.map((c) => (
                  <button key={c} onClick={() => setSelectedColor(c)}
                    className={`selector-btn ${selectedColor === c ? 'active' : ''}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="product-qty-row">
            <div className="qty-stepper">
              <button className="qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span className="qty-value">{qty}</span>
              <button className="qty-btn"
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                disabled={qty >= product.stock}>+</button>
            </div>
            {product.stock > 0 && product.stock <= 5
              ? <span className="product-stock-text" style={{ color: '#dc2626' }}>Only {product.stock} left!</span>
              : <span className="product-stock-text">{product.stock} in stock</span>
            }
          </div>

          <button onClick={handleAddToCart} disabled={product.stock === 0} className="product-add-btn">
            <ShoppingCart size={18} />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          {product.stock === 0 && <StockAlert productId={product._id} />}

          <div className="product-desc-section">
            <h3 className="product-desc-title">Description</h3>
            {product.description && (
              <ul className="product-desc-list">
                {product.description
                  .split('\n')
                  .map(line => line.trim())
                  .filter(Boolean)
                  .map((line, i) => (
                    <li key={i} className="product-desc-item">
                      {line.replace(/^[-•*]\s*/, '')}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <ProductVideos videos={product.videos} legacy={product.video} />
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="related-section">
          <h2 className="related-title">You May Also Like</h2>
          <div className="related-grid">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="reviews-section">
        <h2 className="reviews-title">
          Customer Reviews
          {product.numReviews > 0 && <span className="reviews-count-badge">{product.numReviews}</span>}
        </h2>
        <div className="reviews-grid">
          <div className="review-list">
            {product.reviews?.length === 0 && (
              <p className="review-empty">No reviews yet — be the first to share your experience!</p>
            )}
            {product.reviews?.map((r) => (
              <div key={r._id} className="review-card">
                <div className="review-card-header">
                  <div className="review-author-info">
                    <div className="review-author-avatar">{r.name?.[0]?.toUpperCase()}</div>
                    <span className="review-author-name">{r.name}</span>
                  </div>
                  <div className="review-stars">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} size={11}
                        style={{ fill: i <= r.rating ? AMBER : EMPTY,
                                 color: i <= r.rating ? AMBER : EMPTY }} />
                    ))}
                  </div>
                </div>
                <p className="review-comment">{r.comment}</p>
                {r.createdAt && (
                  <p className="review-date">
                    {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleReview} className="review-form">
            <h3 className="review-form-title">Leave a Review</h3>
            <div>
              <label className="review-form-label">Rating</label>
              <div className="review-stars-input">
                {[1,2,3,4,5].map((i) => (
                  <button type="button" key={i} className="star-btn"
                    onClick={() => setReviewForm((f) => ({ ...f, rating: i }))}>
                    <Star size={24}
                      style={{ fill: i <= reviewForm.rating ? AMBER : EMPTY,
                               color: i <= reviewForm.rating ? AMBER : EMPTY }} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="review-form-label">Comment</label>
              <textarea
                required rows={3} value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                className="review-textarea" placeholder="Share your experience..."
              />
            </div>
            <button type="submit" disabled={reviewLoading} className="review-submit">
              {reviewLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}><X size={24} /></button>
          <img src={lightbox} alt="Full size" className="lightbox-img" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Size Guide Modal */}
      {sizeGuide && (
        <div className="lightbox-overlay" onClick={() => setSizeGuide(false)}>
          <div className="size-guide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="size-guide-header">
              <h2>Hair Length Guide</h2>
              <button onClick={() => setSizeGuide(false)}><X size={20} /></button>
            </div>
            <p className="size-guide-note">Lengths are measured from root to tip when hair is straightened. Curly and wavy styles appear shorter due to the curl pattern.</p>
            <div className="size-guide-table-wrap">
              <table className="size-guide-table">
                <thead>
                  <tr><th>Length</th><th>Straight</th><th>Body Wave</th><th>Curly</th></tr>
                </thead>
                <tbody>
                  {SIZE_GUIDE.map((row) => (
                    <tr key={row.length}>
                      <td><strong>{row.length}</strong></td>
                      <td>{row.straight}</td>
                      <td>{row.bodyWave}</td>
                      <td>{row.curly}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
