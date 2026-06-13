import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cartItems, updateQty, removeFromCart, subtotal } = useCart();

  const shipping = subtotal > 150 ? 0 : 9.99;
  const tax   = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + shipping + tax).toFixed(2);

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <ShoppingBag size={56} className="cart-empty-icon" />
        <h2 className="cart-empty-title">Your cart is empty</h2>
        <p className="cart-empty-desc">Add some beautiful hair products to get started!</p>
        <Link to="/shop" className="cart-empty-btn">
          Shop Now <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">Shopping Cart ({cartItems.length} items)</h1>

      <div className="cart-layout">
        {/* Items */}
        <div className="cart-items-list">
          {cartItems.map((item) => (
            <div key={item.key} className="cart-item">
              <img
                src={item.image || 'https://placehold.co/100x100/f5f0eb/C9A84C?text=Hair'}
                alt={item.name}
                className="cart-item-img"
              />
              <div className="cart-item-body">
                <h3 className="cart-item-name">{item.name}</h3>
                <div className="cart-item-options">
                  {item.length && <span>Length: {item.length}"</span>}
                  {item.color  && <span>Color: {item.color}</span>}
                </div>
                <p className="cart-item-price">${item.price?.toFixed(2)}</p>
                <div className="cart-item-controls">
                  <div className="qty-stepper">
                    <button className="qty-btn" onClick={() => updateQty(item.key, item.qty - 1)}>−</button>
                    <span className="qty-value">{item.qty}</span>
                    <button className="qty-btn"
                      onClick={() => updateQty(item.key, item.qty + 1)}
                      disabled={item.qty >= item.stock}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.key)} className="cart-remove-btn">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="cart-item-total">
                <p className="cart-item-total-price">${(item.price * item.qty).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="cart-summary-wrap">
          <div className="cart-summary-box">
            <h2 className="cart-summary-title">Order Summary</h2>
            <div className="cart-summary-rows">
              <div className="cart-summary-row">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'cart-ship-free' : ''}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="cart-summary-row">
                <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
              </div>
            </div>
            {subtotal > 0 && subtotal < 150 && (
              <p className="cart-upsell">
                Add ${(150 - subtotal).toFixed(2)} more for free shipping!
              </p>
            )}
            <div className="cart-summary-total">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="cart-checkout-btn">
              Checkout <ArrowRight size={16} />
            </Link>
            <Link to="/shop" className="cart-continue">← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
