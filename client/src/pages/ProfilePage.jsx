import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, Lock, Bell, ShoppingBag, Heart, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'profile',   label: 'Personal Info',   icon: User },
  { id: 'address',   label: 'Shipping Address', icon: MapPin },
  { id: 'security',  label: 'Security',         icon: Lock },
  { id: 'prefs',     label: 'Preferences',      icon: Bell },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [tab, setTab]       = useState('profile');
  const [loading, setLoading] = useState(false);

  const [info, setInfo] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [addr, setAddr] = useState({
    street:  user?.shippingAddress?.street  || '',
    city:    user?.shippingAddress?.city    || '',
    state:   user?.shippingAddress?.state   || '',
    zip:     user?.shippingAddress?.zip     || '',
    country: user?.shippingAddress?.country || '',
  });

  const [sec, setSec] = useState({ password: '', confirmPassword: '' });

  const [prefs, setPrefs] = useState({
    newsletter:   user?.preferences?.newsletter   ?? false,
    orderUpdates: user?.preferences?.orderUpdates ?? true,
  });

  const save = async (payload, successMsg) => {
    setLoading(true);
    try {
      const { data } = await updateProfile(payload);
      updateUser(data);
      toast.success(successMsg);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInfo = (e) => {
    e.preventDefault();
    save({ name: info.name, email: info.email, phone: info.phone }, 'Profile updated!');
  };

  const handleAddr = (e) => {
    e.preventDefault();
    save({ shippingAddress: addr }, 'Address saved!');
  };

  const handleSec = (e) => {
    e.preventDefault();
    if (sec.password !== sec.confirmPassword) return toast.error('Passwords do not match');
    if (sec.password.length < 6) return toast.error('Password must be at least 6 characters');
    save({ password: sec.password }, 'Password changed!');
    setSec({ password: '', confirmPassword: '' });
  };

  const handlePrefs = (e) => {
    e.preventDefault();
    save({ preferences: prefs }, 'Preferences saved!');
  };

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const joined   = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null;

  return (
    <div className="profile-page-v2">

      {/* ── Header card ── */}
      <div className="profile-header-card">
        <div className="profile-avatar-lg">{initials}</div>
        <div className="profile-header-info">
          <h1 className="profile-header-name">{user?.name}</h1>
          <p className="profile-header-email">{user?.email}</p>
          {joined && <p className="profile-header-since">Member since {joined}</p>}
        </div>
        <div className="profile-header-links">
          <Link to="/orders" className="profile-header-link">
            <ShoppingBag size={15} /> My Orders <ChevronRight size={13} />
          </Link>
          <Link to="/wishlist" className="profile-header-link">
            <Heart size={15} /> Wishlist <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      <div className="profile-body">

        {/* ── Sidebar tabs ── */}
        <nav className="profile-tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`profile-tab-btn ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>

        {/* ── Content panels ── */}
        <div className="profile-panel">

          {tab === 'profile' && (
            <form onSubmit={handleInfo}>
              <h2 className="profile-panel-title">Personal Information</h2>
              <p className="profile-panel-sub">Update your name, email and phone number.</p>
              <div className="profile-fields-grid">
                <div className="profile-field">
                  <label className="profile-field-label">Full Name</label>
                  <input className="profile-input" value={info.name}
                    onChange={e => setInfo({ ...info, name: e.target.value })}
                    placeholder="Your full name" required />
                </div>
                <div className="profile-field">
                  <label className="profile-field-label">Email Address</label>
                  <input className="profile-input" type="email" value={info.email}
                    onChange={e => setInfo({ ...info, email: e.target.value })}
                    placeholder="you@example.com" required />
                </div>
                <div className="profile-field">
                  <label className="profile-field-label">Phone Number</label>
                  <input className="profile-input" type="tel" value={info.phone}
                    onChange={e => setInfo({ ...info, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000" />
                </div>
              </div>
              <button className="profile-save-btn" disabled={loading}>
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          )}

          {tab === 'address' && (
            <form onSubmit={handleAddr}>
              <h2 className="profile-panel-title">Default Shipping Address</h2>
              <p className="profile-panel-sub">Saved at checkout automatically.</p>
              <div className="profile-fields-grid">
                <div className="profile-field profile-field-full">
                  <label className="profile-field-label">Street Address</label>
                  <input className="profile-input" value={addr.street}
                    onChange={e => setAddr({ ...addr, street: e.target.value })}
                    placeholder="123 Main Street, Apt 4B" />
                </div>
                <div className="profile-field">
                  <label className="profile-field-label">City</label>
                  <input className="profile-input" value={addr.city}
                    onChange={e => setAddr({ ...addr, city: e.target.value })}
                    placeholder="New York" />
                </div>
                <div className="profile-field">
                  <label className="profile-field-label">State / Province</label>
                  <input className="profile-input" value={addr.state}
                    onChange={e => setAddr({ ...addr, state: e.target.value })}
                    placeholder="NY" />
                </div>
                <div className="profile-field">
                  <label className="profile-field-label">ZIP / Postal Code</label>
                  <input className="profile-input" value={addr.zip}
                    onChange={e => setAddr({ ...addr, zip: e.target.value })}
                    placeholder="10001" />
                </div>
                <div className="profile-field">
                  <label className="profile-field-label">Country</label>
                  <input className="profile-input" value={addr.country}
                    onChange={e => setAddr({ ...addr, country: e.target.value })}
                    placeholder="United States" />
                </div>
              </div>
              <button className="profile-save-btn" disabled={loading}>
                {loading ? 'Saving…' : 'Save Address'}
              </button>
            </form>
          )}

          {tab === 'security' && (
            <form onSubmit={handleSec}>
              <h2 className="profile-panel-title">Change Password</h2>
              <p className="profile-panel-sub">Choose a strong password of at least 6 characters.</p>
              <div className="profile-fields-grid">
                <div className="profile-field">
                  <label className="profile-field-label">New Password</label>
                  <input className="profile-input" type="password" value={sec.password}
                    onChange={e => setSec({ ...sec, password: e.target.value })}
                    placeholder="Min. 6 characters" required />
                </div>
                <div className="profile-field">
                  <label className="profile-field-label">Confirm New Password</label>
                  <input className="profile-input" type="password" value={sec.confirmPassword}
                    onChange={e => setSec({ ...sec, confirmPassword: e.target.value })}
                    placeholder="Repeat password" required />
                </div>
              </div>
              <button className="profile-save-btn" disabled={loading}>
                {loading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          )}

          {tab === 'prefs' && (
            <form onSubmit={handlePrefs}>
              <h2 className="profile-panel-title">Preferences</h2>
              <p className="profile-panel-sub">Control what emails and notifications you receive.</p>
              <div className="prefs-list">
                <label className="pref-row">
                  <div>
                    <p className="pref-label">Order Updates</p>
                    <p className="pref-desc">Shipping confirmations and delivery notifications.</p>
                  </div>
                  <div
                    className={`pref-toggle ${prefs.orderUpdates ? 'on' : ''}`}
                    onClick={() => setPrefs(p => ({ ...p, orderUpdates: !p.orderUpdates }))}
                    role="switch" aria-checked={prefs.orderUpdates}
                  >
                    <span className="pref-toggle-knob" />
                  </div>
                </label>
                <label className="pref-row">
                  <div>
                    <p className="pref-label">Newsletter & Promotions</p>
                    <p className="pref-desc">New arrivals, sales, and exclusive offers.</p>
                  </div>
                  <div
                    className={`pref-toggle ${prefs.newsletter ? 'on' : ''}`}
                    onClick={() => setPrefs(p => ({ ...p, newsletter: !p.newsletter }))}
                    role="switch" aria-checked={prefs.newsletter}
                  >
                    <span className="pref-toggle-knob" />
                  </div>
                </label>
              </div>
              <button className="profile-save-btn" disabled={loading}>
                {loading ? 'Saving…' : 'Save Preferences'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
