import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1 className="about-hero-title">About Franell Hair</h1>
        <p className="about-hero-sub">Premium hair for every queen.</p>
      </div>

      <div className="about-body">
        <section className="about-section about-story">
          <div className="about-story-text">
            <p className="about-tag">Our Story</p>
            <h2 className="about-section-title">Born from passion, built for you</h2>
            <p className="about-section-body">
              Franell Hair was founded with one mission — to make premium, long-lasting hair accessible to every woman.
              We source only the finest quality hair extensions, wigs, bundles and braiding products, working
              directly with trusted suppliers to ensure every strand meets our high standards.
            </p>
            <p className="about-section-body">
              Whether you're after a sleek straight wig, bouncy body wave bundles or vibrant braiding hair for your
              next protective style, we have something for every texture, length and colour preference.
            </p>
            <Link to="/shop" className="about-cta-btn">Shop Now</Link>
          </div>
          <div className="about-story-img">
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=700&fit=crop&q=80"
              alt="Franell Hair"
            />
          </div>
        </section>

        <section className="about-values">
          <h2 className="about-section-title" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            Why choose Franell?
          </h2>
          <div className="about-values-grid">
            {[
              { icon: '✦', title: 'Premium Quality', body: '100% high-grade hair sourced from trusted suppliers. Every product is quality-checked before shipping.' },
              { icon: '🚚', title: 'Fast Shipping',   body: 'Orders ship within 1–2 business days. Free shipping on all orders over $150.' },
              { icon: '↩',  title: '30-Day Returns',  body: 'Not satisfied? Return any unused, unopened product within 30 days for a full refund.' },
              { icon: '💬', title: 'Expert Support',  body: 'Our hair specialists are available 7 days a week to help you choose the right product.' },
            ].map((v) => (
              <div key={v.title} className="about-value-card">
                <div className="about-value-icon">{v.icon}</div>
                <h3 className="about-value-title">{v.title}</h3>
                <p className="about-value-body">{v.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
