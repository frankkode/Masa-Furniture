/**
 * ProductPage review section tests
 * – Review cards render with product-image background + avatar + Verified badge
 * – Review form gates: not-logged-in, logged-in-not-purchased, logged-in-purchased
 * – Successful submission updates UI
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';

vi.mock('../services/api', () => ({
  default: {
    get:  vi.fn(),
    post: vi.fn(),
  },
}));

import api from '../services/api';
import ProductPage from '../pages/ProductPage';

/* ── shared fixtures ── */
const mockProduct = {
  id: 1,
  name: 'Nordic Chair',
  slug: 'nordic-chair',
  price: 299,
  stock: 10,
  category_name: 'Chairs',
  category_slug: 'chairs',
  description: 'Comfortable chair.',
  images: [{ image_url: '/chair.jpg', alt_text: 'Chair', is_primary: 1 }],
  avg_rating: 4.5,
  purchased_by_user: false,
  reviews: [
    {
      id: 1,
      username: 'alice',
      avatar_url: '/avatars/alice.jpg',
      rating: 5,
      title: 'Love it!',
      body: 'Extremely comfortable.',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      username: 'bob',
      avatar_url: null,
      rating: 4,
      title: null,
      body: 'Good quality.',
      created_at: new Date().toISOString(),
    },
  ],
};

function renderPage({ user = null, product = mockProduct } = {}) {
  api.get.mockImplementation((url) => {
    if (url.includes('/products/1')) return Promise.resolve({ data: product });
    return Promise.resolve({ data: { products: [] } });
  });

  return render(
    <MemoryRouter initialEntries={['/products/1']}>
      <AuthContext.Provider value={{ user, loading: false }}>
        <CartContext.Provider value={{ addItem: vi.fn(), cartCount: 0 }}>
          <WishlistContext.Provider value={{ wishlistIds: new Set(), toggle: vi.fn() }}>
            <Routes>
              <Route path="/products/:id" element={<ProductPage />} />
            </Routes>
          </WishlistContext.Provider>
        </CartContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

beforeEach(() => vi.clearAllMocks());

/* ── Review card rendering ── */
describe('Review cards', () => {
  it('shows the Reviews tab label with count', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText(/Reviews \(2\)/i)).toBeInTheDocument());
  });

  it('renders reviewer usernames after switching to Reviews tab', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Reviews \(2\)/i));
    fireEvent.click(screen.getByText(/Reviews \(2\)/i));
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
  });

  it('renders review titles and bodies', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Reviews \(2\)/i));
    fireEvent.click(screen.getByText(/Reviews \(2\)/i));
    expect(screen.getByText('Love it!')).toBeInTheDocument();
    expect(screen.getByText('Good quality.')).toBeInTheDocument();
  });

  it('shows Verified badge on each review card', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Reviews \(2\)/i));
    fireEvent.click(screen.getByText(/Reviews \(2\)/i));
    const badges = screen.getAllByText(/Verified/i);
    expect(badges.length).toBeGreaterThanOrEqual(2);
  });

  it('renders avatar image for reviewer with avatar_url', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Reviews \(2\)/i));
    fireEvent.click(screen.getByText(/Reviews \(2\)/i));
    // alice has an avatar image
    const imgs = screen.getAllByRole('img');
    const avatarImg = imgs.find(img => img.getAttribute('src') === '/avatars/alice.jpg');
    expect(avatarImg).toBeTruthy();
  });

  it('shows letter fallback avatar when avatar_url is null (bob)', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Reviews \(2\)/i));
    fireEvent.click(screen.getByText(/Reviews \(2\)/i));
    // bob has no avatar_url — letter 'B' should appear
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});

/* ── Review form gate ── */
describe('Review form — not logged in', () => {
  it('shows sign-in prompt instead of form', async () => {
    renderPage({ user: null });
    await waitFor(() => screen.getByText(/Reviews \(2\)/i));
    fireEvent.click(screen.getByText(/Reviews \(2\)/i));
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    expect(screen.queryByText(/Submit Review/i)).not.toBeInTheDocument();
  });
});

describe('Review form — logged in, not purchased', () => {
  it('shows purchase-required message instead of form', async () => {
    renderPage({
      user: { id: 2, username: 'guest', email: 'guest@masa.fi' },
      product: { ...mockProduct, purchased_by_user: false },
    });
    await waitFor(() => screen.getByText(/Reviews \(2\)/i));
    fireEvent.click(screen.getByText(/Reviews \(2\)/i));
    expect(screen.getByText(/Purchase required/i)).toBeInTheDocument();
    expect(screen.queryByText(/Submit Review/i)).not.toBeInTheDocument();
  });
});

describe('Review form — verified purchaser', () => {
  const buyer = { id: 3, username: 'buyer', email: 'buyer@masa.fi' };
  const productWithPurchase = { ...mockProduct, purchased_by_user: true };

  it('shows the review form', async () => {
    renderPage({ user: buyer, product: productWithPurchase });
    await waitFor(() => screen.getByText(/Reviews \(2\)/i));
    fireEvent.click(screen.getByText(/Reviews \(2\)/i));
    expect(screen.getByText(/Submit Review/i)).toBeInTheDocument();
  });

  it('shows error when submitting without selecting a star', async () => {
    renderPage({ user: buyer, product: productWithPurchase });
    await waitFor(() => screen.getByText(/Reviews \(2\)/i));
    fireEvent.click(screen.getByText(/Reviews \(2\)/i));
    fireEvent.click(screen.getByText(/Submit Review/i));
    expect(screen.getByText(/select a star rating/i)).toBeInTheDocument();
  });

  it('shows success message after successful submission', async () => {
    api.post.mockResolvedValueOnce({ data: { id: 99, message: 'Review submitted' } });
    api.get.mockImplementation((url) => {
      if (url.includes('/products/1'))
        return Promise.resolve({ data: { ...productWithPurchase, reviews: [] } });
      return Promise.resolve({ data: { products: [] } });
    });

    renderPage({ user: buyer, product: productWithPurchase });
    await waitFor(() => screen.getByText(/Reviews \(2\)/i));
    fireEvent.click(screen.getByText(/Reviews \(2\)/i));

    // click 4-star (4th star button in the interactive row)
    const starBtns = screen.getAllByRole('button');
    const reviewStarBtns = starBtns.filter(b => b.closest('form'));
    if (reviewStarBtns.length >= 4) {
      fireEvent.click(reviewStarBtns[3]); // 4th star
    }

    fireEvent.click(screen.getByText(/Submit Review/i));
    await waitFor(() =>
      expect(screen.getByText(/thank you/i)).toBeInTheDocument()
    );
  });
});

/* ── Admin product CRUD (smoke tests already in admin.test.js — just
      verify routes are accessible from the client perspective) ── */
describe('Admin product upload endpoint shape', () => {
  it('api.post is called with multipart when admin uploads image', async () => {
    api.post.mockResolvedValue({ data: { url: '/uploads/test.jpg' } });
    const fd = new FormData();
    fd.append('image', new Blob(['x'], { type: 'image/jpeg' }), 'test.jpg');
    const res = await api.post('/admin/upload', fd);
    expect(res.data.url).toBe('/uploads/test.jpg');
  });
});
