import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, MailCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { verifyEmail, resendOtp } from '../services/api';
import toast from 'react-hot-toast';

const GOLD = '#C9A84C';

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  if (!user) return (
    <div className="checkout-noauth">
      <h2>Sign in required</h2>
      <p>Please sign in to verify your email address.</p>
      <Link to="/login" className="checkout-signin-btn">Sign In</Link>
    </div>
  );

  if (user.isEmailVerified) return (
    <div className="checkout-noauth">
      <h2>Already verified</h2>
      <p>Your email address is already confirmed.</p>
      <Link to="/" className="checkout-signin-btn">Continue Shopping</Link>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await verifyEmail(otp);
      updateUser(data);
      toast.success('Email verified! Welcome to Franell Hair.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendOtp();
      toast.success('A new code has been sent to your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not resend code');
    } finally {
      setResending(false);
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
            One last<br />
            <span className="auth-left-heading-gold">step.</span>
          </h2>
          <p className="auth-left-desc">
            Confirm your email address to finish setting up your account.
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
            <MailCheck size={40} style={{ color: GOLD }} />
          </div>
          <h1 className="auth-form-heading" style={{ textAlign: 'center' }}>Verify Your Email</h1>
          <p className="auth-form-subtitle" style={{ textAlign: 'center' }}>
            We sent a 6 digit code to <strong>{user.email}</strong>. Enter it below to confirm your account.
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
              />
            </div>

            <button type="submit" disabled={loading || otp.length !== 6} className="auth-submit">
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="spinner" />
                  Verifying...
                </span>
              ) : (
                <>Verify Email <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <p className="auth-form-subtitle" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            Didn't get a code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              style={{ background: 'none', border: 'none', color: GOLD, fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              {resending ? 'Sending...' : 'Resend Code'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
