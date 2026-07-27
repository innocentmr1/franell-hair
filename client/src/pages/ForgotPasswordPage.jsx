import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, CheckCircle } from 'lucide-react';
import { forgotPassword } from '../services/api';
import toast from 'react-hot-toast';

const GOLD = '#C9A84C';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
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
            Forgot your<br />
            <span className="auth-left-heading-gold">password?</span>
          </h2>
          <p className="auth-left-desc">
            No worries — we'll email you a link to reset it.
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
          {sent ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <CheckCircle size={40} style={{ color: GOLD }} />
              </div>
              <h1 className="auth-form-heading" style={{ textAlign: 'center' }}>Check your email</h1>
              <p className="auth-form-subtitle" style={{ textAlign: 'center' }}>
                If <strong>{email}</strong> is registered, we've sent a link to reset your password. It expires in 1 hour.
              </p>
              <p className="auth-form-subtitle" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <Link to="/login">Back to Sign In</Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="auth-form-heading">Reset Password</h1>
              <p className="auth-form-subtitle">
                Remembered it? <Link to="/login">Sign in</Link>
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

                <button type="submit" disabled={loading} className="auth-submit">
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="spinner" />
                      Sending...
                    </span>
                  ) : (
                    <>Send Reset Link <ArrowRight size={14} /></>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
