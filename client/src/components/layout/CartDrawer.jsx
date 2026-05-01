import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
  const { items, total, itemCount, isOpen, setIsOpen, removeItem, updateQty, loading } = useCart();

  // lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-masa-border">
          <h2 className="text-lg font-semibold text-masa-dark">
            Shopping Cart
            {itemCount > 0 && (
              <span className="ml-2 text-sm font-normal text-masa-gray">({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
            )}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-masa-gray hover:text-masa-dark transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <svg className="w-16 h-16 text-masa-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.6 8H19M7 13L5.4 5M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              <p className="text-masa-gray">Your cart is empty</p>
              <button
                onClick={() => setIsOpen(false)}
                className="btn-outline text-sm px-5 py-2"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-5">
              {items.map(item => (
                <li key={item.id} className="flex gap-4">
                  {/* Product image */}
                  <Link to={`/product/${item.product_id}`} onClick={() => setIsOpen(false)}
                        className="w-20 h-20 rounded-lg overflow-hidden bg-masa-light shrink-0 block">
                    <img
                      src={item.image_url || '/chairs1.png'}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={e => { e.target.src = '/chairs1.png'; }}
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-masa-dark truncate">{item.name}</p>
                    <p className="text-sm text-masa-accent font-semibold mt-1">
                      ${(item.sale_price || item.price).toFixed(2)}
                    </p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        disabled={loading}
                        className="w-7 h-7 rounded border border-masa-border flex items-center justify-center text-masa-gray hover:border-masa-accent hover:text-masa-accent transition-colors disabled:opacity-50"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        disabled={loading || item.quantity >= item.stock}
                        className="w-7 h-7 rounded border border-masa-border flex items-center justify-center text-masa-gray hover:border-masa-accent hover:text-masa-accent transition-colors disabled:opacity-50"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="self-start text-masa-gray hover:text-red-500 transition-colors p-1"
                    aria-label={`Remove ${item.name}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer / checkout */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-masa-border">
            {/* Subtotal */}
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-masa-gray">Subtotal</span>
              <span className="text-sm font-semibold text-masa-dark">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-masa-gray">Shipping calculated at checkout</span>
            </div>

            {/* Buttons */}
            <Link
              to="/checkout"
              onClick={() => setIsOpen(false)}
              className="btn-primary w-full text-center block text-sm py-3 mb-3"
            >
              Checkout
            </Link>
            <Link
              to="/cart"
              onClick={() => setIsOpen(false)}
              className="btn-outline w-full text-center block text-sm py-3"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
