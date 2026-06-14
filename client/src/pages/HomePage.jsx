import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, RotateCcw, Shield, CreditCard } from 'lucide-react';
import { getFeaturedProducts, getTopReviews, getBestseller, getHeroSlides, getCategories, getPerks } from '../services/api';
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
  }, []);

  return (
    <div>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-inner">

          {/* Left */}
          <div>
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              <span className="hero-badge-text">New Arrivals 2026</span>
            </div>

            <h1 className="hero-title">
              Hair That<br />
              <span className="hero-title-gold">Speaks</span><br />
              For Itself.
            </h1>

            <p className="hero-desc">
              Premium 100% Remy human hair wigs, bundles &amp; extensions. Beginner-friendly glueless styles — flawless from day one.
            </p>

            <div className="hero-cta-group">
              <Link to="/shop" className="btn btn-gold">
                Shop Collection <ArrowRight size={15} />
              </Link>
              <Link to="/shop?category=Wigs" className="btn btn-outline-white">
                Browse Wigs
              </Link>
            </div>

            <div className="hero-social-proof">
              <div className="hero-avatars">
                {avatarColors.map((c, i) => (
                  <div key={i} className="hero-avatar-ring" style={{ backgroundColor: c }} />
                ))}
              </div>
              <div>
                <div className="hero-stars-row">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} size={12} style={{ fill: GOLD, color: GOLD }} />
                  ))}
                  <span className="hero-rating-score">4.9</span>
                </div>
                <p className="hero-rating-sub">2,400+ happy customers</p>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="hero-right">
            <div className="hero-image-wrap">
              <HeroSlider slides={heroSlides} />
            </div>

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
              <p className="hero-ship-label">Free Ship</p>
              <p className="hero-ship-amount">$150+</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PERKS ── */}
      <div className="perks-strip">
        <div className="perks-inner">
          {perks.map(({ icon, title, desc }) => {
            const Icon = ICON_MAP[icon] || Truck;
            return (
              <div key={title} className="perk-item">
                <div className="perk-icon"><Icon size={16} /></div>
                <div>
                  <p className="perk-title">{title}</p>
                  <p className="perk-desc">{desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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

      {/* ── HAIR TYPES ── */}
      <section className="section">
        <div className="section-inner hair-types-center">
          <div className="section-header">
            <div>
              <span className="eyebrow">Textures</span>
              <h2 className="section-title">Find Your Perfect Match</h2>
            </div>
          </div>
          <div className="hair-types-pills">
            {hairTypes.map((type) => (
              <Link key={type} to={`/shop?hairType=${encodeURIComponent(type)}`} className="hair-type-pill">
                {type}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — real reviews only ── */}
      {(reviewsLoading || reviews.length > 0) && (
        <section className="section section-cream">
          <div className="section-inner">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="eyebrow">Reviews</span>
              <h2 className="section-title">What Our Customers Say</h2>
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

    </div>
  );
}
