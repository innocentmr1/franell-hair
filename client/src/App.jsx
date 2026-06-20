import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import OrderList, { OrderDetail } from './pages/OrdersPage';
import WishlistPage from './pages/WishlistPage';
import AdminRoute from './components/admin/AdminRoute';
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminProducts    from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders      from './pages/admin/AdminOrders';
import AdminUsers       from './pages/admin/AdminUsers';
import AdminCategories  from './pages/admin/AdminCategories';
import AdminSettings    from './pages/admin/AdminSettings';
import AdminHeroSlides  from './pages/admin/AdminHeroSlides';
import AdminPromoCodes  from './pages/admin/AdminPromoCodes';
import AdminSaloons     from './pages/admin/AdminSaloons';
import OrderPlacedPage from './pages/OrderPlacedPage';
import AboutPage    from './pages/AboutPage';
import ContactPage  from './pages/ContactPage';
import FAQPage      from './pages/FAQPage';
import ShippingPage from './pages/ShippingPage';
import TopLoader    from './components/ui/TopLoader';
import WhatsAppButton from './components/ui/WhatsAppButton';

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
          <TopLoader />
          <WhatsAppButton />
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/shop" element={<Layout><ShopPage /></Layout>} />
            <Route path="/product/:id" element={<Layout><ProductDetailPage /></Layout>} />
            <Route path="/cart" element={<Layout><CartPage /></Layout>} />
            <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
            <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
            <Route path="/wishlist" element={<Layout><WishlistPage /></Layout>} />
            <Route path="/orders" element={<Layout><OrderList /></Layout>} />
            <Route path="/orders/:id" element={<Layout><OrderDetail /></Layout>} />
            <Route path="/order-placed/:id" element={<Layout><OrderPlacedPage /></Layout>} />
            <Route path="/about"    element={<Layout><AboutPage /></Layout>} />
            <Route path="/contact"  element={<Layout><ContactPage /></Layout>} />
            <Route path="/faq"      element={<Layout><FAQPage /></Layout>} />
            <Route path="/shipping" element={<Layout><ShippingPage /></Layout>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path="/admin/products/new" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
            <Route path="/admin/products/:id/edit" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
            <Route path="/admin/settings"      element={<AdminRoute><AdminSettings /></AdminRoute>} />
            <Route path="/admin/hero-slides"   element={<AdminRoute><AdminHeroSlides /></AdminRoute>} />
            <Route path="/admin/promo-codes"   element={<AdminRoute><AdminPromoCodes /></AdminRoute>} />
            <Route path="/admin/saloons"       element={<AdminRoute><AdminSaloons /></AdminRoute>} />
          </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
