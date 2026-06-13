import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const { data } = await updateProfile(payload);
      updateUser(data);
      toast.success('Profile updated!');
      setForm((f) => ({ ...f, password: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <h1 className="profile-title">My Profile</h1>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-card">
          <h2 className="profile-card-title">Personal Information</h2>
          <div className="profile-fields">
            <div className="profile-grid-2">
              <div>
                <label className="profile-field-label">Full Name</label>
                <input
                  type="text" name="name" value={form.name}
                  onChange={handleChange} className="profile-input"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="profile-field-label">Email Address</label>
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} className="profile-input"
                  placeholder="you@example.com"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h2 className="profile-card-title">Change Password</h2>
          <p style={{ color: '#777', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Leave blank to keep your current password.
          </p>
          <div className="profile-fields">
            <div className="profile-grid-2">
              <div>
                <label className="profile-field-label">New Password</label>
                <input
                  type="password" name="password" value={form.password}
                  onChange={handleChange} className="profile-input"
                  placeholder="Min. 6 characters"
                />
              </div>
              <div>
                <label className="profile-field-label">Confirm Password</label>
                <input
                  type="password" name="confirmPassword" value={form.confirmPassword}
                  onChange={handleChange} className="profile-input"
                  placeholder="Repeat new password"
                />
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="profile-save-btn">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
