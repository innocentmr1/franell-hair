import { Link } from 'react-router-dom';

const categories = ['Wigs', 'Bundles', 'Closures', 'Frontals', 'Extensions', 'Accessories'];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-cta">
        <div className="footer-cta-inner">
          <div>
            <p className="footer-cta-title">Ready for your best hair day?</p>
            <p className="footer-cta-sub">Join 2,400+ women who trust Franell Hair.</p>
          </div>
          <Link to="/shop" className="footer-cta-btn">Shop Now</Link>
        </div>
      </div>

      <div className="footer-main">
        <div>
          <p className="footer-brand-name">Franell</p>
          <p className="footer-brand-sub">Hair</p>
          <p className="footer-brand-desc">
            Premium 100% Remy human hair wigs, bundles &amp; extensions. Look and feel your best every day.
          </p>
          <div className="footer-socials">
            {['IG', 'TK', 'FB'].map((s) => (
              <a key={s} href="#" className="footer-social-btn">{s}</a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="footer-col-title">Shop</h4>
          <ul className="footer-links">
            {categories.map((cat) => (
              <li key={cat}>
                <Link to={`/shop?category=${cat}`} className="footer-link">{cat}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="footer-col-title">Help</h4>
          <ul className="footer-links">
            {['Track Order', 'Shipping Policy', 'Returns & Exchanges', 'FAQ', 'Contact Us'].map((item) => (
              <li key={item}><a href="#" className="footer-link">{item}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="footer-col-title">Contact</h4>
          <div className="footer-contacts">
            <p className="footer-contact-item">support@franellhair.com</p>
            <p className="footer-contact-item">Mon–Fri · 9am–6pm EST</p>
          </div>
          <div className="footer-shipping-box">
            <p className="footer-shipping-label">Free shipping on</p>
            <p className="footer-shipping-value">Orders over $150</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>© {new Date().getFullYear()} Franell Hair. All rights reserved.</p>
          <p>Secure payments by <span style={{ color: '#9ca3af' }}>Stripe</span></p>
        </div>
      </div>
    </footer>
  );
}
