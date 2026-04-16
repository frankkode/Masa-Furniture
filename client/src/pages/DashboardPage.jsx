import { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

/* ════════════════════════════════════════════════════════════════
   Shared helpers
════════════════════════════════════════════════════════════════ */
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

const STATUS_STYLES = {
  pending:        'bg-yellow-100 text-yellow-700',
  confirmed:      'bg-blue-100 text-blue-700',
  processing:     'bg-blue-100 text-blue-700',
  shipped:        'bg-indigo-100 text-indigo-700',
  delivered:      'bg-green-100 text-green-700',
  payment_failed: 'bg-red-100 text-red-600',
  cancelled:      'bg-gray-100 text-gray-500',
};

/* ════════════════════════════════════════════════════════════════
   Tab: Overview
════════════════════════════════════════════════════════════════ */
function OverviewTab({ user }) {
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(r => setRecentOrders((r.data || []).slice(0, 3)))
      .catch(() => setRecentOrders([]))
      .finally(() => setLoadingOrders(false));
  }, []);

  const initial = (user?.username || user?.email || 'U')[0].toUpperCase();
  const memberSince = formatDate(user?.date_joined);

  return (
    <div className="space-y-8">
      {/* welcome card */}
      <div className="bg-gradient-to-r from-masa-dark to-[#2d2d44] rounded-2xl p-7 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-masa-accent text-white flex items-center justify-center
                        text-2xl font-bold shrink-0">
          {initial}
        </div>
        <div>
          <p className="text-gray-400 text-sm mb-0.5">Welcome back,</p>
          <h2 className="text-2xl font-bold text-white">{user?.username || 'Member'}</h2>
          <p className="text-gray-400 text-xs mt-1">Member since {memberSince}</p>
        </div>
      </div>

      {/* stat cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Orders',    value: recentOrders.length > 0 ? '—' : '0', icon: '📦' },
          { label: 'Wishlist Items',  value: '—',  icon: '❤️' },
          { label: 'Loyalty Points',  value: '—',  icon: '⭐' },
        ].map(s => (
          <div key={s.label} className="bg-masa-light rounded-xl p-5 flex items-center gap-4">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-bold text-masa-dark">{s.value}</p>
              <p className="text-xs text-masa-gray">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-masa-dark text-lg">Recent Orders</h3>
          <Link to="/dashboard/orders" className="text-sm text-masa-accent hover:underline font-medium">
            View all →
          </Link>
        </div>

        {loadingOrders ? (
          <div className="space-y-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-masa-border rounded-xl">
            <p className="text-masa-gray text-sm mb-3">No orders yet</p>
            <Link to="/shop" className="btn-primary text-sm">Start Shopping</Link>
          </div>
        ) : (
          <div className="divide-y divide-masa-border border border-masa-border rounded-xl overflow-hidden">
            {recentOrders.map(order => (
              <Link
                key={order.id}
                to={`/order/${order.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-masa-light transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-masa-dark">
                    #{String(order.id).padStart(6, '0')}
                  </p>
                  <p className="text-xs text-masa-gray">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize
                    ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-500'}`}>
                    {order.status?.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-bold text-masa-dark">
                    ${Number(order.total_price).toFixed(2)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/dashboard/wishlist"
          className="flex items-center gap-4 p-5 rounded-xl border border-masa-border hover:border-masa-accent hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-400 group-hover:bg-red-100">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-masa-dark text-sm">My Wishlist</p>
            <p className="text-xs text-masa-gray">Saved items for later</p>
          </div>
          <svg className="w-4 h-4 text-masa-gray ml-auto group-hover:text-masa-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          to="/dashboard/profile"
          className="flex items-center gap-4 p-5 rounded-xl border border-masa-border hover:border-masa-accent hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-400 group-hover:bg-blue-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-masa-dark text-sm">Profile Settings</p>
            <p className="text-xs text-masa-gray">Edit your details</p>
          </div>
          <svg className="w-4 h-4 text-masa-gray ml-auto group-hover:text-masa-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Tab: Orders
════════════════════════════════════════════════════════════════ */
function OrdersTab() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(r => setOrders(r.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-masa-light flex items-center justify-center">
          <svg className="w-8 h-8 text-masa-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
          </svg>
        </div>
        <h3 className="font-bold text-masa-dark text-lg">No orders yet</h3>
        <p className="text-masa-gray text-sm">When you place an order it will appear here.</p>
        <Link to="/shop" className="btn-primary mt-2">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-masa-dark mb-6">Order History</h2>
      {orders.map(order => (
        <div key={order.id} className="border border-masa-border rounded-xl overflow-hidden">
          {/* order header */}
          <div className="bg-masa-light px-5 py-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <p className="text-xs text-masa-gray uppercase tracking-widest font-semibold">Order</p>
                <p className="text-sm font-bold text-masa-dark">#{String(order.id).padStart(6, '0')}</p>
              </div>
              <div>
                <p className="text-xs text-masa-gray uppercase tracking-widest font-semibold">Date</p>
                <p className="text-sm font-medium text-masa-dark">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-masa-gray uppercase tracking-widest font-semibold">Total</p>
                <p className="text-sm font-bold text-masa-accent">${Number(order.total_price).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize
                ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-500'}`}>
                {order.status?.replace('_', ' ')}
              </span>
              <Link
                to={`/order/${order.id}`}
                className="text-xs font-semibold text-masa-accent hover:underline"
              >
                View Details
              </Link>
            </div>
          </div>
          {/* item count */}
          <div className="px-5 py-3">
            <p className="text-sm text-masa-gray">
              {order.item_count || 0} item{order.item_count !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Tab: Wishlist
════════════════════════════════════════════════════════════════ */
function WishlistTab() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = () => {
    api.get('/wishlist')
      .then(r => setItems(r.data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = async productId => {
    await api.delete(`/wishlist/${productId}`);
    setItems(prev => prev.filter(i => i.product_id !== productId));
  };

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="card overflow-hidden animate-pulse">
            <div className="bg-gray-200 aspect-[4/3]" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="font-bold text-masa-dark text-lg">Your wishlist is empty</h3>
        <p className="text-masa-gray text-sm">Save items you love and come back to them anytime.</p>
        <Link to="/shop" className="btn-primary mt-2">Browse Products</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-masa-dark mb-6">
        My Wishlist ({items.length} item{items.length !== 1 ? 's' : ''})
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map(item => (
          <div key={item.id} className="relative group">
            <ProductCard
              product={{
                id:         item.product_id,
                name:       item.name,
                price:      item.sale_price || item.price,
                image_url:  item.image_url,
                avg_rating: item.avg_rating || 4,
                review_count: item.review_count || 0,
              }}
            />
            {/* remove from wishlist */}
            <button
              onClick={() => handleRemove(item.product_id)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center
                         justify-center text-red-400 hover:text-red-600 hover:scale-110 transition-all
                         opacity-0 group-hover:opacity-100"
              title="Remove from wishlist"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Tab: Profile Settings
════════════════════════════════════════════════════════════════ */
function ProfileTab({ user }) {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  /* profile form */
  const [profile,     setProfile]     = useState({ username: user?.username || '', phone: '' });
  const [profileMsg,  setProfileMsg]  = useState('');
  const [profileErr,  setProfileErr]  = useState('');
  const [savingProf,  setSavingProf]  = useState(false);

  /* password form */
  const [pwdForm,  setPwdForm]  = useState({ current: '', next: '', confirm: '' });
  const [pwdMsg,   setPwdMsg]   = useState('');
  const [pwdErr,   setPwdErr]   = useState('');
  const [savingPwd, setSavingPwd] = useState(false);
  const [showPwd,   setShowPwd] = useState(false);

  const setP = key => e => setProfile(f => ({ ...f, [key]: e.target.value }));
  const setPwd = key => e => setPwdForm(f => ({ ...f, [key]: e.target.value }));

  const handleSaveProfile = async e => {
    e.preventDefault();
    setSavingProf(true);
    setProfileMsg('');
    setProfileErr('');
    try {
      await api.patch('/auth/profile', {
        username:   profile.username.trim(),
        phone:      profile.phone.trim() || undefined,
      });
      setProfileMsg('Profile updated successfully.');
    } catch (err) {
      setProfileErr(err.response?.data?.error || 'Could not save profile.');
    } finally {
      setSavingProf(false);
    }
  };

  const handleChangePassword = async e => {
    e.preventDefault();
    setPwdMsg('');
    setPwdErr('');
    if (pwdForm.next !== pwdForm.confirm) { setPwdErr('New passwords do not match.'); return; }
    if (pwdForm.next.length < 6) { setPwdErr('New password must be at least 6 characters.'); return; }
    setSavingPwd(true);
    try {
      await api.post('/auth/change-password', {
        current_password: pwdForm.current,
        new_password:     pwdForm.next,
      });
      setPwdMsg('Password changed successfully.');
      setPwdForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwdErr(err.response?.data?.error || 'Could not change password.');
    } finally {
      setSavingPwd(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initial = (user?.username || user?.email || 'U')[0].toUpperCase();

  return (
    <div className="space-y-8 max-w-xl">
      <h2 className="text-xl font-bold text-masa-dark">Profile Settings</h2>

      {/* avatar */}
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-masa-accent text-white flex items-center justify-center
                        text-3xl font-bold">
          {initial}
        </div>
        <div>
          <p className="font-semibold text-masa-dark">{user?.username}</p>
          <p className="text-sm text-masa-gray">{user?.email}</p>
          <p className="text-xs text-masa-gray mt-0.5">
            Member since {formatDate(user?.date_joined)}
          </p>
        </div>
      </div>

      {/* profile form */}
      <form onSubmit={handleSaveProfile} className="space-y-4">
        <h3 className="font-bold text-masa-dark border-b border-masa-border pb-2">Personal Info</h3>
        {profileMsg && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {profileMsg}
          </div>
        )}
        {profileErr && (
          <p className="text-red-500 text-sm">{profileErr}</p>
        )}
        <div>
          <label className="block text-sm font-semibold text-masa-dark mb-1.5">Username</label>
          <input
            type="text"
            value={profile.username}
            onChange={setP('username')}
            required
            minLength={3}
            className="w-full border border-masa-border rounded-xl px-4 py-2.5 text-sm text-masa-dark
                       focus:outline-none focus:border-masa-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-masa-dark mb-1.5">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full border border-masa-border rounded-xl px-4 py-2.5 text-sm text-masa-gray
                       bg-masa-light cursor-not-allowed"
          />
          <p className="text-xs text-masa-gray mt-1">Email cannot be changed</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-masa-dark mb-1.5">Phone (optional)</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={setP('phone')}
            placeholder="+250 700 000 000"
            className="w-full border border-masa-border rounded-xl px-4 py-2.5 text-sm text-masa-dark
                       focus:outline-none focus:border-masa-accent transition-colors placeholder-gray-400"
          />
        </div>
        <button
          type="submit"
          disabled={savingProf}
          className="btn-primary py-2.5 px-6 text-sm disabled:opacity-60"
        >
          {savingProf ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      {/* change password */}
      <form onSubmit={handleChangePassword} className="space-y-4">
        <h3 className="font-bold text-masa-dark border-b border-masa-border pb-2">Change Password</h3>
        {pwdMsg && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {pwdMsg}
          </div>
        )}
        {pwdErr && <p className="text-red-500 text-sm">{pwdErr}</p>}

        {[
          { key: 'current', label: 'Current Password', auto: 'current-password' },
          { key: 'next',    label: 'New Password',     auto: 'new-password' },
          { key: 'confirm', label: 'Confirm New Password', auto: 'new-password' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-sm font-semibold text-masa-dark mb-1.5">{f.label}</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                autoComplete={f.auto}
                value={pwdForm[f.key]}
                onChange={setPwd(f.key)}
                required
                className="w-full border border-masa-border rounded-xl px-4 py-2.5 pr-11 text-sm text-masa-dark
                           focus:outline-none focus:border-masa-accent transition-colors"
              />
              {f.key === 'current' && (
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-masa-gray hover:text-masa-dark"
                  tabIndex={-1}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d={showPwd
                        ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                        : 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'}
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={savingPwd}
          className="btn-primary py-2.5 px-6 text-sm disabled:opacity-60"
        >
          {savingPwd ? 'Updating…' : 'Update Password'}
        </button>
      </form>

      {/* danger zone */}
      <div className="border border-red-200 rounded-xl p-5">
        <h3 className="font-bold text-red-600 mb-2 text-sm">Danger Zone</h3>
        <p className="text-xs text-masa-gray mb-4">
          Signing out will clear your session. You can sign back in anytime.
        </p>
        <button
          onClick={handleLogout}
          className="text-sm font-semibold text-red-500 border border-red-300 px-5 py-2
                     rounded-full hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   DashboardPage — layout + sub-routing
════════════════════════════════════════════════════════════════ */
const NAV_LINKS = [
  { to: '/dashboard',          label: 'Overview',  end: true,
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { to: '/dashboard/orders',   label: 'Orders',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg> },
  { to: '/dashboard/wishlist', label: 'Wishlist',
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg> },
  { to: '/dashboard/profile',  label: 'Profile',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
];

export default function DashboardPage() {
  const { user }        = useAuth();
  const [mobileNav, setMobileNav] = useState(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
     ${isActive
       ? 'bg-masa-accent/10 text-masa-accent'
       : 'text-masa-gray hover:bg-masa-light hover:text-masa-dark'}`;

  return (
    <div className="bg-white min-h-screen">
      {/* breadcrumb */}
      <div className="border-b border-masa-border bg-masa-light py-3">
        <nav className="container-main text-sm text-masa-gray flex items-center gap-1.5">
          <Link to="/" className="hover:text-masa-accent">Home</Link>
          <span>/</span>
          <span className="text-masa-dark font-medium">Dashboard</span>
        </nav>
      </div>

      <div className="container-main py-8">
        <div className="flex gap-8">

          {/* ── sidebar nav (desktop) ── */}
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="flex flex-col gap-1 sticky top-24">
              {NAV_LINKS.map(l => (
                <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                  {l.icon}
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* ── mobile: horizontal tab bar ── */}
          <div className="lg:hidden w-full mb-6 -mt-2">
            <div className="flex gap-1 overflow-x-auto pb-1">
              {NAV_LINKS.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                     ${isActive
                       ? 'bg-masa-accent text-white'
                       : 'bg-masa-light text-masa-gray hover:text-masa-dark'}`}
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* ── main content ── */}
          <main className="flex-1 min-w-0">
            <Routes>
              <Route index           element={<OverviewTab user={user} />} />
              <Route path="orders"   element={<OrdersTab />} />
              <Route path="wishlist" element={<WishlistTab />} />
              <Route path="profile"  element={<ProfileTab user={user} />} />
            </Routes>
          </main>

        </div>
      </div>
    </div>
  );
}
