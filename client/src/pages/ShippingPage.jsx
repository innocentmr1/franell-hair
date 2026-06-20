import { Link } from 'react-router-dom';
import { Truck, RotateCcw, Clock, MapPin } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="shipping-page">
      <div className="faq-hero">
        <h1 className="faq-hero-title">Shipping & Returns</h1>
        <p className="faq-hero-sub">Fast, reliable delivery and hassle-free returns.</p>
      </div>

      <div className="faq-body">

        {/* Shipping */}
        <div className="shipping-cards">
          {[
            { icon: <Truck size={28} />, title: 'Standard Shipping', detail: '3 business days', note: 'Always FREE — no minimum order required' },
            { icon: <Clock size={28} />, title: 'Express Shipping', detail: '2 business days', note: '$30 flat fee — faster delivery to your door' },
            { icon: <MapPin size={28} />, title: 'Same-Day Dispatch', detail: 'Orders before 2pm EST', note: 'Placed Mon–Fri ship the same day' },
          ].map((c) => (
            <div key={c.title} className="shipping-card">
              <div className="shipping-card-icon">{c.icon}</div>
              <h3 className="shipping-card-title">{c.title}</h3>
              <p className="shipping-card-detail">{c.detail}</p>
              <p className="shipping-card-note">{c.note}</p>
            </div>
          ))}
        </div>

        <section className="shipping-section">
          <h2 className="faq-section-title">Shipping Policy</h2>
          <div className="shipping-prose">
            <p>All orders are processed within 1–2 business days (excluding weekends and public holidays). You will receive a shipping confirmation email with your tracking number once your order has shipped.</p>
            <p>Currently, we ship to addresses within Canada only. We are working on expanding our shipping and will announce when it's available.</p>
            <p>Please ensure your shipping address is correct at checkout. Franell Hair is not responsible for packages delivered to an incorrect address provided by the customer.</p>
            <p>If your package is lost or arrives damaged, please contact us within <strong>2 days</strong> of the expected delivery date at <a href="mailto:info@franellhair.com">info@franellhair.com</a> and we will resolve it promptly.</p>
          </div>
        </section>

        <section className="shipping-section">
          <h2 className="faq-section-title" style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <RotateCcw size={22} /> Returns & Exchanges
          </h2>
          <div className="shipping-prose">
            <h3>10-Day Return Policy</h3>
            <p>We want you to love your Franell Hair purchase. If you are not completely satisfied, you may return eligible items within <strong>10 days</strong> of delivery for a full refund or exchange.</p>

            <h3>Eligibility</h3>
            <ul>
              <li>Items must be unused, uninstalled, and in original packaging</li>
              <li>Hair that has been worn, washed, colored, or altered cannot be returned for hygiene and safety reasons</li>
              <li>Sale items are final sale and cannot be returned</li>
              <li>Original shipping fees are non-refundable</li>
            </ul>

            <h3>How to Return</h3>
            <ol>
              <li>Email <a href="mailto:info@franellhair.com">info@franellhair.com</a> with your order number and reason for return</li>
              <li>We'll send you a prepaid return shipping label within 1–2 business days</li>
              <li>Pack the item securely in its original packaging and drop it off at any Canada Post location</li>
              <li>Once we receive and inspect the item, your refund will be processed within 3–5 business days</li>
            </ol>

            <h3>Exchanges</h3>
            <p>Want a different length, texture, or colour? We're happy to exchange any eligible item. Email us within 10 days of delivery and we'll arrange the swap at no extra cost.</p>
          </div>
        </section>

        <div className="faq-contact-cta">
          <h3>Need help with an order?</h3>
          <p>Contact our support team and we'll get back to you within 24 hours.</p>
          <a href="mailto:info@franellhair.com" className="faq-contact-btn">Contact Support</a>
        </div>

      </div>
    </div>
  );
}
