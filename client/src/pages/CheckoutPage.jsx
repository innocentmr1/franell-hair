import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/api';
import toast from 'react-hot-toast';

const STEPS = ['Shipping', 'Payment', 'Review'];

export default function CheckoutPage() {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });

  const [payment, setPayment] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    nameOnCard: '',
  });

  const shippingCost = subtotal > 150 ? 0 : 9.99;
  const tax   = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + shippingCost + tax).toFixed(2);

  const handleShipping = (e) => setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  const handlePayment  = (e) => setPayment({ ...payment, [e.target.name]: e.target.value });

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        orderItems: cartItems.map((i) => ({
          product: i.product,
          name: i.name,
          image: i.image,
          price: i.price,
          qty: i.qty,
          length: i.length,
          color: i.color,
        })),
        shippingAddress: {
          street:  shippingInfo.address,
          city:    shippingInfo.city,
          state:   shippingInfo.state,
          zip:     shippingInfo.zip,
          country: shippingInfo.country,
        },
        paymentMethod: 'Card',
      };
      const { data } = await createOrder(orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="checkout-noauth">
        <h2>Sign in to checkout</h2>
        <p>You need to be signed in to complete your purchase.</p>
        <Link to="/login" state={{ from: '/checkout' }} className="checkout-signin-btn">
          Sign In
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-noauth">
        <h2>Your cart is empty</h2>
        <Link to="/shop" className="checkout-signin-btn">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="checkout-title">Checkout</h1>

      {/* Steps */}
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

        {/* Form column */}
        <div className="checkout-form-col">

          {step === 0 && (
            <form className="checkout-form" onSubmit={(e) => { e.preventDefault(); setStep(1); }}>
              <h2 className="checkout-form-title">Shipping Information</h2>
              <div className="checkout-grid-2">
                <div>
                  <label>Full Name</label>
                  <input name="fullName" required value={shippingInfo.fullName}
                    onChange={handleShipping} className="checkout-input" placeholder="Jane Doe" />
                </div>
                <div>
                  <label>Email</label>
                  <input name="email" type="email" required value={shippingInfo.email}
                    onChange={handleShipping} className="checkout-input" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label>Address</label>
                <input name="address" required value={shippingInfo.address}
                  onChange={handleShipping} className="checkout-input" placeholder="123 Main St" />
              </div>
              <div className="checkout-grid-2">
                <div>
                  <label>City</label>
                  <input name="city" required value={shippingInfo.city}
                    onChange={handleShipping} className="checkout-input" placeholder="New York" />
                </div>
                <div>
                  <label>State</label>
                  <input name="state" required value={shippingInfo.state}
                    onChange={handleShipping} className="checkout-input" placeholder="NY" />
                </div>
              </div>
              <div className="checkout-grid-2">
                <div>
                  <label>ZIP Code</label>
                  <input name="zip" required value={shippingInfo.zip}
                    onChange={handleShipping} className="checkout-input" placeholder="10001" />
                </div>
                <div>
                  <label>Country</label>
                  <input name="country" required value={shippingInfo.country}
                    onChange={handleShipping} className="checkout-input" />
                </div>
              </div>
              <button type="submit" className="checkout-submit">Continue to Payment</button>
            </form>
          )}

          {step === 1 && (
            <form className="checkout-form" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
              <h2 className="checkout-form-title">Payment Details</h2>
              <p className="checkout-pay-title">Demo mode — no real charges will be made.</p>
              <div>
                <label>Name on Card</label>
                <input name="nameOnCard" required value={payment.nameOnCard}
                  onChange={handlePayment} className="checkout-input" placeholder="Jane Doe" />
              </div>
              <div>
                <label>Card Number</label>
                <input name="cardNumber" required value={payment.cardNumber}
                  onChange={handlePayment} className="checkout-input" placeholder="4242 4242 4242 4242" maxLength={19} />
              </div>
              <div className="checkout-grid-2">
                <div>
                  <label>Expiry</label>
                  <input name="expiry" required value={payment.expiry}
                    onChange={handlePayment} className="checkout-input" placeholder="MM/YY" maxLength={5} />
                </div>
                <div>
                  <label>CVV</label>
                  <input name="cvv" required value={payment.cvv}
                    onChange={handlePayment} className="checkout-input" placeholder="123" maxLength={4} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setStep(0)} className="checkout-back">Back</button>
                <button type="submit" className="checkout-submit">Review Order</button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="checkout-form">
              <h2 className="checkout-form-title">Review Your Order</h2>

              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Shipping to:</p>
                <p style={{ color: '#555', lineHeight: 1.6 }}>
                  {shippingInfo.fullName}<br />
                  {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}<br />
                  {shippingInfo.country}
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Payment:</p>
                <p style={{ color: '#555' }}>Card ending in {payment.cardNumber.slice(-4) || '****'}</p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setStep(1)} className="checkout-back">Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="checkout-submit">
                  {loading ? 'Placing Order...' : `Place Order — $${total}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary column */}
        <div className="checkout-summary-col">
          <div className="checkout-summary-box">
            <h2 className="checkout-summary-title">Order Summary</h2>
            <div className="checkout-summary-items">
              {cartItems.map((item) => (
                <div key={item.key} className="checkout-summary-item">
                  <img
                    src={item.image || 'https://placehold.co/60x60/f5f0eb/C9A84C?text=H'}
                    alt={item.name}
                    className="checkout-summary-img"
                  />
                  <div>
                    <p className="checkout-summary-item-name">{item.name}</p>
                    <p className="checkout-summary-item-qty">Qty: {item.qty}</p>
                  </div>
                  <span className="checkout-summary-item-price">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="checkout-pricing">
              <div className="checkout-pricing-row">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="checkout-pricing-row">
                <span>Shipping</span>
                <span className={shippingCost === 0 ? 'checkout-pricing-free' : ''}>
                  {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="checkout-pricing-row">
                <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
              </div>
              <div className="checkout-pricing-total">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
