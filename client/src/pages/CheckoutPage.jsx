import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Building2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, validatePromo, createPaymentIntent, payOrder } from '../services/api';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CARD_OPTS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#111827',
      fontFamily: 'inherit',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#dc2626' },
  },
};

const STEPS = ['Shipping', 'Payment', 'Review'];

function CheckoutInner() {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [step, setStep]               = useState(0);
  const [loading, setLoading]         = useState(false);
  const [promoCode, setPromoCode]     = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [payMethod, setPayMethod]     = useState('card');
  const [savedPmId, setSavedPmId]     = useState('');
  const [cardError, setCardError]     = useState('');

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email:    user?.email || '',
    address: '', city: '', province: '', postal: '', country: 'Canada',
  });

  const shippingCost = shippingMethod === 'express' ? 30 : 0;
  const discount     = promoApplied?.discount || 0;
  const total        = +(subtotal - discount + shippingCost).toFixed(2);

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const { data } = await validatePromo(promoCode.trim(), subtotal);
      setPromoApplied(data);
      toast.success(`Code applied! You saved $${data.discount.toFixed(2)}`);
    } catch (err) {
      setPromoApplied(null);
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally { setPromoLoading(false); }
  };

  const handleShipping = (e) => setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });

  /* Step 1 → Step 2: tokenise card if card selected */
  const handlePaymentContinue = async (e) => {
    e.preventDefault();
    if (payMethod === 'interac') { setStep(2); return; }
    if (!stripe || !elements) return;
    setLoading(true);
    setCardError('');
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });
    setLoading(false);
    if (error) { setCardError(error.message); }
    else { setSavedPmId(paymentMethod.id); setStep(2); }
  };

  const buildOrderData = () => ({
    orderItems: cartItems.map((i) => ({
      product: i.product, name: i.name, image: i.image,
      price: i.price, qty: i.qty, length: i.length, color: i.color,
    })),
    shippingAddress: {
      street: shippingInfo.address, city: shippingInfo.city,
      province: shippingInfo.province, postal: shippingInfo.postal,
      country: shippingInfo.country,
    },
    shippingMethod,
    paymentMethod: payMethod === 'card' ? 'Card' : 'Interac e-Transfer',
  });

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      if (payMethod === 'card') {
        const { data: piData } = await createPaymentIntent(total);
        const { error, paymentIntent } = await stripe.confirmCardPayment(piData.clientSecret, {
          payment_method: savedPmId,
        });
        if (error) { toast.error(error.message); setLoading(false); return; }
        const { data: order } = await createOrder(buildOrderData());
        try {
          await payOrder(order._id, {
            id: paymentIntent.id, status: paymentIntent.status,
            update_time: new Date().toISOString(), email_address: shippingInfo.email,
          });
        } catch (_) {}
        clearCart();
        toast.success('Payment successful!');
        navigate(`/order-placed/${order._id}`);
      } else {
        const { data: order } = await createOrder(buildOrderData());
        clearCart();
        navigate(`/order-placed/${order._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally { setLoading(false); }
  };

  if (!user) return (
    <div className="checkout-noauth">
      <h2>Sign in to checkout</h2>
      <p>You need to be signed in to complete your purchase.</p>
      <Link to="/login" state={{ from: '/checkout' }} className="checkout-signin-btn">Sign In</Link>
    </div>
  );

  if (!cartItems.length) return (
    <div className="checkout-noauth">
      <h2>Your cart is empty</h2>
      <Link to="/shop" className="checkout-signin-btn">Shop Now</Link>
    </div>
  );

  return (
    <div className="checkout-page">
      <h1 className="checkout-title">Checkout</h1>

      <div className="checkout-steps">
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className={`checkout-step-num ${i <= step ? 'active' : ''}`}>{i + 1}</span>
            <span className={`checkout-step-label ${i <= step ? 'active' : ''}`}>{s}</span>
            {i < STEPS.length - 1 && <span className="checkout-step-divider" />}
          </div>
        ))}
      </div>

      <div className="checkout-layout">
        <div className="checkout-form-col">

          {/* ── Step 0: Shipping ── */}
          {step === 0 && (
            <form className="checkout-form" onSubmit={(e) => { e.preventDefault(); setStep(1); }}>
              <h2 className="checkout-form-title">Shipping Information</h2>
              <div className="checkout-grid-2">
                <div>
                  <label>Full Name</label>
                  <input name="fullName" required value={shippingInfo.fullName} onChange={handleShipping}
                    className="checkout-input" placeholder="Jane Doe" />
                </div>
                <div>
                  <label>Email</label>
                  <input name="email" type="email" required value={shippingInfo.email} onChange={handleShipping}
                    className="checkout-input" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label>Address</label>
                <input name="address" required value={shippingInfo.address} onChange={handleShipping}
                  className="checkout-input" placeholder="123 Main St" />
              </div>
              <div className="checkout-grid-2">
                <div>
                  <label>City</label>
                  <input name="city" required value={shippingInfo.city} onChange={handleShipping}
                    className="checkout-input" placeholder="Toronto" />
                </div>
                <div>
                  <label>Province</label>
                  <input name="province" required value={shippingInfo.province} onChange={handleShipping}
                    className="checkout-input" placeholder="Ontario" />
                </div>
              </div>
              <div className="checkout-grid-2">
                <div>
                  <label>Postal Code</label>
                  <input name="postal" required value={shippingInfo.postal} onChange={handleShipping}
                    className="checkout-input" placeholder="A1B 2C3" />
                </div>
                <div>
                  <label>Country</label>
                  <input name="country" value={shippingInfo.country} readOnly className="checkout-input"
                    style={{ background: '#f9fafb', color: '#6b7280' }} />
                </div>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <label style={{ fontWeight: 600, fontSize: '.875rem', display: 'block', marginBottom: '.75rem' }}>
                  Shipping Method
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                  {[
                    { value: 'standard', label: 'Standard Shipping', sub: '3 business days', price: 'FREE' },
                    { value: 'express',  label: 'Express Shipping',  sub: '2 business days', price: '$30.00' },
                  ].map(({ value, label, sub, price }) => (
                    <label key={value} style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', padding: '.875rem 1rem', cursor: 'pointer',
                      border: `2px solid ${shippingMethod === value ? 'var(--gold)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)', transition: 'border-color .15s',
                    }}>
                      <input type="radio" name="shippingMethod" value={value}
                        checked={shippingMethod === value} onChange={() => setShippingMethod(value)}
                        style={{ accentColor: 'var(--gold)' }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '.875rem' }}>{label}</p>
                        <p style={{ fontSize: '.75rem', color: 'var(--text-secondary)' }}>{sub}</p>
                      </div>
                      <span style={{ fontWeight: 700, color: price === 'FREE' ? '#16a34a' : 'var(--black)' }}>
                        {price}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="checkout-submit">Continue to Payment</button>
            </form>
          )}

          {/* ── Step 1: Payment ── */}
          {step === 1 && (
            <form className="checkout-form" onSubmit={handlePaymentContinue}>
              <h2 className="checkout-form-title">Payment Method</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginBottom: '1.25rem' }}>
                {[
                  { value: 'card',    label: 'Credit / Debit Card',  sub: 'Visa, Mastercard, Amex — secured by Stripe', Icon: CreditCard },
                  { value: 'interac', label: 'Interac e-Transfer',   sub: 'Manual bank transfer — instructions sent after order', Icon: Building2 },
                ].map(({ value, label, sub, Icon }) => (
                  <label key={value} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '.875rem 1rem', cursor: 'pointer',
                    border: `2px solid ${payMethod === value ? 'var(--gold)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)', transition: 'border-color .15s',
                  }}>
                    <input type="radio" name="payMethod" value={value}
                      checked={payMethod === value} onChange={() => setPayMethod(value)}
                      style={{ accentColor: 'var(--gold)' }} />
                    <Icon size={18} style={{ color: payMethod === value ? 'var(--gold)' : '#9ca3af', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '.875rem' }}>{label}</p>
                      <p style={{ fontSize: '.75rem', color: 'var(--text-secondary)' }}>{sub}</p>
                    </div>
                  </label>
                ))}
              </div>

              {payMethod === 'card' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '.875rem', display: 'block', marginBottom: '.5rem' }}>
                    Card Details
                  </label>
                  <div className="stripe-card-wrap">
                    <CardElement options={CARD_OPTS} onChange={(e) => setCardError(e.error?.message || '')} />
                  </div>
                  {cardError && <p className="stripe-card-error">{cardError}</p>}
                  <p className="stripe-card-note">Your card details are never stored on our servers — secured by Stripe.</p>
                </div>
              )}

              {payMethod === 'interac' && (
                <div className="interac-info-box">
                  <p className="interac-info-title">How it works</p>
                  <ol className="interac-info-list">
                    <li>Place your order using the button below</li>
                    <li>Send <strong>${total.toFixed(2)} CAD</strong> via Interac e-Transfer to <strong>info@franellhair.com</strong></li>
                    <li>Use your order number as the message / reference</li>
                    <li>We confirm receipt and ship within 1 business day</li>
                  </ol>
                </div>
              )}

              <div style={{ display: 'flex', gap: '.75rem' }}>
                <button type="button" onClick={() => setStep(0)} className="checkout-back">Back</button>
                <button type="submit" disabled={loading} className="checkout-submit">
                  {loading ? 'Verifying…' : 'Continue to Review →'}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 2: Review ── */}
          {step === 2 && (
            <div className="checkout-form">
              <h2 className="checkout-form-title">Review Your Order</h2>

              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '.4rem' }}>Shipping to</p>
                <p style={{ color: '#555', lineHeight: 1.7, fontSize: '.9375rem' }}>
                  {shippingInfo.fullName}<br />
                  {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.province} {shippingInfo.postal}<br />
                  {shippingInfo.country} · {shippingMethod === 'express' ? 'Express (2 days)' : 'Standard (3 days)'}
                </p>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '.4rem' }}>Payment</p>
                <p style={{ color: '#555', fontSize: '.9375rem' }}>
                  {payMethod === 'card' ? '💳  Credit / Debit Card (Stripe)' : '🏦  Interac e-Transfer'}
                </p>
              </div>

              {payMethod === 'interac' && (
                <div className="interac-info-box" style={{ marginBottom: '1.25rem' }}>
                  <p className="interac-info-title">After placing your order</p>
                  <p style={{ fontSize: '.875rem', color: '#555', lineHeight: 1.6 }}>
                    Send <strong>${total.toFixed(2)} CAD</strong> to <strong>info@franellhair.com</strong> via
                    Interac e-Transfer. Use your order number as the reference. We will confirm and ship within 1 business day.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '.75rem' }}>
                <button onClick={() => setStep(1)} className="checkout-back">Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="checkout-submit">
                  {loading
                    ? 'Processing…'
                    : payMethod === 'card'
                      ? `Pay $${total.toFixed(2)} CAD`
                      : `Place Order — $${total.toFixed(2)} CAD`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Order summary sidebar ── */}
        <div className="checkout-summary-col">
          <div className="checkout-summary-box">
            <h2 className="checkout-summary-title">Order Summary</h2>
            <div className="checkout-summary-items">
              {cartItems.map((item) => (
                <div key={item.key} className="checkout-summary-item">
                  <img src={item.image || 'https://placehold.co/60x60/f5f0eb/C9A84C?text=H'}
                    alt={item.name} className="checkout-summary-img" />
                  <div>
                    <p className="checkout-summary-item-name">{item.name}</p>
                    <p className="checkout-summary-item-qty">Qty: {item.qty}</p>
                  </div>
                  <span className="checkout-summary-item-price">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="promo-row">
              <input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Promo code" className="promo-input"
                onKeyDown={(e) => e.key === 'Enter' && applyPromo()} />
              <button onClick={applyPromo} disabled={promoLoading || !!promoApplied} className="promo-btn">
                {promoApplied ? 'Applied ✓' : promoLoading ? '…' : 'Apply'}
              </button>
            </div>
            {promoApplied && (
              <div className="promo-applied">
                <span>Code <strong>{promoApplied.code}</strong> — save ${promoApplied.discount.toFixed(2)}</span>
                <button onClick={() => { setPromoApplied(null); setPromoCode(''); }} className="promo-remove">✕</button>
              </div>
            )}

            <div className="checkout-pricing">
              <div className="checkout-pricing-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              {discount > 0 && (
                <div className="checkout-pricing-row" style={{ color: '#16a34a' }}>
                  <span>Discount</span><span>−${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="checkout-pricing-row">
                <span>Shipping ({shippingMethod === 'express' ? 'Express' : 'Standard'})</span>
                <span className={shippingCost === 0 ? 'checkout-pricing-free' : ''}>
                  {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="checkout-pricing-total"><span>Total (CAD)</span><span>${total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutInner />
    </Elements>
  );
}
