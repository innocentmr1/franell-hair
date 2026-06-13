import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => JSON.parse(localStorage.getItem('franellCart') || '[]'));

  useEffect(() => {
    localStorage.setItem('franellCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1, length = '', color = '') => {
    const key = `${product._id}-${length}-${color}`;
    setCartItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => i.key === key ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, {
        key,
        product: product._id,
        name: product.name,
        image: product.images?.[0] || '',
        price: product.price,
        qty,
        length,
        color,
        stock: product.stock,
      }];
    });
  };

  const updateQty = (key, qty) => {
    if (qty <= 0) return removeFromCart(key);
    setCartItems((prev) => prev.map((i) => i.key === key ? { ...i, qty } : i));
  };

  const removeFromCart = (key) => {
    setCartItems((prev) => prev.filter((i) => i.key !== key));
  };

  const clearCart = () => setCartItems([]);

  const totalItems = cartItems.reduce((acc, i) => acc + i.qty, 0);
  const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQty, removeFromCart, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
