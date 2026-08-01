import { Link } from 'react-router-dom';
import { FaInstagram, FaTiktok } from 'react-icons/fa6';

const SOCIALS = [
  { label: 'Instagram', Icon: FaInstagram, href: 'https://www.instagram.com/franell_hair?igsh=ZDVmeHI3cXkycXpt' },
  { label: 'TikTok',     Icon: FaTiktok,    href: 'https://www.tiktok.com/@franell_hair_?_r=1&_t=ZS-98PWQfnDhQ7' },
];

const HELP_LINKS = [
  { label: 'Track Order',          to: '/orders' },
  { label: 'Shipping Policy',      to: '/shipping' },
  { label: 'Returns & Exchanges',  to: '/shipping' },
  { label: 'FAQ',                  to: '/faq' },
  { label: 'Contact Us',           to: '/contact' },
];


export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-cta">
        <div className="footer-cta-inner">
          <div>
            <p className="footer-cta-title">Ready for your best hair day?</p>
            <p className="footer-cta-sub">Join over 100+ women who trust Franell Hair.</p>
          </div>
          <Link to="/shop" className="footer-cta-btn">Shop Now</Link>
        </div>
      </div>

      <div className="footer-main">
        <div>
          <p className="footer-brand-name">Franell</p>
          <p className="footer-brand-sub">Hair</p>
          <p className="footer-brand-desc">
            Premium 100% Human Hair, Bundles &amp; Extensions, crafted for a flawless, natural look that helps you feel confident and beautiful every day.
          </p>
          <div className="footer-socials">
            {SOCIALS.map(({ label, Icon, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label={label}>
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="footer-col-title">Help</h4>
          <ul className="footer-links">
            {HELP_LINKS.map(({ label, to }) => (
              <li key={label}><Link to={to} className="footer-link">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="footer-col-title">Contact</h4>
          <div className="footer-contacts">
            <p className="footer-contact-item">info@franellhair.com</p>
            <p className="footer-contact-item">Mon–Fri · 9am–6pm EST</p>
          </div>

        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>© {new Date().getFullYear()} Franell Hair. All rights reserved.</p>
          <p>All prices shown in Canadian Dollars (CAD)</p>
          <p>Secure payments by <span style={{ color: '#9ca3af' }}>Stripe</span></p>
        </div>
      </div>
    </footer>
  );
}
