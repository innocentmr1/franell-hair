import { useState } from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendContactMessage } from '../services/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await sendContactMessage(form);
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1 className="contact-hero-title">Get in Touch</h1>
        <p className="contact-hero-sub">We're here to help with any questions about your order or our products.</p>
      </div>

      <div className="contact-body">
        {/* Info cards */}
        <div className="contact-info-grid">
          {[
            { icon: Mail,   label: 'Email Us',       value: 'info@franellhair.com' },
            { icon: Phone,  label: 'Call Us',         value: '+1 (709) 341-7527' },
            { icon: MapPin, label: 'Location',        value: 'Ontario, Canada' },
            { icon: Clock,  label: 'Business Hours',  value: 'Mon–Sat 9am – 6pm EST' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="contact-info-card">
              <div className="contact-info-icon"><Icon size={20} /></div>
              <p className="contact-info-label">{label}</p>
              <p className="contact-info-value">{value}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="contact-form-wrap">
          <h2 className="contact-form-title">Send us a message</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="contact-form-grid">
              <div className="contact-field">
                <label>Full Name *</label>
                <input name="name" required value={form.name} onChange={handle}
                  className="contact-input" placeholder="Jane Doe" />
              </div>
              <div className="contact-field">
                <label>Email Address *</label>
                <input name="email" type="email" required value={form.email} onChange={handle}
                  className="contact-input" placeholder="you@example.com" />
              </div>
            </div>
            <div className="contact-field">
              <label>Subject *</label>
              <input name="subject" required value={form.subject} onChange={handle}
                className="contact-input" placeholder="Order inquiry, product question…" />
            </div>
            <div className="contact-field">
              <label>Message *</label>
              <textarea name="message" required rows={5} value={form.message} onChange={handle}
                className="contact-textarea" placeholder="Tell us how we can help…" />
            </div>
            <button type="submit" disabled={sending} className="contact-submit-btn">
              {sending ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
