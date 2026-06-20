import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, RotateCcw, Shield, CreditCard } from 'lucide-react';
import { getFeaturedProducts, getTopReviews, getBestseller, getHeroSlides, getCategories, getPerks, getHeroPill, getSiteStats, subscribe } from '../services/api';
import ProductCard from '../components/ui/ProductCard';
import HeroSlider from '../components/ui/HeroSlider';
import { resolveImg } from '../assets/images';

const GOLD = '#C9A84C';

const ICON_MAP = { Truck, RotateCcw, Shield, CreditCard };

const DEFAULT_PERKS = [
  { icon: 'Truck',      title: 'Free Shipping',   desc: 'On orders over $200' },
  { icon: 'RotateCcw',  title: '30-Day Returns',  desc: 'Hassle-free returns' },
  { icon: 'Shield',     title: '100% Human Hair', desc: 'Certified & authentic' },
  { icon: 'CreditCard', title: 'Secure Payment',  desc: 'Flexible payments' },
];

const hairTypes = ['Braids', 'Locs', 'Twists', 'Straight', 'Wavy', 'Curly', 'Kinky'];
const avatarColors = ['#C9A84C', '#D4B870', '#B8923A', '#E2C06A', '#A07830'];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [bestseller, setBestseller] = useState(null);
  const [heroSlides, setHeroSlides] = useState([]);
  const [perks, setPerks] = useState(DEFAULT_PERKS);
  const [categories, setCategories] = useState([]);
  const [heroPill, setHeroPill] = useState({ label: 'Free Ship', amount: '$150+' });
  const [siteStats, setSiteStats] = useState({ avgRating: null, totalReviews: 0 });

  useEffect(() => {
    getFeaturedProducts()
      .then(({ data }) => setFeatured(data))
      .catch(() => {})
      .finally(() => setLoading(false));
    getTopReviews()
      .then(({ data }) => setReviews(data))
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
    getBestseller()
      .then(({ data }) => setBestseller(data))
      .catch(() => {});
    getHeroSlides()
      .then(({ data }) => setHeroSlides(data))
      .catch(() => {});
    getPerks()
      .then(({ data }) => setPerks(data))
      .catch(() => {});
    getCategories()
      .then(({ data }) => setCategories(data))
      .catch(() => {});
    getHeroPill()
      .then(({ data }) => setHeroPill(data))
      .catch(() => {});
    getSiteStats()
      .then(({ data }) => setSiteStats(data))
      .catch(() => {});
  }, []);

  return (
    <div>

      {/* ── HERO ── */}
      <section className="hero">
        {/* Full-section background slider */}
        <HeroSlider slides={heroSlides} />
        <div className="hero-bg-overlay" />

        <div className="hero-inner">

          {/* Left */}
          <div>
            <h1 className="hero-title">
              Hair That<br />
              <span className="hero-title-gold">Speaks</span><br />
              For Itself.
            </h1>

            <div className="hero-cta-group">
              <Link to="/shop" className="btn btn-gold">
                Shop Collection <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Right — floating badges, desktop only */}
          <div className="hero-right">
            {bestseller && (() => {
              const bsImg = resolveImg(bestseller.images?.[0])
                || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&h=380&fit=crop&q=80';
              return (
                <div
                  className="hero-product-badge"
                  style={{ backgroundImage: `url(${bsImg})` }}
                >
                  <div className="hero-pb-overlay" />
                  <div className="hero-pb-content">
                    <p className="hero-pb-cat">#1 Bestseller</p>
                    <p className="hero-pb-name">
                      {bestseller.name.length > 22
                        ? bestseller.name.slice(0, 22).trim() + '…'
                        : bestseller.name}
                    </p>
                    {bestseller.numReviews > 0 && (
                      <div className="hero-pb-stars">
                        <Star size={10} style={{ fill: GOLD, color: GOLD }} />
                        <span className="hero-pb-rating">
                          {bestseller.rating.toFixed(1)} ({bestseller.numReviews})
                        </span>
                      </div>
                    )}
                    <p className="hero-pb-price">${bestseller.price.toFixed(2)}</p>
                  </div>
                </div>
              );
            })()}

            <div className="hero-ship-pill">
              <p className="hero-ship-label">{heroPill.label}</p>
              <p className="hero-ship-amount">{heroPill.amount}</p>
            </div>
          </div>
        </div>
      </section>


      {/* ── CATEGORIES ── */}
      {categories.length > 0 && (
        <section className="section">
          <div className="section-inner">
            <div className="section-header">
              <div>
                <span className="eyebrow">Categories</span>
                <h2 className="section-title">Shop by Style</h2>
              </div>
              <Link to="/shop" className="section-view-all">
                All Products <ArrowRight size={14} />
              </Link>
            </div>

            <div className="categories-grid">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/shop?category=${encodeURIComponent(cat.slug || cat.name)}`}
                  className="cat-card"
                >
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="cat-card-img"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="cat-card-img cat-card-img-fallback" />
                  )}
                  <div className="cat-card-overlay" />
                  <div className="cat-card-content">
                    {cat.description && <p className="cat-card-desc">{cat.description}</p>}
                    <p className="cat-card-name">{cat.name}</p>
                    <span className="cat-card-cta">
                      Shop now <ArrowRight size={11} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED PRODUCTS ── */}
      <section className="section section-dark">
        <div className="section-inner">
          <div className="section-header">
            <div>
              <span className="eyebrow">Bestsellers</span>
              <h2 className="section-title section-title-white">Most Loved</h2>
            </div>
            <Link to="/shop" className="section-view-all">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid-products">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="prod-skeleton">
                  <div className="prod-skeleton-img" />
                  <div className="prod-skeleton-body">
                    <div className="prod-skeleton-line prod-skeleton-half" />
                    <div className="prod-skeleton-line" />
                    <div className="prod-skeleton-line prod-skeleton-third" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid-products">
              {featured.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <p style={{ color: '#6b7280' }}>No featured products yet.</p>
              <Link to="/shop" style={{ color: GOLD, marginTop: '0.75rem', display: 'inline-block' }}>Browse all →</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── TESTIMONIALS — real reviews only ── */}
      {(reviewsLoading || reviews.length > 0) && (
        <section className="section section-cream">
          <div className="section-inner">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="eyebrow">Reviews</span>
              <h2 className="section-title">What Our Customers Say</h2>
              <div className="reviews-social-proof">
                <div className="hero-avatars" style={{ justifyContent: 'center' }}>
                  {avatarColors.map((c, i) => (
                    <div key={i} className="hero-avatar-ring" style={{ backgroundColor: c, borderColor: '#F5F0E8' }} />
                  ))}
                </div>
                <div className="hero-stars-row" style={{ justifyContent: 'center', marginTop: '.5rem' }}>
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} size={14} style={{ fill: GOLD, color: GOLD }} />
                  ))}
                  <span style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--black)', marginLeft: 6 }}>
                    {siteStats.avgRating ?? '5.0'}
                  </span>
                </div>
                <p style={{ fontSize: '.875rem', color: 'var(--text-secondary)', marginTop: '.25rem' }}>
                  {siteStats.totalReviews > 0
                    ? `${siteStats.totalReviews.toLocaleString()}+ happy customers`
                    : '1,000+ happy customers'}
                </p>
              </div>
            </div>
            <div className="testimonials-grid">
              {reviews.map((r) => (
                <div key={r._id} className="testimonial-card">
                  <div className="testimonial-stars">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} size={13}
                        style={{ fill: i <= r.rating ? GOLD : '#e5e7eb',
                                 color: i <= r.rating ? GOLD : '#e5e7eb' }} />
                    ))}
                  </div>
                  <p className="testimonial-quote">"{r.comment}"</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">{r.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <p className="testimonial-name">{r.name}</p>
                      <p className="testimonial-verified">{r.productName}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <NewsletterSection />

    </div>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await subscribe(email);
      setStatus('success');
      setMsg('You\'re in! Welcome to the Franell Hair family.');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMsg(err.response?.data?.message || 'Something went wrong. Try again.');
    }
  };

  return (
    <section className="newsletter-section">
      <div className="newsletter-inner">
        <div className="newsletter-text">
          <h2 className="newsletter-title">Get exclusive deals & hair tips</h2>
          <p className="newsletter-sub">Join our community and be the first to know about new arrivals, sales, and tutorials.</p>
        </div>
        {status === 'success' ? (
          <p className="newsletter-success">{msg}</p>
        ) : (
          <form onSubmit={handleSubmit} className="newsletter-form">
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="newsletter-input"
            />
            <button type="submit" disabled={status === 'loading'} className="newsletter-btn">
              {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
        )}
        {status === 'error' && <p className="newsletter-error">{msg}</p>}
      </div>
    </section>
  );
}
