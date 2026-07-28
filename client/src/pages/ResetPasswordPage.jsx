import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GOLD = '#C9A84C';
const STRONG_PW = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!STRONG_PW.test(password)) {
      toast.error('Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const data = await resetPassword(token, password);
      if (data.mfaRequired) {
        toast.success('Password updated! Check your email for a sign-in code.');
        navigate('/admin-mfa', { state: { email: data.email } });
        return;
      }
      toast.success('Password updated! You are now signed in.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'This reset link is invalid or has expired.');
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
            Choose a<br />
            <span className="auth-left-heading-gold">new password.</span>
          </h2>
          <p className="auth-left-desc">
            Pick something strong you haven't used before.
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
          <h1 className="auth-form-heading">Set New Password</h1>
          <p className="auth-form-subtitle">
            At least 8 characters, with an uppercase letter, a lowercase letter, and a number.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <label className="form-label">New Password</label>
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

            <div>
              <label className="form-label">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'} required value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="form-input"
              />
            </div>

            <button type="submit" disabled={loading} className="auth-submit">
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="spinner" />
                  Updating...
                </span>
              ) : (
                <>Update Password <ArrowRight size={14} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
