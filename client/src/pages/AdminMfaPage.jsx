import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GOLD = '#C9A84C';

export default function AdminMfaPage() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyAdminMfa } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;

  if (!email) return (
    <div className="checkout-noauth">
      <h2>Sign in first</h2>
      <p>Please sign in with your email and password to receive a verification code.</p>
      <Link to="/login" className="checkout-signin-btn">Sign In</Link>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyAdminMfa(email, otp);
      toast.success('Welcome back!');
      navigate(state?.from || '/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired code');
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
            Verifying<br />
            <span className="auth-left-heading-gold">it's really you.</span>
          </h2>
          <p className="auth-left-desc">
            Admin accounts require an extra verification step for security.
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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <ShieldCheck size={40} style={{ color: GOLD }} />
          </div>
          <h1 className="auth-form-heading" style={{ textAlign: 'center' }}>Admin Verification</h1>
          <p className="auth-form-subtitle" style={{ textAlign: 'center' }}>
            We sent a 6 digit code to <strong>{email}</strong>. Enter it below to finish signing in.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <label className="form-label">Verification Code</label>
              <input
                type="text" required value={otp} maxLength={6} inputMode="numeric"
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="form-input"
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em', fontWeight: 700 }}
                autoFocus
              />
            </div>

            <button type="submit" disabled={loading || otp.length !== 6} className="auth-submit">
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="spinner" />
                  Verifying...
                </span>
              ) : (
                <>Verify and Sign In <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <p className="auth-form-subtitle" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            Didn't get a code? <Link to="/login">Go back and sign in again</Link> to request a new one.
          </p>
        </div>
      </div>
    </div>
  );
}
