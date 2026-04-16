import { Routes, Route } from 'react-router-dom';
import { AuthProvider }    from './context/AuthContext';
import { CartProvider }    from './context/CartContext';
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
import NotFoundPage        from './pages/NotFoundPage';
import ProtectedRoute      from './components/layout/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <CartDrawer />
          <main className="flex-1">
            <Routes>
              <Route path="/"              element={<HomePage />} />
              <Route path="/shop"          element={<ShopPage />} />
              <Route path="/shop/:category" element={<ShopPage />} />
              <Route path="/product/:id"   element={<ProductPage />} />
              <Route path="/cart"          element={<CartPage />} />
              <Route path="/login"         element={<LoginPage />} />
              <Route path="/register"      element={<RegisterPage />} />
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
      </CartProvider>
    </AuthProvider>
  );
}
