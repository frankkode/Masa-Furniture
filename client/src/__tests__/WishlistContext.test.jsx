/**
 * WishlistContext tests
 * Tests the toggle logic and state management
 */
import { render, act, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { WishlistProvider, useWishlist } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';

// ── mock api ──────────────────────────────────────────────────
vi.mock('../services/api', () => ({
  default: {
    get:    vi.fn(),
    post:   vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../services/api';

const mockUser = { id: 1, username: 'testuser', email: 'test@masa.fi' };

function TestConsumer() {
  const { wishlistIds, toggle } = useWishlist();
  return (
    <div>
      <span data-testid="count">{wishlistIds.size}</span>
      <button onClick={() => toggle(42)}>toggle</button>
    </div>
  );
}

function renderWithWishlist(user = mockUser) {
  return render(
    <AuthContext.Provider value={{ user, loading: false }}>
      <WishlistProvider>
        <TestConsumer />
      </WishlistProvider>
    </AuthContext.Provider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('WishlistContext', () => {
  it('starts with empty wishlist', async () => {
    api.get.mockResolvedValue({ data: { items: [] } });
    renderWithWishlist();
    // after async refresh resolves
    await act(async () => {});
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('loads existing wishlist items on mount', async () => {
    api.get.mockResolvedValue({ data: { items: [{ product_id: 42 }, { product_id: 7 }] } });
    renderWithWishlist();
    await act(async () => {});
    expect(screen.getByTestId('count').textContent).toBe('2');
  });

  it('optimistically adds item on toggle', async () => {
    api.get.mockResolvedValue({ data: { items: [] } });
    api.post.mockResolvedValue({});
    renderWithWishlist();
    await act(async () => {});

    await act(async () => {
      screen.getByRole('button', { name: 'toggle' }).click();
    });
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('optimistically removes item when already in wishlist', async () => {
    api.get.mockResolvedValue({ data: { items: [{ product_id: 42 }] } });
    api.delete.mockResolvedValue({});
    renderWithWishlist();
    await act(async () => {});

    expect(screen.getByTestId('count').textContent).toBe('1');
    await act(async () => {
      screen.getByRole('button', { name: 'toggle' }).click();
    });
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('returns false and does nothing when user is null', async () => {
    api.get.mockResolvedValue({ data: { items: [] } });
    renderWithWishlist(null);
    await act(async () => {});
    await act(async () => {
      screen.getByRole('button', { name: 'toggle' }).click();
    });
    expect(api.post).not.toHaveBeenCalled();
    expect(screen.getByTestId('count').textContent).toBe('0');
  });
});
