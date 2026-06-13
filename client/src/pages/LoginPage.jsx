import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GOLD = '#C9A84C';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(state?.from || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-deco-1" />
        <div className="auth-deco-2" />

        <Link to="/" className="auth-left-logo">
          <div className="auth-left-logo-name">Franell</div>
          <div className="auth-left-logo-sub">Hair</div>
        </Link>

        <div className="auth-left-content">
          <div className="auth-left-line" />
          <h2 className="auth-left-heading">
            Welcome<br />back to<br />
            <span className="auth-left-heading-gold">your glow.</span>
          </h2>
          <p className="auth-left-desc">
            Sign in to track orders, save favourites, and unlock exclusive member deals.
          </p>

          <div className="auth-testimonial">
            <div className="auth-testimonial-stars">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} size={12} style={{ fill: GOLD, color: GOLD }} />
              ))}
            </div>
            <p className="auth-testimonial-quote">
              "The HD lace is absolutely undetectable. I get compliments every single day!"
            </p>
            <div className="auth-testimonial-author">
              <div className="auth-testimonial-avatar">N</div>
              <div>
                <p className="auth-testimonial-name">Nadia O.</p>
                <p className="auth-testimonial-role">Verified Customer</p>
              </div>
            </div>
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
          <h1 className="auth-form-heading">Sign In</h1>
          <p className="auth-form-subtitle">
            No account?{' '}
            <Link to="/register">Create one free</Link>
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input"
              />
            </div>

            <div>
              <div className="auth-pw-header">
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <a href="#" className="auth-forgot">Forgot?</a>
              </div>
              <div className="input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'} required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button type="button" className="input-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-submit">
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="spinner" />
                  Signing in...
                </span>
              ) : (
                <>Sign In <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">or continue with</span>
            <div className="auth-divider-line" />
          </div>

          <div className="auth-social-grid">
            {['Google', 'Facebook'].map((p) => (
              <button key={p} type="button" className="auth-social-btn">
                {p === 'Google' ? (
                  <svg width="15" height="15" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )}
                {p}
              </button>
            ))}
          </div>

          <p className="auth-terms">
            By signing in you agree to our{' '}
            <a href="#">Terms</a> &amp; <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
