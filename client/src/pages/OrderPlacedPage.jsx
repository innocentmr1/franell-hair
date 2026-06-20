import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, MapPin, Phone } from 'lucide-react';
import { getSaloons } from '../services/api';

export default function OrderPlacedPage() {
  const { id } = useParams();
  const [saloons, setSaloons] = useState([]);

  useEffect(() => {
    getSaloons().then(({ data }) => setSaloons(data)).catch(() => {});
  }, []);

  return (
    <div className="order-placed-page">
      <div className="order-placed-hero">
        <CheckCircle size={56} className="order-placed-check" />
        <h1 className="order-placed-title">Order Placed!</h1>
        <p className="order-placed-sub">Thank you for your purchase. Your order is being processed and you'll receive a confirmation email shortly.</p>
        <div className="order-placed-actions">
          <Link to={`/orders/${id}`} className="btn btn-gold">View My Order</Link>
          <Link to="/shop" className="btn btn-outline-gold">Continue Shopping</Link>
        </div>
      </div>

      {saloons.length > 0 && (
        <div className="saloon-rec-section">
          <div className="saloon-rec-inner">
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span className="eyebrow">Professional Installation</span>
              <h2 className="section-title" style={{ marginTop: '.5rem' }}>Recommended Salons Near You</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '.5rem', fontSize: '.9375rem' }}>
                Get your Franell Hair installed by a professional stylist.
              </p>
            </div>
            <div className="saloon-rec-grid">
              {saloons.map((s) => (
                <div key={s._id} className="saloon-card">
                  {s.images?.[0] && (
                    <div className="saloon-card-img-wrap">
                      <img src={s.images[0]} alt={s.name} className="saloon-card-img"
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                  )}
                  {s.images?.length > 1 && (
                    <div className="saloon-card-gallery">
                      {s.images.slice(1, 4).map((img, i) => (
                        <img key={i} src={img} alt="" className="saloon-card-thumb"
                          onError={(e) => { e.target.style.display = 'none'; }} />
                      ))}
                    </div>
                  )}
                  <div className="saloon-card-body">
                    <h3 className="saloon-card-name">{s.name}</h3>
                    <p className="saloon-card-addr"><MapPin size={13} /> {s.address}</p>
                    {s.phone && <p className="saloon-card-phone"><Phone size={13} /> {s.phone}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
