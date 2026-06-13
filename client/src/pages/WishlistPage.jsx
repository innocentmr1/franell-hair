import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { resolveImg } from '../assets/images';
import toast from 'react-hot-toast';

const FALLBACK = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=440&fit=crop&q=80';

export default function WishlistPage() {
  const { items, toggle } = useWishlist();
  const { addToCart }     = useCart();

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success('Added to cart!');
  };

  if (items.length === 0) {
    return (
      <div className="wishlist-empty">
        <div className="wishlist-empty-icon"><Heart size={48} /></div>
        <h2 className="wishlist-empty-title">Your wishlist is empty</h2>
        <p className="wishlist-empty-sub">Save items you love and come back to them anytime.</p>
        <Link to="/shop" className="orders-empty-btn">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-hd">
        <h1 className="wishlist-title">My Wishlist</h1>
        <span className="wishlist-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="wishlist-grid">
        {items.map((product) => {
          const img = resolveImg(product.images?.[0]) || FALLBACK;
          const discount = product.comparePrice > product.price
            ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;

          return (
            <div key={product._id} className="wishlist-card">
              <Link to={`/product/${product._id}`} className="wishlist-card-img-wrap">
                <img src={img} alt={product.name} className="wishlist-card-img"
                  onError={(e) => { e.target.src = FALLBACK; }} />
                {discount > 0 && <span className="wishlist-badge">-{discount}%</span>}
              </Link>

              <div className="wishlist-card-body">
                <p className="wishlist-cat">{product.category}</p>
                <Link to={`/product/${product._id}`} className="wishlist-name">{product.name}</Link>
                <div className="wishlist-price-row">
                  <span className="wishlist-price">${product.price?.toFixed(2)}</span>
                  {product.comparePrice > product.price && (
                    <span className="wishlist-price-old">${product.comparePrice?.toFixed(2)}</span>
                  )}
                </div>
                <div className="wishlist-card-actions">
                  <button onClick={() => handleAddToCart(product)} className="wishlist-add-btn">
                    <ShoppingCart size={14} /> Add to Cart
                  </button>
                  <button onClick={() => toggle(product)} className="wishlist-remove-btn" title="Remove">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
