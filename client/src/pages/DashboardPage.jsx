import { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

/* ── helpers ─────────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_STYLES = {
  pending:        'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed:      'bg-blue-100   text-blue-700   border-blue-200',
  processing:     'bg-blue-100   text-blue-700   border-blue-200',
  shipped:        'bg-indigo-100 text-indigo-700 border-indigo-200',
  delivered:      'bg-green-100  text-green-700  border-green-200',
  payment_failed: 'bg-red-100    text-red-600    border-red-200',
  cancelled:      'bg-gray-100   text-gray-500   border-gray-200',
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full capitalize border
      ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Overview Tab
═══════════════════════════════════════════════════════════════ */
function OverviewTab({ user }) {
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(r => setRecentOrders((r.data || []).slice(0, 3)))
      .catch(() => setRecentOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* welcome */}
      <div className="bg-gradient-to-r from-masa-dark to-[#2d2d44] rounded-2xl p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-masa-accent text-white flex items-center justify-center text-2xl font-bold shrink-0">
          {(user?.username || user?.email || 'U')[0].toUpperCase()}
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-0.5">Welcome back,</p>
          <h2 className="text-xl font-bold text-white">{user?.username || 'Member'}</h2>
          <p className="text-gray-400 text-xs mt-0.5">Member since {formatDate(user?.date_joined)}</p>
        </div>
      </div>

      {/* quick nav cards — mobile-friendly */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/dashboard/orders',   label: 'Orders',   icon: '📦', bg: 'bg-blue-50'   },
          { to: '/dashboard/wishlist', label: 'Wishlist', icon: '❤️', bg: 'bg-red-50'    },
          { to: '/shop',               label: 'Shop',     icon: '🛍️', bg: 'bg-orange-50' },
          { to: '/dashboard/profile',  label: 'Profile',  icon: '👤', bg: 'bg-purple-50' },
        ].map(s => (
          <Link key={s.to} to={s.to}
            className={`${s.bg} rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow text-center`}>
            <span className="text-2xl">{s.icon}</span>
            <span className="text-xs font-semibold text-masa-dark">{s.label}</span>
          </Link>
        ))}
      </div>

      {/* recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-masa-dark">Recent Orders</h3>
          <Link to="/dashboard/orders" className="text-sm text-masa-accent font-medium">View all →</Link>
        </div>
        {loading ? (
          <div className="space-y-2">{[0,1,2].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-masa-border rounded-xl">
            <p className="text-masa-gray text-sm mb-3">No orders yet</p>
            <Link to="/shop" className="btn-primary text-sm">Start Shopping</Link>
          </div>
        ) : (
          <div className="divide-y divide-masa-border border border-masa-border rounded-xl overflow-hidden">
            {recentOrders.map(order => (
              <Link key={order.id} to={`/order/${order.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-masa-light transition-colors">
                <div>
                  <p className="text-sm font-semibold text-masa-dark">#{String(order.id).padStart(5,'0')}</p>
                  <p className="text-xs text-masa-gray">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-bold text-masa-dark">${Number(order.total_price).toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Orders Tab
═══════════════════════════════════════════════════════════════ */
function OrdersTab() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(r => setOrders(r.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-3">{[0,1,2,3].map(i=><div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"/>)}</div>;

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-masa-light flex items-center justify-center">
          <svg className="w-8 h-8 text-masa-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/>
          </svg>
        </div>
        <h3 className="font-bold text-masa-dark text-lg">No orders yet</h3>
        <Link to="/shop" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-masa-dark">Order History</h2>
      {orders.map(order => (
        <div key={order.id} className="border border-masa-border rounded-xl overflow-hidden">
          <div className="bg-masa-light px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-[10px] text-masa-gray uppercase tracking-widest font-semibold">Order</p>
                <p className="text-sm font-bold text-masa-dark">#{String(order.id).padStart(5,'0')}</p>
              </div>
              <div>
                <p className="text-[10px] text-masa-gray uppercase tracking-widest font-semibold">Date</p>
                <p className="text-sm text-masa-dark">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <p className="text-[10px] text-masa-gray uppercase tracking-widest font-semibold">Total</p>
                <p className="text-sm font-bold text-masa-accent">${Number(order.total_price).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={order.status} />
              <Link to={`/order/${order.id}`} className="text-xs font-semibold text-masa-accent hover:underline">Details →</Link>
            </div>
          </div>
          <div className="px-4 py-2.5">
            <p className="text-sm text-masa-gray">{order.item_count || 0} item{order.item_count !== 1 ? 's' : ''}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Wishlist Tab
═══════════════════════════════════════════════════════════════ */
function WishlistTab() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist').then(r => setItems(r.data.items || [])).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  const handleRemove = async id => {
    await api.delete(`/wishlist/${id}`);
    setItems(prev => prev.filter(i => i.product_id !== id));
  };

  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {[0,1,2,3].map(i=><div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse"/>)}
    </div>
  );

  if (items.length === 0) return (
    <div className="text-center py-20 flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-300" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
        </svg>
      </div>
      <h3 className="font-bold text-masa-dark text-lg">Wishlist is empty</h3>
      <Link to="/shop" className="btn-primary">Browse Products</Link>
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-bold text-masa-dark mb-5">My Wishlist ({items.length})</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="relative group">
            <ProductCard product={{ id: item.product_id, name: item.name, price: item.sale_price || item.price, image_url: item.image_url, avg_rating: item.avg_rating || 4 }} />
            <button onClick={() => handleRemove(item.product_id)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center
                         text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Profile Tab
═══════════════════════════════════════════════════════════════ */
function ProfileTab({ user }) {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [profile,    setProfile]    = useState({ username: user?.username || '', phone: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [savingProf, setSavingProf] = useState(false);

  const [pwdForm,  setPwdForm]  = useState({ current: '', next: '', confirm: '' });
  const [pwdMsg,   setPwdMsg]  = useState('');
  const [pwdErr,   setPwdErr]  = useState('');
  const [savingPwd,setSavingPwd]= useState(false);
  const [showPwd,  setShowPwd]  = useState(false);

  const handleSaveProfile = async e => {
    e.preventDefault(); setSavingProf(true); setProfileMsg(''); setProfileErr('');
    try {
      await api.patch('/auth/profile', { username: profile.username.trim(), phone: profile.phone.trim() || undefined });
      setProfileMsg('Profile updated successfully.');
    } catch(err) { setProfileErr(err.response?.data?.error || 'Could not save profile.'); }
    finally { setSavingProf(false); }
  };

  const handleChangePassword = async e => {
    e.preventDefault(); setPwdMsg(''); setPwdErr('');
    if (pwdForm.next !== pwdForm.confirm) { setPwdErr('Passwords do not match.'); return; }
    if (pwdForm.next.length < 6) { setPwdErr('Min 6 characters.'); return; }
    setSavingPwd(true);
    try {
      await api.post('/auth/change-password', { current_password: pwdForm.current, new_password: pwdForm.next });
      setPwdMsg('Password changed.'); setPwdForm({ current: '', next: '', confirm: '' });
    } catch(err) { setPwdErr(err.response?.data?.error || 'Could not change password.'); }
    finally { setSavingPwd(false); }
  };

  return (
    <div className="space-y-8 max-w-lg">
      <h2 className="text-xl font-bold text-masa-dark">Profile Settings</h2>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-masa-accent text-white flex items-center justify-center text-2xl font-bold shrink-0">
          {(user?.username || 'U')[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-masa-dark">{user?.username}</p>
          <p className="text-sm text-masa-gray">{user?.email}</p>
        </div>
      </div>

      {/* profile form */}
      <form onSubmit={handleSaveProfile} className="space-y-4">
        <h3 className="font-bold text-masa-dark border-b border-masa-border pb-2">Personal Info</h3>
        {profileMsg && <div className="text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">{profileMsg}</div>}
        {profileErr && <p className="text-red-500 text-sm">{profileErr}</p>}
        {[
          { label: 'Username', key: 'username', type: 'text',  required: true },
          { label: 'Phone',    key: 'phone',    type: 'tel',   required: false, placeholder: '+250 700 000 000' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-sm font-semibold text-masa-dark mb-1.5">{f.label}</label>
            <input type={f.type} value={profile[f.key]} required={f.required} placeholder={f.placeholder}
              onChange={e => setProfile(p => ({...p, [f.key]: e.target.value}))}
              className="w-full border border-masa-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-masa-accent transition-colors"/>
          </div>
        ))}
        <div>
          <label className="block text-sm font-semibold text-masa-dark mb-1.5">Email</label>
          <input type="email" value={user?.email || ''} disabled
            className="w-full border border-masa-border rounded-xl px-4 py-2.5 text-sm bg-masa-light text-masa-gray cursor-not-allowed"/>
          <p className="text-xs text-masa-gray mt-1">Email cannot be changed</p>
        </div>
        <button type="submit" disabled={savingProf} className="btn-primary py-2.5 px-6 text-sm disabled:opacity-60">
          {savingProf ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      {/* password form */}
      <form onSubmit={handleChangePassword} className="space-y-4">
        <h3 className="font-bold text-masa-dark border-b border-masa-border pb-2">Change Password</h3>
        {pwdMsg && <div className="text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">{pwdMsg}</div>}
        {pwdErr && <p className="text-red-500 text-sm">{pwdErr}</p>}
        {[
          { key: 'current', label: 'Current Password' },
          { key: 'next',    label: 'New Password' },
          { key: 'confirm', label: 'Confirm New Password' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-sm font-semibold text-masa-dark mb-1.5">{f.label}</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={pwdForm[f.key]} required
                onChange={e => setPwdForm(p => ({...p, [f.key]: e.target.value}))}
                className="w-full border border-masa-border rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:border-masa-accent transition-colors"/>
              {f.key === 'current' && (
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-masa-gray hover:text-masa-dark" tabIndex={-1}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d={showPwd
                        ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                        : 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'}/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
        <button type="submit" disabled={savingPwd} className="btn-primary py-2.5 px-6 text-sm disabled:opacity-60">
          {savingPwd ? 'Updating…' : 'Update Password'}
        </button>
      </form>

      {/* sign out */}
      <div className="border border-red-200 rounded-xl p-5">
        <h3 className="font-bold text-red-600 mb-1 text-sm">Sign Out</h3>
        <p className="text-xs text-masa-gray mb-4">You can sign back in anytime.</p>
        <button onClick={() => { logout(); navigate('/'); }}
          className="text-sm font-semibold text-red-500 border border-red-300 px-5 py-2 rounded-full hover:bg-red-50 transition-colors">
          Sign Out
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Admin Tab — staff only
═══════════════════════════════════════════════════════════════ */
const ORDER_STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled'];

function AdminTab() {
  const [stats,    setStats]    = useState(null);
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('');
  const [updating, setUpdating] = useState(null);
  const [search,   setSearch]   = useState('');

  const fetchData = (statusFilter) => {
    setLoading(true);
    const qs = statusFilter ? `?status=${statusFilter}&limit=100` : '?limit=100';
    Promise.all([api.get('/admin/stats'), api.get(`/admin/orders${qs}`)])
      .then(([s, o]) => { setStats(s.data); setOrders(o.data.orders || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(filter); }, [filter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch { alert('Failed to update status'); }
    finally { setUpdating(null); }
  };

  const visible = search.trim()
    ? orders.filter(o =>
        o.username?.toLowerCase().includes(search.toLowerCase()) ||
        o.email?.toLowerCase().includes(search.toLowerCase()) ||
        String(o.id).includes(search))
    : orders;

  return (
    <div className="space-y-6">

      {/* header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-masa-dark">Admin Panel</h2>
          <p className="text-sm text-masa-gray mt-0.5">Manage all orders and monitor store activity</p>
        </div>
        <span className="text-xs bg-masa-accent text-white px-3 py-1.5 rounded-full font-semibold">Staff Access</span>
      </div>

      {/* stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Orders',  value: stats.totalOrders,   icon: '📦', bg: 'bg-blue-50',   text: 'text-blue-700'   },
            { label: 'Pending',       value: stats.pendingOrders, icon: '⏳', bg: 'bg-yellow-50', text: 'text-yellow-700' },
            { label: 'Revenue',       value: `$${Number(stats.totalRevenue).toFixed(0)}`, icon: '💰', bg: 'bg-green-50', text: 'text-green-700' },
            { label: 'Products',      value: stats.totalProducts, icon: '🛋️', bg: 'bg-purple-50', text: 'text-purple-700' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{s.icon}</span>
                <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
              </div>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-masa-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" placeholder="Search by name, email or order #" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-masa-border rounded-xl focus:outline-none focus:border-masa-accent transition-colors"/>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['', ...ORDER_STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 text-xs rounded-full font-medium transition-colors capitalize
                ${filter === s ? 'bg-masa-accent text-white' : 'bg-masa-light text-masa-gray hover:text-masa-dark'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* orders table */}
      {loading ? (
        <div className="space-y-2">{[0,1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
      ) : visible.length === 0 ? (
        <div className="text-center py-14 text-masa-gray text-sm border border-dashed border-masa-border rounded-xl">
          No orders found{filter ? ` with status "${filter}"` : ''}{search ? ` matching "${search}"` : ''}.
        </div>
      ) : (
        <div className="border border-masa-border rounded-xl overflow-hidden">
          {/* desktop header */}
          <div className="hidden md:grid grid-cols-[70px_1fr_110px_90px_150px] gap-3 bg-masa-light px-4 py-3 text-xs font-semibold text-masa-gray uppercase tracking-wider border-b border-masa-border">
            <span>#</span><span>Customer</span><span>Date</span><span>Total</span><span>Status</span>
          </div>

          <div className="divide-y divide-masa-border">
            {visible.map(order => (
              <div key={order.id} className="px-4 py-3">
                {/* desktop row */}
                <div className="hidden md:grid grid-cols-[70px_1fr_110px_90px_150px] gap-3 items-center">
                  <span className="font-bold text-masa-dark text-sm">#{String(order.id).padStart(5,'0')}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-masa-dark truncate">{order.username}</p>
                    <p className="text-xs text-masa-gray truncate">{order.email}</p>
                  </div>
                  <span className="text-xs text-masa-gray">{formatDate(order.created_at)}</span>
                  <span className="text-sm font-semibold text-masa-accent">${Number(order.total_price).toFixed(2)}</span>
                  <select value={order.status} disabled={updating === order.id}
                    onChange={e => handleStatusChange(order.id, e.target.value)}
                    className={`text-xs font-semibold rounded-full px-3 py-1.5 border appearance-none cursor-pointer
                                focus:outline-none focus:ring-2 focus:ring-masa-accent/30
                                ${updating === order.id ? 'opacity-50' : ''}
                                ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                    {ORDER_STATUSES.map(s => (
                      <option key={s} value={s} className="bg-white text-masa-dark capitalize">{s.replace('_',' ')}</option>
                    ))}
                  </select>
                </div>

                {/* mobile card */}
                <div className="md:hidden space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-masa-dark text-sm">#{String(order.id).padStart(5,'0')}</span>
                    <span className="text-sm font-semibold text-masa-accent">${Number(order.total_price).toFixed(2)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-masa-dark">{order.username}</p>
                    <p className="text-xs text-masa-gray">{order.email} · {formatDate(order.created_at)}</p>
                  </div>
                  <select value={order.status} disabled={updating === order.id}
                    onChange={e => handleStatusChange(order.id, e.target.value)}
                    className={`w-full text-xs font-semibold rounded-xl px-3 py-2 border appearance-none cursor-pointer
                                focus:outline-none focus:ring-2 focus:ring-masa-accent/30
                                ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                    {ORDER_STATUSES.map(s => (
                      <option key={s} value={s} className="bg-white text-masa-dark capitalize">{s.replace('_',' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* footer count */}
          <div className="bg-masa-light px-4 py-2.5 border-t border-masa-border text-xs text-masa-gray">
            Showing {visible.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Nav config
═══════════════════════════════════════════════════════════════ */
const BASE_NAV = [
  { to: '/dashboard',          label: 'Overview', end: true,
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
  { to: '/dashboard/orders',   label: 'Orders',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg> },
  { to: '/dashboard/wishlist', label: 'Wishlist',
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/></svg> },
  { to: '/dashboard/profile',  label: 'Profile',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> },
];

const ADMIN_LINK = {
  to: '/dashboard/admin', label: 'Admin',
  icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
};

/* ═══════════════════════════════════════════════════════════════
   DashboardPage layout
═══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user } = useAuth();
  const NAV_LINKS = user?.is_staff ? [...BASE_NAV, ADMIN_LINK] : BASE_NAV;

  const sideClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
     ${isActive ? 'bg-masa-accent/10 text-masa-accent' : 'text-masa-gray hover:bg-masa-light hover:text-masa-dark'}`;

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

      {/* ── mobile: sticky bottom tab bar ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-masa-border
                      flex items-center justify-around px-2 py-1 shadow-lg">
        {NAV_LINKS.map(l => (
          <NavLink key={l.to} to={l.to} end={l.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-[10px] font-medium min-w-0 flex-1 transition-colors
               ${isActive ? 'text-masa-accent' : 'text-masa-gray'}`}>
            <span className={`[&>svg]:w-5 [&>svg]:h-5`}>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* ── page body ── */}
      <div className="container-main py-6 pb-24 lg:pb-8">
        <div className="flex gap-8">

          {/* desktop sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="flex flex-col gap-1 sticky top-24">
              {NAV_LINKS.map(l => (
                <NavLink key={l.to} to={l.to} end={l.end} className={sideClass}>
                  {l.icon}{l.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* main content */}
          <main className="flex-1 min-w-0">
            <Routes>
              <Route index         element={<OverviewTab user={user} />} />
              <Route path="orders"   element={<OrdersTab />} />
              <Route path="wishlist" element={<WishlistTab />} />
              <Route path="profile"  element={<ProfileTab user={user} />} />
              {user?.is_staff && <Route path="admin" element={<AdminTab />} />}
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}
