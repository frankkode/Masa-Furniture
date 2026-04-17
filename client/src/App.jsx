import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth }       from './context/AuthContext';
import { CartProvider }                from './context/CartContext';
import { WishlistProvider }            from './context/WishlistContext';
import Navbar              from './components/layout/Navbar';
import Footer              from './components/layout/Footer';
import CartDrawer          from './components/layout/CartDrawer';
import HomePage            from './pages/HomePage';
import ShopPage            from './pages/ShopPage';
import ProductPage         from './pages/ProductPage';
import CartPage            from './pages/CartPage';
import CheckoutPage        from './pages/CheckoutPage';
import OrderConfirmPage    from './pages/OrderConfirmPage';
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import DashboardPage       from './pages/DashboardPage';
import AboutPage           from './pages/AboutPage';
import ContactPage         from './pages/ContactPage';
import NotFoundPage        from './pages/NotFoundPage';
import ProtectedRoute      from './components/layout/ProtectedRoute';

/* ── AppShell: inside providers so it can read AuthContext ── */
function AppShell() {
  const { loading } = useAuth();

  // Show spinner while the stored JWT is being verified in the background.
  // Because user state is seeded from localStorage instantly, the navbar
  // already shows the correct logged-in state — only protected route
  // redirects need to wait for this check.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 rounded-full border-4 border-masa-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />
      <main className="flex-1 pt-16">
        <Routes>
          <Route path="/"               element={<HomePage />} />
          <Route path="/shop"           element={<ShopPage />} />
          <Route path="/shop/:category" element={<ShopPage />} />
          <Route path="/product/:id"    element={<ProductPage />} />
          <Route path="/cart"           element={<CartPage />} />
          <Route path="/login"          element={<LoginPage />} />
          <Route path="/register"       element={<RegisterPage />} />
          <Route path="/about"          element={<AboutPage />} />
          <Route path="/contact"        element={<ContactPage />} />
          <Route path="/checkout" element={
            <ProtectedRoute><CheckoutPage /></ProtectedRoute>
          } />
          <Route path="/order/:id" element={
            <ProtectedRoute><OrderConfirmPage /></ProtectedRoute>
          } />
          <Route path="/dashboard/*" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AppShell />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
