import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Building2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, validatePromo, createPaymentIntent, payOrder } from '../services/api';
import toast from 'react-hot-toast';

const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

const STRIPE_APPEARANCE = {
  theme: 'stripe',
  variables: { colorPrimary: '#C9A84C', borderRadius: '6px' },
};

const STEPS = ['Shipping', 'Payment'];

// Must be rendered inside <Elements> so useStripe/useElements work
function CardPaymentStep({ onBack, orderData, shippingEmail, total }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [peReady, setPeReady] = useState(false);
  const stripeRef = useRef(stripe);
  useEffect(() => { stripeRef.current = stripe; }, [stripe]);

  // Detect if Stripe never initialized (missing/wrong publishable key)
  useEffect(() => {
    if (!STRIPE_PK) {
      setError('Stripe publishable key is missing. Add VITE_STRIPE_PUBLISHABLE_KEY to Vercel and redeploy.');
      return;
    }
    const t = setTimeout(() => {
      if (!stripeRef.current) {
        setError('Stripe failed to load. Check that VITE_STRIPE_PUBLISHABLE_KEY is correctly set on Vercel and trigger a redeploy.');
      }
    }, 6000);
    return () => clearTimeout(t);
  }, []);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    if (confirmError) {
      setError(confirmError.message);
      setLoading(false);
      return;
    }
    try {
      const { data: order } = await createOrder(orderData);
      try {
        await payOrder(order._id, {
          id: paymentIntent.id,
          status: paymentIntent.status,
          update_time: new Date().toISOString(),
          email_address: shippingEmail,
        });
      } catch (_) {}
      clearCart();
      toast.success('Payment successful!');
      navigate(`/order-placed/${order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="checkout-form">
      <h2 className="checkout-form-title">Card Details</h2>
      <p className="stripe-card-note" style={{ marginBottom: '1.25rem' }}>
        Secured by Stripe — your card details are never stored on our servers.
      </p>
      {!peReady && (
        <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280', fontSize: '.875rem', border: '1px solid #e5e7eb', borderRadius: '6px', marginBottom: '1rem' }}>
          Loading card form…
        </div>
      )}
      <PaymentElement options={{ layout: 'tabs' }} onReady={() => setPeReady(true)} />
      {error && <p className="stripe-card-error" style={{ marginTop: '.75rem' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.5rem' }}>
        <button type="button" onClick={onBack} className="checkout-back">Back</button>
        <button onClick={handlePay} disabled={loading || !stripe || !peReady} className="checkout-submit">
          {loading ? 'Processing…' : `Pay $${total.toFixed(2)} CAD`}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]                   = useState(0);
  const [loading, setLoading]             = useState(false);
  const [promoCode, setPromoCode]         = useState('');
  const [promoApplied, setPromoApplied]   = useState(null);
  const [promoLoading, setPromoLoading]   = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [payMethod, setPayMethod]         = useState('card');
  const [clientSecret, setClientSecret]   = useState('');

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

  const handleContinueToPayment = async (e) => {
    e.preventDefault();
    if (payMethod === 'card') {
      setLoading(true);
      try {
        const { data } = await createPaymentIntent(total);
        setClientSecret(data.clientSecret);
      } catch {
        toast.error('Could not initialize payment. Please try again.');
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    setStep(1);
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

  const handleInteracOrder = async () => {
    setLoading(true);
    try {
      const { data: order } = await createOrder(buildOrderData());
      clearCart();
      navigate(`/order-placed/${order._id}`);
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

          {/* ── Step 0: Shipping + Payment Method ── */}
          {step === 0 && (
            <form className="checkout-form" onSubmit={handleContinueToPayment}>
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
                    className="checkout-input" placeholder="Ottawa" />
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

              <div style={{ marginTop: '1.25rem' }}>
                <label style={{ fontWeight: 600, fontSize: '.875rem', display: 'block', marginBottom: '.75rem' }}>
                  Payment Method
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                  {[
                    { value: 'card',    label: 'Credit / Debit Card',  sub: 'Visa, Mastercard, Amex — secured by Stripe', Icon: CreditCard },
                    { value: 'interac', label: 'Interac e-Transfer',   sub: 'Manual bank transfer — instructions after order', Icon: Building2 },
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
              </div>

              <button type="submit" disabled={loading} className="checkout-submit" style={{ marginTop: '1.5rem' }}>
                {loading ? 'Preparing…' : 'Continue to Payment →'}
              </button>
            </form>
          )}

          {/* ── Step 1: Card — PaymentElement inside its own Elements context ── */}
          {step === 1 && payMethod === 'card' && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: STRIPE_APPEARANCE }}>
              <CardPaymentStep
                onBack={() => { setClientSecret(''); setStep(0); }}
                orderData={buildOrderData()}
                shippingEmail={shippingInfo.email}
                total={total}
              />
            </Elements>
          )}

          {/* ── Step 1: Interac ── */}
          {step === 1 && payMethod === 'interac' && (
            <div className="checkout-form">
              <h2 className="checkout-form-title">Interac e-Transfer</h2>
              <div className="interac-info-box">
                <p className="interac-info-title">How to complete your payment</p>
                <ol className="interac-info-list">
                  <li>Place your order using the button below</li>
                  <li>Send <strong>${total.toFixed(2)} CAD</strong> via Interac e-Transfer to <strong>info@franellhair.com</strong></li>
                  <li>Use your order number as the message / reference</li>
                  <li>We confirm receipt and ship within 1 business day</li>
                </ol>
              </div>
              <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setStep(0)} className="checkout-back">Back</button>
                <button onClick={handleInteracOrder} disabled={loading} className="checkout-submit">
                  {loading ? 'Placing Order…' : `Place Order — $${total.toFixed(2)} CAD`}
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
