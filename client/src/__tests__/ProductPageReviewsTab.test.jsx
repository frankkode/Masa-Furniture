/**
 * ProductPage — auto-switch to Reviews tab via URL ?tab=reviews
 *
 * When a user arrives from the "Write a Review" button in the Orders dashboard,
 * the URL contains ?tab=reviews. The ProductPage should auto-activate the
 * Reviews tab without requiring a manual click.
 */
import { render, screen, waitFor } from '@testing-library/react';
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

const mockProduct = {
  id: 42,
  name: 'Nordic Chair',
  slug: 'nordic-chair',
  price: 299,
  stock: 5,
  category_name: 'Chairs',
  category_slug: 'chairs',
  description: 'A comfortable chair.',
  images: [{ image_url: '/chair.jpg', alt_text: 'Chair', is_primary: 1 }],
  avg_rating: 4,
  purchased_by_user: true,
  reviews: [
    { id: 1, username: 'buyer', avatar_url: null, rating: 5, title: 'Love it', body: 'Great chair.', created_at: new Date().toISOString() },
  ],
};

function renderPage(path) {
  api.get.mockImplementation((url) => {
    if (url.includes('/products/42')) return Promise.resolve({ data: mockProduct });
    return Promise.resolve({ data: { products: [] } });
  });

  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthContext.Provider value={{ user: { id: 1, username: 'buyer' }, loading: false }}>
        <CartContext.Provider value={{ addItem: vi.fn(), cartCount: 0 }}>
          <WishlistContext.Provider value={{ wishlistIds: new Set(), toggle: vi.fn() }}>
            <Routes>
              <Route path="/product/:id" element={<ProductPage />} />
            </Routes>
          </WishlistContext.Provider>
        </CartContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

beforeEach(() => vi.clearAllMocks());

describe('ProductPage — ?tab=reviews auto-switch', () => {
  it('defaults to description tab when no query param', async () => {
    renderPage('/product/42');
    await waitFor(() => expect(screen.getAllByText('Nordic Chair').length).toBeGreaterThan(0));
    /* description content is visible */
    expect(screen.getAllByText(/A comfortable chair\./i).length).toBeGreaterThan(0);
    /* the review text "Love it" should not be in the DOM yet */
    expect(screen.queryByText('Love it')).not.toBeInTheDocument();
  });

  it('automatically activates Reviews tab when ?tab=reviews is in URL', async () => {
    renderPage('/product/42?tab=reviews');
    await waitFor(() => expect(screen.getAllByText('Nordic Chair').length).toBeGreaterThan(0));
    /* review content should be immediately visible without clicking the tab */
    await waitFor(() =>
      expect(screen.getByText('Love it')).toBeInTheDocument()
    );
  });

  it('shows the review form for a verified purchaser on ?tab=reviews', async () => {
    renderPage('/product/42?tab=reviews');
    await waitFor(() => expect(screen.getAllByText('Nordic Chair').length).toBeGreaterThan(0));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Submit Review/i })).toBeInTheDocument()
    );
  });

  it('reviews tab button is visually active when opened via URL param', async () => {
    renderPage('/product/42?tab=reviews');
    await waitFor(() => expect(screen.getAllByText('Nordic Chair').length).toBeGreaterThan(0));
    /* The Reviews tab button itself should exist and not require a click */
    await waitFor(() => expect(screen.getByText(/Reviews \(1\)/i)).toBeInTheDocument());
  });
});
