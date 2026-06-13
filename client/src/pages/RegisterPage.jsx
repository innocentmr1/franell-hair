import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const perks = [
  'Track your orders in real time',
  'Save your favourite products',
  'Exclusive member-only discounts',
  'Free shipping rewards',
];

function getStrength(p) {
  if (!p) return null;
  if (p.length < 6) return { label: 'Too short', cls: 's1' };
  if (p.length < 8) return { label: 'Weak',      cls: 's2' };
  if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Fair', cls: 's3' };
  return { label: 'Strong', cls: 's4' };
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const strength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Welcome to Franell Hair!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const confirmState =
    form.confirm && form.password !== form.confirm ? 'error' :
    form.confirm && form.password === form.confirm  ? 'success' : '';

  return (
    <div className="auth-page">

      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-deco-ring-1" />
        <div className="auth-deco-ring-2" />
        <div className="auth-deco-ring-3" />

        <Link to="/" className="auth-left-logo">
          <div className="auth-left-logo-name">Franell</div>
          <div className="auth-left-logo-sub">Hair</div>
        </Link>

        <div className="auth-left-content">
          <div className="auth-left-line" />
          <h2 className="auth-left-heading">
            Join the<br />
            <span className="auth-left-heading-gold">Franell</span><br />
            family.
          </h2>
          <p className="auth-left-desc">
            Create your free account and unlock exclusive member benefits.
          </p>

          <div className="auth-perks" style={{ marginTop: '2rem' }}>
            {perks.map((perk) => (
              <div key={perk} className="auth-perk-item">
                <div className="auth-perk-check"><Check size={10} /></div>
                <span className="auth-perk-text">{perk}</span>
              </div>
            ))}
          </div>

          <div className="auth-stats-grid">
            {[['2,400+', 'Customers'], ['4.9★', 'Rating'], ['30-day', 'Returns']].map(([val, label]) => (
              <div key={label}>
                <p className="auth-stat-value">{val}</p>
                <p className="auth-stat-label">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="auth-left-footer">© 2026 Franell Hair.</p>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <Link to="/" className="auth-mobile-logo">
          <div className="auth-mobile-logo-name">Franell</div>
          <div className="auth-mobile-logo-sub">Hair</div>
        </Link>

        <div className="auth-form-container">
          <h1 className="auth-form-heading">Create Account</h1>
          <p className="auth-form-subtitle">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} className="auth-form">

            <div>
              <label className="form-label">Full Name</label>
              <input type="text" name="name" required value={form.name}
                onChange={handleChange} placeholder="Jane Doe" className="form-input" />
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <input type="email" name="email" required value={form.email}
                onChange={handleChange} placeholder="you@example.com" className="form-input" />
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'} name="password" required
                  value={form.password} onChange={handleChange} placeholder="Min. 6 characters"
                  className="form-input" style={{ paddingRight: '2.75rem' }}
                />
                <button type="button" className="input-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {strength && (
                <div>
                  <div className="strength-track">
                    <div className={`strength-fill ${strength.cls}`} />
                  </div>
                  <p className="strength-label">{strength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Confirm Password</label>
              <div className="input-wrap">
                <input
                  type={showConfirm ? 'text' : 'password'} name="confirm" required
                  value={form.confirm} onChange={handleChange} placeholder="Repeat password"
                  className={`form-input ${confirmState}`}
                  style={{ paddingRight: '3.5rem' }}
                />
                <button type="button" className="input-eye" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                {form.confirm && form.password === form.confirm && (
                  <span className="input-check"><Check size={14} /></span>
                )}
              </div>
              {form.confirm && form.password !== form.confirm && (
                <p className="form-error">Passwords don't match</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="auth-submit">
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="spinner" />
                  Creating account...
                </span>
              ) : (
                <>Create Account <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <p className="auth-terms">
            By creating an account you agree to our{' '}
            <a href="#">Terms</a> &amp; <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
