import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, CheckCircle, Truck, Clock, XCircle, ChevronRight, MapPin, CreditCard, Star, X, Phone, Scissors } from 'lucide-react';
import { getMyOrders, getOrder, addReview, getSaloons } from '../services/api';
import { resolveImg } from '../assets/images';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: '#92400e', bg: '#fef3c7', icon: Clock },
  processing: { label: 'Processing', color: '#1e40af', bg: '#dbeafe', icon: Package },
  shipped:    { label: 'Shipped',    color: '#065f46', bg: '#d1fae5', icon: Truck },
  delivered:  { label: 'Delivered',  color: '#14532d', bg: '#dcfce7', icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: '#991b1b', bg: '#fee2e2', icon: XCircle },
};

const STEPS = ['pending', 'processing', 'shipped', 'delivered'];

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className="order-status-badge" style={{ color: cfg.color, background: cfg.bg }}>
      <Icon size={12} /> {cfg.label}
    </span>
  );
}

/* ── Star picker ────────────────────────────────────────── */
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="review-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n} type="button"
          className={`review-star-btn ${n <= (hovered || value) ? 'active' : ''}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
        >
          <Star size={26} fill={n <= (hovered || value) ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

/* ── Review popup modal ─────────────────────────────────── */
function ReviewModal({ order, onClose }) {
  const items  = order.orderItems || [];
  const [idx, setIdx]         = useState(0);
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState([]);          // product ids already submitted

  const current  = items[idx];
  const img      = resolveImg(current?.image);
  const progress = `${idx + 1} of ${items.length}`;

  const advance = useCallback(() => {
    setRating(0); setComment('');
    if (idx + 1 < items.length) {
      setIdx(idx + 1);
    } else {
      // mark this order as reviewed so popup doesn't reopen
      localStorage.setItem(`reviewed_${order._id}`, '1');
      onClose();
    }
  }, [idx, items.length, order._id, onClose]);

  const handleSkip = () => {
    if (idx + 1 >= items.length) {
      localStorage.setItem(`reviewed_${order._id}`, '1');
      onClose();
    } else {
      advance();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error('Please pick a star rating');
    if (!comment.trim()) return toast.error('Please write a short comment');
    setLoading(true);
    try {
      await addReview(current.product, { rating, comment: comment.trim(), productName: current.name });
      toast.success('Review submitted!');
      setDone((d) => [...d, current.product]);
      advance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (!current) return null;

  return (
    <div className="review-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="review-modal">
        {/* Header */}
        <div className="review-modal-hd">
          <div>
            <p className="review-modal-label">Rate your purchase</p>
            <p className="review-modal-progress">{progress}</p>
          </div>
          <button onClick={onClose} className="review-close-btn"><X size={18} /></button>
        </div>

        {/* Product */}
        <div className="review-product">
          {img
            ? <img src={img} alt={current.name} className="review-product-img" />
            : <div className="review-product-img review-product-ph"><Package size={24} /></div>
          }
          <div className="review-product-info">
            <p className="review-product-name">{current.name}</p>
            {current.length && <p className="review-product-meta">{current.length}" · {current.color || ''}</p>}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="review-form">
          <p className="review-form-label">Your rating *</p>
          <StarPicker value={rating} onChange={setRating} />

          <label className="review-form-label" style={{ marginTop: '1rem', display: 'block' }}>
            Your review *
          </label>
          <textarea
            value={comment} onChange={(e) => setComment(e.target.value)}
            className="review-textarea"
            placeholder="Tell others what you thought of this product…"
            rows={3}
          />

          <div className="review-modal-actions">
            <button type="button" onClick={handleSkip} className="review-skip-btn">
              {idx + 1 < items.length ? 'Skip' : 'Close'}
            </button>
            <button type="submit" disabled={loading || !rating} className="review-submit-btn">
              {loading ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </form>

        {/* Progress dots */}
        {items.length > 1 && (
          <div className="review-dots">
            {items.map((_, i) => (
              <span key={i} className={`review-dot ${i === idx ? 'active' : ''} ${done.includes(items[i]?.product) ? 'done' : ''}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Salon recommendation popup ─────────────────────────── */
function SalonPopup({ orderId, onClose }) {
  const [salons, setSalons] = useState([]);

  useEffect(() => {
    getSaloons().then(({ data }) => setSalons(data)).catch(() => {});
  }, []);

  const handleClose = () => {
    localStorage.setItem(`salon_shown_${orderId}`, '1');
    onClose();
  };

  if (!salons.length) return null;

  return (
    <div className="review-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="salon-popup">
        <div className="salon-popup-hd">
          <div className="salon-popup-hd-text">
            <Scissors size={18} className="salon-popup-icon" />
            <div>
              <p className="salon-popup-title">Your hair has been delivered!</p>
              <p className="salon-popup-sub">Book a professional installation at one of our recommended salons.</p>
            </div>
          </div>
          <button onClick={handleClose} className="review-close-btn"><X size={18} /></button>
        </div>

        <div className="salon-popup-grid">
          {salons.map((s) => (
            <div key={s._id} className="salon-popup-card">
              {s.images?.[0] && (
                <img src={s.images[0]} alt={s.name} className="salon-popup-img"
                  onError={(e) => { e.target.style.display = 'none'; }} />
              )}
              <div className="salon-popup-info">
                <p className="salon-popup-name">{s.name}</p>
                <p className="salon-popup-addr"><MapPin size={11} /> {s.address}</p>
                {s.phone && <p className="salon-popup-phone"><Phone size={11} /> {s.phone}</p>}
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleClose} className="salon-popup-dismiss">Maybe later</button>
      </div>
    </div>
  );
}

/* ── Order Detail ───────────────────────────────────────── */
export function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [showSalon, setShowSalon]   = useState(false);

  useEffect(() => {
    getOrder(id)
      .then(({ data }) => {
        setOrder(data);
        if (data.status === 'delivered') {
          const reviewed   = localStorage.getItem(`reviewed_${data._id}`);
          const salonShown = localStorage.getItem(`salon_shown_${data._id}`);
          if (!salonShown) {
            setTimeout(() => setShowSalon(true), 800);
          } else if (!reviewed) {
            setTimeout(() => setShowReview(true), 800);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSalonClose = () => {
    setShowSalon(false);
    if (order && !localStorage.getItem(`reviewed_${order._id}`)) {
      setTimeout(() => setShowReview(true), 400);
    }
  };

  const handleReviewClose = () => {
    setShowReview(false);
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!order) return (
    <div className="orders-empty">
      <Package size={56} />
      <p>Order not found.</p>
      <Link to="/orders" className="orders-empty-btn">Back to Orders</Link>
    </div>
  );

  const stepIdx = STEPS.indexOf(order.status);

  return (
    <div className="order-detail-page">
      {showReview && (
        <ReviewModal order={order} onClose={handleReviewClose} />
      )}
      {showSalon && (
        <SalonPopup orderId={order._id} onClose={handleSalonClose} />
      )}

      <div className="order-detail-topbar">
        <Link to="/orders" className="order-detail-back">← My Orders</Link>
        <StatusBadge status={order.status} />
      </div>

      <div className="order-detail-hd">
        <div>
          <h1 className="order-detail-title">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="order-detail-date">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {order.status === 'delivered' && (
          <button onClick={() => setShowReview(true)} className="review-open-btn">
            <Star size={14} /> Write a Review
          </button>
        )}
      </div>

      {/* Progress tracker */}
      {order.status !== 'cancelled' && (
        <div className="order-progress">
          {STEPS.map((step, i) => {
            const cfg  = STATUS_CONFIG[step];
            const Icon = cfg.icon;
            const done = i <= stepIdx;
            return (
              <div key={step} className="order-progress-step">
                <div className={`order-progress-circle ${done ? 'done' : ''}`}>
                  <Icon size={14} />
                </div>
                <span className={`order-progress-label ${done ? 'done' : ''}`}>{cfg.label}</span>
                {i < STEPS.length - 1 && (
                  <div className={`order-progress-line ${i < stepIdx ? 'done' : ''}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="order-detail-body">
        {/* Items */}
        <div className="order-detail-section">
          <h2 className="order-section-title">Items Ordered</h2>
          <div className="order-items-list">
            {order.orderItems?.map((item, i) => {
              const img = resolveImg(item.image);
              return (
                <div key={i} className="order-item-row">
                  <div className="order-item-img-wrap">
                    {img
                      ? <img src={img} alt={item.name} className="order-item-img" />
                      : <div className="order-item-img-placeholder"><Package size={20} /></div>
                    }
                  </div>
                  <div className="order-item-info">
                    <p className="order-item-name">{item.name}</p>
                    <p className="order-item-meta">
                      Qty: {item.qty}
                      {item.length && <span> · {item.length}"</span>}
                      {item.color  && <span> · {item.color}</span>}
                    </p>
                    <p className="order-item-unit">${item.price?.toFixed(2)} each</p>
                  </div>
                  <span className="order-item-total">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="order-detail-side">
          {/* Price breakdown */}
          <div className="order-detail-section">
            <h2 className="order-section-title"><CreditCard size={15} /> Payment Summary</h2>
            <div className="order-price-breakdown">
              <div className="order-price-row"><span>Subtotal</span><span>${order.itemsPrice?.toFixed(2)}</span></div>
              <div className="order-price-row">
                <span>Shipping</span>
                <span style={{ color: order.shippingPrice === 0 ? '#16a34a' : 'inherit' }}>
                  {order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice?.toFixed(2)}`}
                </span>
              </div>
              <div className="order-price-row"><span>Tax</span><span>${order.taxPrice?.toFixed(2)}</span></div>
              <div className="order-price-total"><span>Total</span><span>${order.totalPrice?.toFixed(2)}</span></div>
            </div>
            <p className="order-payment-method">
              Paid by {order.paymentMethod}
              {order.isPaid && <span className="order-paid-badge">✓ Paid</span>}
            </p>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="order-detail-section">
              <h2 className="order-section-title"><MapPin size={15} /> Delivery Address</h2>
              <div className="order-address-box">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''} {order.shippingAddress.zip}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Orders List ────────────────────────────────────────── */
export default function OrdersPage() {
  const { id } = useParams();
  if (id) return <OrderDetail />;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then(({ data }) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  if (orders.length === 0) {
    return (
      <div className="orders-empty">
        <div className="orders-empty-icon"><Package size={48} /></div>
        <h2 className="orders-empty-title">No orders yet</h2>
        <p className="orders-empty-sub">Once you place an order, it will appear here.</p>
        <Link to="/shop" className="orders-empty-btn">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-page-hd">
        <h1 className="orders-title">My Orders</h1>
        <span className="orders-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="orders-list">
        {orders.map((order) => {
          const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          return (
            <Link to={`/orders/${order._id}`} key={order._id} className="order-card">
              <div className="order-card-left">
                <div className="order-card-thumbs">
                  {order.orderItems?.slice(0, 3).map((item, i) => {
                    const img = resolveImg(item.image);
                    return img
                      ? <img key={i} src={img} alt={item.name} className="order-thumb" />
                      : <div key={i} className="order-thumb order-thumb-ph"><Package size={16} /></div>;
                  })}
                  {order.orderItems?.length > 3 && (
                    <div className="order-thumb order-thumb-more">+{order.orderItems.length - 3}</div>
                  )}
                </div>
                <div className="order-card-info">
                  <p className="order-card-id">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="order-card-date">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  <p className="order-card-items">{order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="order-card-right">
                <span className="order-status-badge" style={{ color: cfg.color, background: cfg.bg }}>
                  {cfg.label}
                </span>
                <p className="order-card-total">${order.totalPrice?.toFixed(2)}</p>
                <span className="order-card-arrow"><ChevronRight size={18} /></span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
