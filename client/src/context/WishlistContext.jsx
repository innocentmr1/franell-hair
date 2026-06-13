import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('franellWishlist') || '[]'));

  useEffect(() => {
    localStorage.setItem('franellWishlist', JSON.stringify(items));
  }, [items]);

  const toggle = (product) => {
    setItems((prev) => {
      const exists = prev.find((p) => p._id === product._id);
      if (exists) {
        toast('Removed from wishlist', { icon: '💔' });
        return prev.filter((p) => p._id !== product._id);
      }
      toast.success('Added to wishlist!', { icon: '❤️' });
      return [...prev, { _id: product._id, name: product.name, price: product.price, images: product.images, category: product.category, comparePrice: product.comparePrice, rating: product.rating, numReviews: product.numReviews, isNewArrival: product.isNewArrival, hairType: product.hairType }];
    });
  };

  const isWishlisted = (id) => items.some((p) => p._id === id);

  return (
    <WishlistContext.Provider value={{ items, toggle, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
