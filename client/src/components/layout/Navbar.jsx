import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Heart, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getCategories, getAnnouncement } from '../../services/api';

const FALLBACK_CATS = [];

const NAV_LINKS = [
  { label: 'Home',    to: '/' },
  { label: 'Shop',    to: '/shop' },
  { label: 'About',   to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [catOpen,   setCatOpen]   = useState(false);
  const [userOpen,  setUserOpen]  = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [searchQuery, setSearch]  = useState('');
  const [cats, setCats]           = useState(FALLBACK_CATS);
  const [announcement, setAnnouncement] = useState('✦ FREE SHIPPING ON ORDERS $150+  ·  BUY NOW PAY LATER AVAILABLE  ·  NEW ARRIVALS EVERY WEEK ✦');
  const { user, logout }          = useAuth();
  const { totalItems }            = useCart();
  const { items: wishItems }      = useWishlist();
  const navigate                  = useNavigate();
  const catRef                    = useRef(null);
  const userRef                   = useRef(null);

  useEffect(() => {
    getCategories()
      .then(({ data }) => { if (data?.length) setCats(data); })
      .catch(() => {});
    getAnnouncement()
      .then(({ data }) => { if (data?.value) setAnnouncement(data.value); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (catRef.current && !catRef.current.contains(e.target))  setCatOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearch(''); setMenuOpen(false);
    }
  };

  const closeAll = () => { setMenuOpen(false); setCatOpen(false); setUserOpen(false); };

  return (
    <header className="navbar">
      <div className="nav-announcement">
        <div className="nav-announcement-track">
          <span className="nav-announcement-text">{announcement}</span>
          <span className="nav-announcement-text">{announcement}</span>
        </div>
      </div>

      <div className="nav-body">
        <div className="nav-inner">

          <Link to="/" className="nav-logo" onClick={closeAll}>
            <div className="nav-logo-name">Franell</div>
            <div className="nav-logo-sub">Hair</div>
          </Link>

          {/* Desktop nav */}
          <nav className="nav-links">
            {NAV_LINKS.map(({ label, to }) => (
              <Link key={label} to={to} className="nav-link" onClick={closeAll}>{label}</Link>
            ))}

            {/* Categories dropdown */}
            <div className="nav-cat-wrap" ref={catRef}>
              <button
                className={`nav-link nav-cat-btn${catOpen ? ' active' : ''}`}
                onClick={() => { setCatOpen(!catOpen); setUserOpen(false); }}
              >
                Categories <ChevronDown size={13} className={`nav-chevron${catOpen ? ' flipped' : ''}`} />
              </button>

              {catOpen && (
                <div className="nav-cat-dropdown">
                  <div className="nav-cat-grid">
                    {cats.map((c) => (
                      <Link
                        key={c._id || c.name}
                        to={`/shop?category=${encodeURIComponent(c.name)}`}
                        className="nav-cat-item"
                        onClick={() => { setCatOpen(false); }}
                      >
                        <span className="nav-cat-dot" />
                        {c.name}
                      </Link>
                    ))}
                  </div>
                  <div className="nav-cat-footer">
                    <Link to="/shop" className="nav-cat-all" onClick={() => setCatOpen(false)}>
                      View All Products →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          <form onSubmit={handleSearch} className="nav-search-form">
            <div className="nav-search-inner">
              <input type="text" placeholder="Search..." value={searchQuery}
                onChange={(e) => setSearch(e.target.value)} className="nav-search-input" />
              <button type="submit" className="nav-search-btn"><Search size={14} /></button>
            </div>
          </form>

          <div className="nav-actions">
            <Link to="/wishlist" className="nav-cart" title="Wishlist" onClick={closeAll}>
              <Heart size={18} />
              {wishItems.length > 0 && <span className="nav-cart-badge">{wishItems.length}</span>}
            </Link>

            {user ? (
              <div className="nav-user" ref={userRef}>
                <button className="nav-avatar-btn" onClick={() => { setUserOpen(!userOpen); setCatOpen(false); }}>
                  <div className="nav-avatar">{user.name?.[0]?.toUpperCase()}</div>
                </button>
                {userOpen && (
                  <div className="nav-dropdown">
                    <div className="nav-dropdown-header">
                      <div className="nav-dropdown-name">{user.name}</div>
                      <div className="nav-dropdown-email">{user.email}</div>
                    </div>
                    <Link to="/profile"  onClick={closeAll} className="nav-dropdown-link">My Profile</Link>
                    <Link to="/orders"   onClick={closeAll} className="nav-dropdown-link">My Orders</Link>
                    <Link to="/wishlist" onClick={closeAll} className="nav-dropdown-link">My Wishlist</Link>
                    {user.isAdmin && (
                      <Link to="/admin" onClick={closeAll} className="nav-dropdown-link" style={{ color: '#C9A84C' }}>
                        Admin Panel
                      </Link>
                    )}
                    <button onClick={() => { logout(); closeAll(); }} className="nav-dropdown-signout">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="nav-login-link" onClick={closeAll}><User size={18} /></Link>
            )}

            <Link to="/cart" className="nav-cart" onClick={closeAll}>
              <ShoppingCart size={18} />
              {totalItems > 0 && <span className="nav-cart-badge">{totalItems}</span>}
            </Link>

            <button className="nav-mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="nav-mobile-drawer">
            <form onSubmit={handleSearch} className="nav-mobile-search">
              <input type="text" placeholder="Search..." value={searchQuery}
                onChange={(e) => setSearch(e.target.value)} className="nav-mobile-search-input" />
              <button type="submit" className="nav-mobile-search-btn"><Search size={14} /></button>
            </form>

            {/* Static links */}
            <div className="nav-mobile-static">
              {NAV_LINKS.map(({ label, to }) => (
                <Link key={label} to={to} onClick={() => setMenuOpen(false)} className="nav-mobile-static-link">
                  {label}
                </Link>
              ))}
            </div>

            {/* Mobile categories accordion */}
            <button className="nav-mobile-cat-toggle" onClick={() => setMobileCatOpen(!mobileCatOpen)}>
              Categories <ChevronDown size={13} className={mobileCatOpen ? 'flipped' : ''} />
            </button>
            {mobileCatOpen && (
              <div className="nav-mobile-grid">
                {cats.map((c) => (
                  <Link key={c._id || c.name} to={`/shop?category=${encodeURIComponent(c.name)}`}
                    onClick={() => setMenuOpen(false)} className="nav-mobile-link">
                    {c.name}
                  </Link>
                ))}
              </div>
            )}

            {!user
              ? <Link to="/login" onClick={() => setMenuOpen(false)} className="nav-mobile-signin">Sign In / Register</Link>
              : <button onClick={() => { logout(); setMenuOpen(false); }} className="nav-mobile-signout">Sign Out</button>
            }
          </div>
        )}
      </div>
    </header>
  );
}
