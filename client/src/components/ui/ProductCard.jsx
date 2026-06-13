import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { resolveImg } from '../../assets/images';
import toast from 'react-hot-toast';

const GOLD  = '#C9A84C';
const EMPTY = '#e5e7eb';

const HAIR_IMG = {
  'Body Wave':  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&h=580&fit=crop&q=80',
  'Straight':   'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=500&h=580&fit=crop&q=80',
  'Deep Wave':  'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500&h=580&fit=crop&q=80',
  'Water Wave': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&h=580&fit=crop&q=80',
  'Kinky Curly':'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=500&h=580&fit=crop&q=80',
  'Jerry Curly':'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&h=580&fit=crop&q=80',
  'Loose Wave': 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=580&fit=crop&q=80',
};

const CAT_IMG = {
  'Wigs':       'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&h=580&fit=crop&q=80',
  'Bundles':    'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=500&h=580&fit=crop&q=80',
  'Closures':   'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=580&fit=crop&q=80',
  'Frontals':   'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500&h=580&fit=crop&q=80',
  'Extensions': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&h=580&fit=crop&q=80',
  'Accessories':'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=580&fit=crop&q=80',
};

function resolveImage(product) {
  const raw = product.images?.[0];
  const resolved = raw ? resolveImg(raw) : null;
  if (resolved && !resolved.includes('placehold.co')) return resolved;
  return HAIR_IMG[product.hairType] || CAT_IMG[product.category]
    || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&h=580&fit=crop&q=80';
}

export default function ProductCard({ product }) {
  const { addToCart }              = useCart();
  const { toggle, isWishlisted }   = useWishlist();
  const wishlisted                 = isWishlisted(product._id);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    toast.success('Added to cart!');
  };

  const discount = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const image = resolveImage(product);

  return (
    <Link to={`/product/${product._id}`} className="product-card">

      <div className="product-card-img-wrap">
        <img
          src={image}
          alt={product.name}
          className="product-card-img"
          onError={(e) => { e.target.src = 'https://placehold.co/400x440/1a1a1a/C9A84C?text=Hair'; }}
        />

        <div className="product-badges">
          {discount > 0 && <span className="badge badge-discount">-{discount}%</span>}
          {product.isNewArrival && <span className="badge badge-new">NEW</span>}
        </div>

        <button
          onClick={(e) => { e.preventDefault(); toggle(product); }}
          className={`product-wishlist ${wishlisted ? 'active' : ''}`}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={13} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        <div className="product-quick-add">
          <button onClick={handleQuickAdd} className="product-quick-add-btn">
            <ShoppingCart size={12} /> Quick Add
          </button>
        </div>
      </div>

      <div className="product-card-body">
        <p className="product-cat-label">{product.category}</p>
        <h3 className="product-name">{product.name}</h3>

        {product.numReviews > 0 && (
          <div className="product-stars">
            <div className="stars-row">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} size={10}
                  style={{ fill: i <= Math.round(product.rating) ? GOLD : EMPTY,
                           color: i <= Math.round(product.rating) ? GOLD : EMPTY }} />
              ))}
            </div>
            <span className="review-count">({product.numReviews})</span>
          </div>
        )}

        <div className="product-price-row">
          <span className="product-price">${product.price?.toFixed(2)}</span>
          {product.comparePrice > product.price && (
            <span className="product-price-compare">${product.comparePrice?.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
