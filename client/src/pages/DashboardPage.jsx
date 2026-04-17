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
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [expanded,    setExpanded]    = useState({}); // { [orderId]: items[] | 'loading' }

  useEffect(() => {
    api.get('/orders')
      .then(r => setOrders(r.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = async (orderId) => {
    if (expanded[orderId]) {
      setExpanded(prev => { const n = {...prev}; delete n[orderId]; return n; });
      return;
    }
    setExpanded(prev => ({ ...prev, [orderId]: 'loading' }));
    try {
      const res = await api.get(`/orders/${orderId}`);
      setExpanded(prev => ({ ...prev, [orderId]: res.data.items || [] }));
    } catch {
      setExpanded(prev => { const n = {...prev}; delete n[orderId]; return n; });
    }
  };

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

  const canReview = (order) => ['delivered', 'shipped', 'processing', 'confirmed'].includes(order.status);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-masa-dark">Order History</h2>
      {orders.map(order => {
        const items = expanded[order.id];
        const isOpen = !!items;
        return (
          <div key={order.id} className="border border-masa-border rounded-xl overflow-hidden">
            {/* order header */}
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
                  <p className="text-sm font-bold text-masa-accent">€{Number(order.total_price).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={order.status} />
                <button onClick={() => toggleExpand(order.id)}
                  className="text-xs font-semibold text-masa-accent hover:underline flex items-center gap-1">
                  {isOpen ? 'Hide items' : 'View items'}
                  <svg className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* collapsed summary */}
            {!isOpen && (
              <div className="px-4 py-2.5">
                <p className="text-sm text-masa-gray">{order.item_count || 0} item{order.item_count !== 1 ? 's' : ''}</p>
              </div>
            )}

            {/* expanded items */}
            {isOpen && (
              <div className="px-4 py-3 space-y-3">
                {items === 'loading' ? (
                  <div className="space-y-2">{[0,1,2].map(i=><div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
                ) : items.length === 0 ? (
                  <p className="text-sm text-masa-gray py-2">No items found.</p>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 text-sm py-2 border-b border-masa-border last:border-0">
                      {/* thumbnail */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-masa-light shrink-0">
                        {item.image_url
                          ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover"/>
                          : <div className="w-full h-full flex items-center justify-center text-lg">🛋️</div>
                        }
                      </div>
                      {/* info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-masa-dark truncate">{item.name}</p>
                        <div className="flex items-center gap-3 text-xs text-masa-gray mt-0.5">
                          <span>Qty: {item.quantity}</span>
                          <span>€{Number(item.unit_price).toFixed(2)}</span>
                          {item.selected_color && <span>Color: {item.selected_color}</span>}
                          {item.selected_size  && <span>Size: {item.selected_size}</span>}
                        </div>
                      </div>
                      {/* review link */}
                      {canReview(order) && (
                        <Link
                          to={`/product/${item.product_id}?tab=reviews`}
                          className="shrink-0 text-xs font-semibold text-white bg-masa-accent hover:bg-masa-accent/90
                                     px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                          </svg>
                          Review
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
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
const EMPTY_ADDR = { full_name: '', phone: '', street: '', city: '', state: '', country: 'Finland', postal_code: '', is_default: false };

function AddressForm({ initial = EMPTY_ADDR, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const f = key => e => setForm(p => ({ ...p, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-3 bg-masa-light rounded-xl p-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { key:'full_name',   label:'Full Name',      col:2, required:true },
          { key:'phone',       label:'Phone',           col:1 },
          { key:'street',      label:'Street',          col:2, required:true },
          { key:'city',        label:'City',            col:1, required:true },
          { key:'state',       label:'State / Region',  col:1 },
          { key:'postal_code', label:'Postal Code',     col:1 },
          { key:'country',     label:'Country',         col:1, required:true },
        ].map(field => (
          <div key={field.key} className={field.col===2 ? 'col-span-2' : ''}>
            <label className="text-xs font-semibold text-masa-dark block mb-1">{field.label}</label>
            <input type="text" required={field.required} value={form[field.key]||''}
              onChange={f(field.key)}
              className="w-full border border-masa-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-masa-accent"/>
          </div>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm text-masa-dark cursor-pointer">
        <input type="checkbox" checked={!!form.is_default} onChange={f('is_default')} className="accent-masa-accent"/>
        Set as default address
      </label>
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving} className="btn-primary py-2 px-5 text-sm disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Address'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline py-2 px-5 text-sm">Cancel</button>
      </div>
    </form>
  );
}

function ProfileTab({ user }) {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [profile,      setProfile]      = useState({ username: user?.username || '', phone: '', avatar_url: '' });
  const [profileMsg,   setProfileMsg]   = useState('');
  const [profileErr,   setProfileErr]   = useState('');
  const [savingProf,   setSavingProf]   = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // load phone + avatar_url from server on mount
  useEffect(() => {
    api.get('/auth/profile')
      .then(r => setProfile({
        username:   r.data.user?.username   || user?.username || '',
        phone:      r.data.profile?.phone   || '',
        avatar_url: r.data.profile?.avatar_url || '',
      }))
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveProfile = async e => {
    e.preventDefault(); setSavingProf(true); setProfileMsg(''); setProfileErr('');
    try {
      await api.patch('/auth/profile', {
        username:   profile.username.trim(),
        phone:      profile.phone.trim() || undefined,
        avatar_url: profile.avatar_url   || undefined,
      });
      setProfileMsg('Profile updated successfully.');
    } catch(err) { setProfileErr(err.response?.data?.error || 'Could not save profile.'); }
    finally { setSavingProf(false); }
  };

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setProfileErr('Please select an image.'); return; }
    if (file.size > 5 * 1024 * 1024)    { setProfileErr('Image must be under 5 MB.');  return; }
    setAvatarUploading(true); setProfileErr('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/admin/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data.url;
      setProfile(p => ({ ...p, avatar_url: url }));
      await api.patch('/auth/profile', { avatar_url: url });
    } catch { setProfileErr('Avatar upload failed. Try again.'); }
    finally { setAvatarUploading(false); }
  };

  // ── password ────────────────────────────────────────────────
  const [pwdForm,  setPwdForm]  = useState({ current: '', next: '', confirm: '' });
  const [pwdMsg,   setPwdMsg]   = useState('');
  const [pwdErr,   setPwdErr]   = useState('');
  const [savingPwd,setSavingPwd]= useState(false);
  const [showPwd,  setShowPwd]  = useState(false);

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

  // ── addresses ───────────────────────────────────────────────
  const [addresses,    setAddresses]    = useState([]);
  const [addrLoading,  setAddrLoading]  = useState(true);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddr,  setEditingAddr]  = useState(null);
  const [savingAddr,   setSavingAddr]   = useState(false);
  const [addrMsg,      setAddrMsg]      = useState('');

  const loadAddresses = () => {
    setAddrLoading(true);
    api.get('/auth/addresses')
      .then(r => setAddresses(r.data.addresses || []))
      .catch(() => setAddresses([]))
      .finally(() => setAddrLoading(false));
  };
  useEffect(() => { loadAddresses(); }, []);

  const handleSaveAddr = async (form) => {
    setSavingAddr(true); setAddrMsg('');
    try {
      if (editingAddr) {
        await api.patch(`/auth/addresses/${editingAddr.id}`, form);
        setAddrMsg('Address updated.');
      } else {
        await api.post('/auth/addresses', form);
        setAddrMsg('Address saved.');
      }
      setShowAddrForm(false); setEditingAddr(null);
      loadAddresses();
    } catch(err) { setAddrMsg(err.response?.data?.error || 'Could not save address.'); }
    finally { setSavingAddr(false); }
  };

  const handleDeleteAddr = async id => {
    if (!window.confirm('Delete this address?')) return;
    await api.delete(`/auth/addresses/${id}`).catch(() => {});
    setAddrMsg('Address deleted.');
    loadAddresses();
  };

  const handleSetDefault = async id => {
    await api.post(`/auth/addresses/${id}/set-default`).catch(() => {});
    loadAddresses();
  };

  return (
    <div className="space-y-8 max-w-lg">
      <h2 className="text-xl font-bold text-masa-dark">Profile Settings</h2>

      {/* avatar row */}
      <div className="flex items-center gap-5">
        {/* avatar circle — click to upload */}
        <label className="relative cursor-pointer group shrink-0">
          <div className="w-20 h-20 rounded-full bg-masa-accent text-white flex items-center justify-center text-2xl font-bold overflow-hidden border-2 border-masa-border">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }}/>
              : <span>{(user?.username || 'U')[0].toUpperCase()}</span>
            }
          </div>
          {/* hover overlay */}
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {avatarUploading
              ? <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              : <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
            }
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} disabled={avatarUploading}/>
        </label>

        <div>
          <p className="font-semibold text-masa-dark">{profile.username || user?.username}</p>
          <p className="text-sm text-masa-gray">{user?.email}</p>
          <p className="text-xs text-masa-gray mt-0.5">Click photo to change avatar</p>
          {user?.is_staff && (
            <span className="text-xs bg-masa-accent text-white px-2 py-0.5 rounded-full mt-1 inline-block">Admin</span>
          )}
        </div>
      </div>

      {/* personal info form */}
      <form onSubmit={handleSaveProfile} className="space-y-4">
        <h3 className="font-bold text-masa-dark border-b border-masa-border pb-2">Personal Info</h3>
        {profileMsg && <div className="text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">{profileMsg}</div>}
        {profileErr && <p className="text-red-500 text-sm">{profileErr}</p>}
        <div>
          <label className="block text-sm font-semibold text-masa-dark mb-1.5">Username</label>
          <input type="text" value={profile.username} required
            onChange={e => setProfile(p => ({ ...p, username: e.target.value }))}
            className="w-full border border-masa-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-masa-accent transition-colors"/>
        </div>
        <div>
          <label className="block text-sm font-semibold text-masa-dark mb-1.5">Phone</label>
          <input type="tel" value={profile.phone} placeholder="+358 40 000 0000"
            onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
            className="w-full border border-masa-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-masa-accent transition-colors"/>
        </div>
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

      {/* saved addresses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-masa-border pb-2">
          <h3 className="font-bold text-masa-dark">Saved Addresses</h3>
          <button onClick={() => { setEditingAddr(null); setShowAddrForm(v => !v); }}
            className="text-sm text-masa-accent font-medium hover:underline">
            {showAddrForm ? '✕ Cancel' : '+ Add New'}
          </button>
        </div>
        {addrMsg && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">{addrMsg}</div>
        )}
        {showAddrForm && !editingAddr && (
          <AddressForm initial={EMPTY_ADDR} onSave={handleSaveAddr} onCancel={() => setShowAddrForm(false)} saving={savingAddr} />
        )}
        {addrLoading ? (
          <div className="space-y-2">{[0,1].map(i=><div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
        ) : addresses.length === 0 ? (
          <p className="text-sm text-masa-gray py-6 text-center border border-dashed border-masa-border rounded-xl">
            No saved addresses yet. Add one to speed up checkout.
          </p>
        ) : (
          <div className="space-y-3">
            {addresses.map(addr => (
              <div key={addr.id}>
                {editingAddr?.id === addr.id ? (
                  <AddressForm initial={editingAddr} onSave={handleSaveAddr}
                    onCancel={() => setEditingAddr(null)} saving={savingAddr} />
                ) : (
                  <div className={`border rounded-xl p-4 ${addr.is_default ? 'border-masa-accent bg-orange-50' : 'border-masa-border'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm space-y-0.5">
                        <p className="font-semibold text-masa-dark">{addr.full_name}</p>
                        {addr.phone && <p className="text-masa-gray">{addr.phone}</p>}
                        <p className="text-masa-gray">{addr.street}, {addr.city}</p>
                        <p className="text-masa-gray">{[addr.state, addr.country, addr.postal_code].filter(Boolean).join(', ')}</p>
                        {addr.is_default ? <span className="text-xs font-semibold text-masa-accent">✓ Default</span> : null}
                      </div>
                      <div className="flex flex-col gap-1 shrink-0 text-right">
                        <button onClick={() => { setEditingAddr(addr); setShowAddrForm(false); }}
                          className="text-xs text-blue-600 hover:underline">Edit</button>
                        {!addr.is_default && (
                          <button onClick={() => handleSetDefault(addr.id)}
                            className="text-xs text-masa-accent hover:underline">Set default</button>
                        )}
                        <button onClick={() => handleDeleteAddr(addr.id)}
                          className="text-xs text-red-500 hover:underline">Delete</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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

/* ── blank product for the add form ─────────────────────── */
const EMPTY_PRODUCT = {
  name: '', slug: '', sku: '', category_id: '', price: '',
  sale_price: '', description: '', stock: '0', material: '',
  dimensions: '', color: '', weight: '', image_url: '',
  is_active: true, is_featured: false,
};

/* ── ImageUploadField ─────────────────────────────────────
   Lets admin pick a local file (uploaded to /api/admin/upload)
   or fall back to pasting a URL.
   In production, the server swaps disk storage for Vercel Blob;
   the returned URL just changes — this component stays the same.
──────────────────────────────────────────────────────────── */
function ImageUploadField({ value, onChange }) {
  const [tab,        setTab]        = useState('upload'); // 'upload' | 'url'
  const [uploading,  setUploading]  = useState(false);
  const [uploadErr,  setUploadErr]  = useState('');
  const [dragging,   setDragging]   = useState(false);
  const fileRef = useState(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUploadErr('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024)    { setUploadErr('Image must be under 5 MB.');    return; }
    setUploadErr('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/admin/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.url);
    } catch (e) {
      setUploadErr(e.response?.data?.error || 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const onInputChange = (e) => handleFile(e.target.files[0]);
  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div>
      {/* tab switcher */}
      <div className="flex items-center gap-1 mb-2">
        <span className="text-xs font-semibold text-masa-dark mr-2">Primary Image</span>
        {[['upload','📁 Upload file'],['url','🔗 Paste URL']].map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors
              ${tab === id ? 'bg-masa-accent text-white' : 'bg-masa-light text-masa-gray hover:text-masa-dark'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'upload' ? (
        <label
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center gap-2 w-full py-6 border-2 border-dashed
            rounded-xl cursor-pointer transition-colors
            ${dragging ? 'border-masa-accent bg-masa-accent/5' : 'border-masa-border hover:border-masa-accent hover:bg-masa-light'}`}>
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <svg className="w-6 h-6 animate-spin text-masa-accent" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <span className="text-xs text-masa-gray">Uploading…</span>
            </div>
          ) : (
            <>
              <svg className="w-8 h-8 text-masa-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p className="text-xs text-masa-gray text-center">
                Drag & drop an image here, or <span className="text-masa-accent font-semibold">click to browse</span>
              </p>
              <p className="text-xs text-gray-400">JPEG, PNG, WebP, GIF — max 5 MB</p>
            </>
          )}
          <input ref={fileRef[0]} type="file" accept="image/*" className="hidden" onChange={onInputChange}/>
        </label>
      ) : (
        <input
          className="w-full px-3 py-2 text-sm border border-masa-border rounded-xl focus:outline-none focus:border-masa-accent transition-colors"
          value={value} onChange={e => onChange(e.target.value)}
          placeholder="/products/chair.jpg or https://…"/>
      )}

      {uploadErr && (
        <p className="mt-1.5 text-xs text-red-600">{uploadErr}</p>
      )}

      {/* preview */}
      {value && (
        <div className="mt-2 flex items-center gap-3">
          <img src={value} alt="preview"
            onError={e => e.target.style.display='none'}
            className="h-20 w-20 object-cover rounded-xl border border-masa-border"/>
          <div className="min-w-0">
            <p className="text-xs text-masa-gray truncate">{value}</p>
            <button type="button" onClick={() => onChange('')}
              className="mt-1 text-xs text-red-500 hover:text-red-700 font-medium">
              Remove image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── ProductModal ─────────────────────────────────────────
   Used for both "Add" and "Edit" actions.
──────────────────────────────────────────────────────────── */
function ProductModal({ initial, categories, onSave, onCancel, saving }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_PRODUCT,
    ...initial,
    is_active:   initial?.is_active  ?? true,
    is_featured: initial?.is_featured ?? false,
    image_url:   initial?.image_url  ?? '',
  }));
  const [error, setError] = useState('');

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  // auto-generate slug from name (only when slug is empty / unchanged)
  const handleName = (val) => {
    set('name', val);
    if (!form.slug || form.slug === form.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')) {
      set('slug', val.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.sku || !form.category_id || form.price === '') {
      setError('Name, SKU, Category and Price are required.'); return;
    }
    try {
      await onSave({
        ...form,
        price:       parseFloat(form.price),
        sale_price:  form.sale_price ? parseFloat(form.sale_price) : null,
        stock:       parseInt(form.stock) || 0,
        weight:      form.weight ? parseFloat(form.weight) : null,
        is_active:   form.is_active  ? 1 : 0,
        is_featured: form.is_featured ? 1 : 0,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product.');
    }
  };

  const inp = 'w-full px-3 py-2 text-sm border border-masa-border rounded-xl focus:outline-none focus:border-masa-accent transition-colors';
  const lbl = 'block text-xs font-semibold text-masa-dark mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-masa-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-bold text-masa-dark">
            {initial?.id ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button onClick={onCancel} className="p-2 hover:bg-masa-light rounded-full transition-colors">
            <svg className="w-5 h-5 text-masa-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          {/* name — full width */}
          <div>
            <label className={lbl}>Product Name *</label>
            <input className={inp} value={form.name} onChange={e => handleName(e.target.value)} placeholder="e.g. Scandinavian Lounge Chair"/>
          </div>

          {/* slug */}
          <div>
            <label className={lbl}>URL Slug</label>
            <input className={inp} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-generated from name"/>
          </div>

          {/* sku + category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>SKU *</label>
              <input className={inp} value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="e.g. CHAIR-001"/>
            </div>
            <div>
              <label className={lbl}>Category *</label>
              <select className={inp} value={form.category_id} onChange={e => set('category_id', e.target.value)}>
                <option value="">Select category…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* price + sale price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Price (€) *</label>
              <input type="number" min="0" step="0.01" className={inp} value={form.price} onChange={e => set('price', e.target.value)} placeholder="299.00"/>
            </div>
            <div>
              <label className={lbl}>Sale Price (€)</label>
              <input type="number" min="0" step="0.01" className={inp} value={form.sale_price} onChange={e => set('sale_price', e.target.value)} placeholder="optional"/>
            </div>
          </div>

          {/* stock + color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Stock</label>
              <input type="number" min="0" className={inp} value={form.stock} onChange={e => set('stock', e.target.value)}/>
            </div>
            <div>
              <label className={lbl}>Color</label>
              <input className={inp} value={form.color} onChange={e => set('color', e.target.value)} placeholder="e.g. Oak / White"/>
            </div>
          </div>

          {/* material + dimensions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Material</label>
              <input className={inp} value={form.material} onChange={e => set('material', e.target.value)} placeholder="e.g. Solid oak"/>
            </div>
            <div>
              <label className={lbl}>Dimensions</label>
              <input className={inp} value={form.dimensions} onChange={e => set('dimensions', e.target.value)} placeholder="e.g. 80×85×75 cm"/>
            </div>
          </div>

          {/* image — upload or URL */}
          <ImageUploadField
            value={form.image_url}
            onChange={url => set('image_url', url)}
          />

          {/* description */}
          <div>
            <label className={lbl}>Description</label>
            <textarea rows={3} className={`${inp} resize-none`} value={form.description}
              onChange={e => set('description', e.target.value)} placeholder="Short product description…"/>
          </div>

          {/* toggles */}
          <div className="flex items-center gap-6">
            {[
              { field: 'is_active',   label: 'Active (visible in shop)' },
              { field: 'is_featured', label: 'Featured on homepage'     },
            ].map(({ field, label }) => (
              <label key={field} className="flex items-center gap-2 cursor-pointer select-none">
                <button type="button" onClick={() => set(field, !form[field])}
                  className={`w-10 h-6 rounded-full transition-colors relative ${form[field] ? 'bg-masa-accent' : 'bg-gray-200'}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form[field] ? 'left-5' : 'left-1'}`}/>
                </button>
                <span className="text-sm text-masa-dark">{label}</span>
              </label>
            ))}
          </div>

          {/* actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-masa-border text-sm font-semibold text-masa-dark hover:bg-masa-light transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-masa-accent text-white text-sm font-semibold hover:bg-masa-accent/90 transition-colors disabled:opacity-60">
              {saving ? 'Saving…' : (initial?.id ? 'Save Changes' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── AdminProductsPanel ───────────────────────────────────── */
function AdminProductsPanel() {
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [modal,       setModal]       = useState(null); // null | 'add' | product-object
  const [saving,      setSaving]      = useState(false);
  const [deleteId,    setDeleteId]    = useState(null);

  const load = () => {
    setLoading(true);
    const qs = search ? `?search=${encodeURIComponent(search)}&limit=100` : '?limit=100';
    Promise.all([api.get(`/admin/products${qs}`), api.get('/admin/categories')])
      .then(([p, c]) => { setProducts(p.data.products || []); setCategories(c.data.categories || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);            // initial load
  useEffect(() => { load(); }, [search]);      // search

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (modal?.id) {
        const res = await api.patch(`/admin/products/${modal.id}`, data);
        setProducts(prev => prev.map(p => p.id === modal.id ? { ...p, ...res.data.product } : p));
      } else {
        const res = await api.post('/admin/products', data);
        setProducts(prev => [{ ...res.data.product, category_name: categories.find(c=>c.id==data.category_id)?.name, image_url: data.image_url||null }, ...prev]);
      }
      setModal(null);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    setDeleteId(id);
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch { alert('Failed to delete product.'); }
    finally { setDeleteId(null); }
  };

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-masa-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" placeholder="Search by name, SKU or category…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-masa-border rounded-xl focus:outline-none focus:border-masa-accent transition-colors"/>
        </div>
        <button onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2 bg-masa-accent text-white text-sm font-semibold rounded-xl hover:bg-masa-accent/90 transition-colors shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          Add Product
        </button>
      </div>

      {/* table */}
      {loading ? (
        <div className="space-y-2">{[0,1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-14 text-masa-gray text-sm border border-dashed border-masa-border rounded-xl">
          {search ? `No products matching "${search}".` : 'No products yet. Add your first one!'}
        </div>
      ) : (
        <div className="border border-masa-border rounded-xl overflow-hidden">
          {/* header — desktop */}
          <div className="hidden md:grid grid-cols-[56px_1fr_110px_90px_70px_80px_100px] gap-3 bg-masa-light px-4 py-3 text-xs font-semibold text-masa-gray uppercase tracking-wider border-b border-masa-border">
            <span></span>
            <span>Product</span>
            <span>Category</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          <div className="divide-y divide-masa-border">
            {products.map(p => (
              <div key={p.id} className="px-4 py-3">
                {/* desktop row */}
                <div className="hidden md:grid grid-cols-[56px_1fr_110px_90px_70px_80px_100px] gap-3 items-center">
                  {/* thumb */}
                  <div className="w-12 h-12 rounded-lg bg-masa-light overflow-hidden shrink-0">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover"/>
                      : <div className="w-full h-full flex items-center justify-center text-masa-gray text-xl">🛋️</div>
                    }
                  </div>
                  {/* name + sku */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-masa-dark truncate">{p.name}</p>
                    <p className="text-xs text-masa-gray truncate">SKU: {p.sku}</p>
                  </div>
                  <span className="text-xs text-masa-gray truncate">{p.category_name || '—'}</span>
                  <div>
                    {p.sale_price
                      ? <><span className="text-sm font-bold text-masa-accent">€{Number(p.sale_price).toFixed(0)}</span>
                          <span className="text-xs text-masa-gray line-through ml-1">€{Number(p.price).toFixed(0)}</span></>
                      : <span className="text-sm font-semibold text-masa-dark">€{Number(p.price).toFixed(0)}</span>
                    }
                  </div>
                  <span className={`text-xs font-semibold ${p.stock < 5 ? 'text-red-600' : 'text-masa-dark'}`}>{p.stock}</span>
                  <div className="flex flex-col gap-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit
                      ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.is_active ? 'Active' : 'Hidden'}
                    </span>
                    {p.is_featured ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit bg-yellow-100 text-yellow-700">Featured</span> : null}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setModal({ ...p, image_url: p.image_url || '' })}
                      className="p-1.5 rounded-lg hover:bg-masa-light transition-colors text-masa-gray hover:text-masa-accent" title="Edit">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(p.id)} disabled={deleteId === p.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-masa-gray hover:text-red-600 disabled:opacity-40" title="Delete">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* mobile card */}
                <div className="md:hidden flex gap-3">
                  <div className="w-14 h-14 rounded-xl bg-masa-light overflow-hidden shrink-0">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover"/>
                      : <div className="w-full h-full flex items-center justify-center text-2xl">🛋️</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-masa-dark truncate">{p.name}</p>
                        <p className="text-xs text-masa-gray">SKU: {p.sku} · {p.category_name}</p>
                      </div>
                      <span className="text-sm font-bold text-masa-accent shrink-0">€{Number(p.sale_price || p.price).toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                        ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.is_active ? 'Active' : 'Hidden'}
                      </span>
                      <span className="text-xs text-masa-gray">Stock: {p.stock}</span>
                      <div className="ml-auto flex gap-2">
                        <button onClick={() => setModal({ ...p, image_url: p.image_url || '' })}
                          className="p-1.5 rounded-lg bg-masa-light text-masa-gray hover:text-masa-accent transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(p.id)} disabled={deleteId === p.id}
                          className="p-1.5 rounded-lg bg-masa-light text-masa-gray hover:text-red-600 transition-colors disabled:opacity-40">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-masa-light px-4 py-2.5 border-t border-masa-border text-xs text-masa-gray">
            {products.length} product{products.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* modal */}
      {modal && (
        <ProductModal
          initial={modal === 'add' ? null : modal}
          categories={categories}
          onSave={handleSave}
          onCancel={() => setModal(null)}
          saving={saving}
        />
      )}
    </div>
  );
}

/* ── ShippingSettingsPanel ────────────────────────────────── */
function ShippingSettingsPanel() {
  const [form,    setForm]    = useState({ shipping_fee: '', free_shipping_threshold: '' });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState('');
  const [err,     setErr]     = useState('');

  useEffect(() => {
    api.get('/admin/shipping-settings')
      .then(r => setForm({
        shipping_fee:            String(r.data.shipping_fee),
        free_shipping_threshold: String(r.data.free_shipping_threshold),
      }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true); setMsg(''); setErr('');
    try {
      await api.patch('/admin/shipping-settings', {
        shipping_fee:            parseFloat(form.shipping_fee),
        free_shipping_threshold: parseFloat(form.free_shipping_threshold),
      });
      setMsg('Shipping settings saved.');
    } catch { setErr('Failed to save settings.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="h-24 bg-gray-100 rounded-xl animate-pulse"/>;

  return (
    <div className="max-w-sm">
      <h3 className="font-bold text-masa-dark mb-4">Shipping Settings</h3>
      {msg && <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">{msg}</div>}
      {err && <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{err}</div>}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-masa-dark mb-1.5">
            Shipping Fee (€)
          </label>
          <input type="number" min="0" step="0.01" required value={form.shipping_fee}
            onChange={e => setForm(p => ({ ...p, shipping_fee: e.target.value }))}
            className="w-full border border-masa-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-masa-accent transition-colors"/>
          <p className="text-xs text-masa-gray mt-1">Charged when order total is below the free threshold.</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-masa-dark mb-1.5">
            Free Shipping Threshold (€)
          </label>
          <input type="number" min="0" step="0.01" required value={form.free_shipping_threshold}
            onChange={e => setForm(p => ({ ...p, free_shipping_threshold: e.target.value }))}
            className="w-full border border-masa-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-masa-accent transition-colors"/>
          <p className="text-xs text-masa-gray mt-1">Orders at or above this amount get free shipping.</p>
        </div>
        <button type="submit" disabled={saving}
          className="btn-primary py-2.5 px-6 text-sm disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

/* ── AdminTab (Orders + Products + Settings tabs) ────────── */
function AdminTab() {
  const [activeTab, setActiveTab] = useState('orders');
  const [stats,     setStats]     = useState(null);
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('');
  const [updating,  setUpdating]  = useState(null);
  const [search,    setSearch]    = useState('');

  const fetchOrders = (statusFilter) => {
    setLoading(true);
    const qs = statusFilter ? `?status=${statusFilter}&limit=100` : '?limit=100';
    Promise.all([api.get('/admin/stats'), api.get(`/admin/orders${qs}`)])
      .then(([s, o]) => { setStats(s.data); setOrders(o.data.orders || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(filter); }, [filter]);

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
          <p className="text-sm text-masa-gray mt-0.5">Manage orders and products</p>
        </div>
        <span className="text-xs bg-masa-accent text-white px-3 py-1.5 rounded-full font-semibold">Staff Access</span>
      </div>

      {/* stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Orders',  value: stats.totalOrders,   icon: '📦', bg: 'bg-blue-50',   text: 'text-blue-700'   },
            { label: 'Pending',       value: stats.pendingOrders, icon: '⏳', bg: 'bg-yellow-50', text: 'text-yellow-700' },
            { label: 'Revenue',       value: `€${Number(stats.totalRevenue).toFixed(0)}`, icon: '💰', bg: 'bg-green-50', text: 'text-green-700' },
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

      {/* sub-tab switcher */}
      <div className="flex gap-1 bg-masa-light p-1 rounded-xl w-fit flex-wrap">
        {[
          { id: 'orders',   label: 'Orders',   icon: '📦' },
          { id: 'products', label: 'Products', icon: '🛋️' },
          { id: 'settings', label: 'Settings', icon: '⚙️' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${activeTab === t.id ? 'bg-white shadow text-masa-dark' : 'text-masa-gray hover:text-masa-dark'}`}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── Orders panel ── */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* search + filter */}
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

          {loading ? (
            <div className="space-y-2">{[0,1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
          ) : visible.length === 0 ? (
            <div className="text-center py-14 text-masa-gray text-sm border border-dashed border-masa-border rounded-xl">
              No orders found{filter ? ` with status "${filter}"` : ''}{search ? ` matching "${search}"` : ''}.
            </div>
          ) : (
            <div className="border border-masa-border rounded-xl overflow-hidden">
              <div className="hidden md:grid grid-cols-[70px_1fr_110px_90px_150px] gap-3 bg-masa-light px-4 py-3 text-xs font-semibold text-masa-gray uppercase tracking-wider border-b border-masa-border">
                <span>#</span><span>Customer</span><span>Date</span><span>Total</span><span>Status</span>
              </div>
              <div className="divide-y divide-masa-border">
                {visible.map(order => (
                  <div key={order.id} className="px-4 py-3">
                    <div className="hidden md:grid grid-cols-[70px_1fr_110px_90px_150px] gap-3 items-center">
                      <span className="font-bold text-masa-dark text-sm">#{String(order.id).padStart(5,'0')}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-masa-dark truncate">{order.username}</p>
                        <p className="text-xs text-masa-gray truncate">{order.email}</p>
                      </div>
                      <span className="text-xs text-masa-gray">{formatDate(order.created_at)}</span>
                      <span className="text-sm font-semibold text-masa-accent">€{Number(order.total_price).toFixed(2)}</span>
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
                    <div className="md:hidden space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-masa-dark text-sm">#{String(order.id).padStart(5,'0')}</span>
                        <span className="text-sm font-semibold text-masa-accent">€{Number(order.total_price).toFixed(2)}</span>
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
              <div className="bg-masa-light px-4 py-2.5 border-t border-masa-border text-xs text-masa-gray">
                Showing {visible.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Products panel ── */}
      {activeTab === 'products' && <AdminProductsPanel />}

      {/* ── Settings panel ── */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <ShippingSettingsPanel />
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
