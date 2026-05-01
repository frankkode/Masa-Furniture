/**
 * OrdersTab tests (rendered inside DashboardPage context)
 *
 * – Shows empty state when no orders
 * – Renders order list with order number, date, total
 * – "View items" expands order and fetches details
 * – Shows item name, color, size when present
 * – Shows Review button only for reviewable statuses (not pending/cancelled)
 * – Review button links to /product/:id?tab=reviews
 * – "Hide items" collapses the expanded order
 */
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

vi.mock('../services/api', () => ({
  default: {
    get:   vi.fn(),
    patch: vi.fn(),
    post:  vi.fn(),
  },
}));

import api from '../services/api';

/* ── import just the DashboardPage orders sub-route ── */
import DashboardPage from '../pages/DashboardPage';

const mockUser = { id: 1, username: 'frank', email: 'frank@masa.fi', is_staff: false };

const mockNotifCtx = {
  notifications: [],
  unread: 0,
  markRead: vi.fn(),
  markAllRead: vi.fn(),
  remove: vi.fn(),
  refresh: vi.fn(),
};

function renderOrdersTab() {
  return render(
    <MemoryRouter initialEntries={['/dashboard/orders']}>
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <NotificationContext.Provider value={mockNotifCtx}>
          <Routes>
            <Route path="/dashboard/*" element={<DashboardPage />} />
          </Routes>
        </NotificationContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

const mockOrders = [
  { id: 1, status: 'delivered', total_price: '299.00', created_at: '2026-01-15T10:00:00Z', item_count: 2 },
  { id: 2, status: 'pending',   total_price: '149.50', created_at: '2026-02-01T10:00:00Z', item_count: 1 },
  { id: 3, status: 'cancelled', total_price: '89.00',  created_at: '2026-03-10T10:00:00Z', item_count: 1 },
];

const mockOrderDetail = {
  id: 1,
  status: 'delivered',
  total_price: '299.00',
  items: [
    {
      id: 10,
      product_id: 42,
      name: 'Nordic Chair',
      image_url: '/chair.jpg',
      quantity: 1,
      unit_price: '299.00',
      selected_color: 'Natural Oak',
      selected_size: null,
    },
    {
      id: 11,
      product_id: 55,
      name: 'Side Table',
      image_url: null,
      quantity: 1,
      unit_price: '129.00',
      selected_color: null,
      selected_size: 'M',
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  /* default: list + profile */
  api.get.mockImplementation((url) => {
    if (url === '/orders')           return Promise.resolve({ data: mockOrders });
    if (url === '/orders/1')         return Promise.resolve({ data: mockOrderDetail });
    if (url === '/auth/profile')     return Promise.resolve({ data: { user: mockUser, profile: {} } });
    if (url === '/auth/addresses')   return Promise.resolve({ data: { addresses: [] } });
    if (url === '/wishlist')         return Promise.resolve({ data: { items: [] } });
    if (url === '/notifications')    return Promise.resolve({ data: { notifications: [], unread: 0 } });
    return Promise.resolve({ data: [] });
  });
});

describe('OrdersTab — empty state', () => {
  it('shows "No orders yet" when list is empty', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/orders') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    renderOrdersTab();
    await waitFor(() => expect(screen.getByText(/No orders yet/i)).toBeInTheDocument());
  });
});

describe('OrdersTab — order list', () => {
  it('renders order numbers', async () => {
    renderOrdersTab();
    await waitFor(() => expect(screen.getByText(/#00001/i)).toBeInTheDocument());
    expect(screen.getByText(/#00002/i)).toBeInTheDocument();
  });

  it('shows status badges', async () => {
    renderOrdersTab();
    await waitFor(() => expect(screen.getByText(/delivered/i)).toBeInTheDocument());
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
    expect(screen.getByText(/cancelled/i)).toBeInTheDocument();
  });

  it('renders total prices in euros', async () => {
    renderOrdersTab();
    await waitFor(() => expect(screen.getByText(/€299\.00/i)).toBeInTheDocument());
  });
});

describe('OrdersTab — expand / collapse', () => {
  it('fetches order details and shows item names on expand', async () => {
    renderOrdersTab();
    await waitFor(() => screen.getByText(/#00001/i));

    const viewBtns = screen.getAllByText(/View items/i);
    fireEvent.click(viewBtns[0]); // expand first order

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/orders/1');
      expect(screen.getByText('Nordic Chair')).toBeInTheDocument();
      expect(screen.getByText('Side Table')).toBeInTheDocument();
    });
  });

  it('shows selected color when present', async () => {
    renderOrdersTab();
    await waitFor(() => screen.getByText(/#00001/i));
    fireEvent.click(screen.getAllByText(/View items/i)[0]);
    await waitFor(() => expect(screen.getByText(/Natural Oak/i)).toBeInTheDocument());
  });

  it('shows selected size when present', async () => {
    renderOrdersTab();
    await waitFor(() => screen.getByText(/#00001/i));
    fireEvent.click(screen.getAllByText(/View items/i)[0]);
    await waitFor(() => expect(screen.getByText(/Size: M/i)).toBeInTheDocument());
  });

  it('collapses back when "Hide items" is clicked', async () => {
    renderOrdersTab();
    await waitFor(() => screen.getByText(/#00001/i));
    fireEvent.click(screen.getAllByText(/View items/i)[0]);
    await waitFor(() => screen.getByText('Nordic Chair'));

    fireEvent.click(screen.getByText(/Hide items/i));
    await waitFor(() =>
      expect(screen.queryByText('Nordic Chair')).not.toBeInTheDocument()
    );
  });
});

describe('OrdersTab — Review button', () => {
  it('shows Review button for delivered orders', async () => {
    renderOrdersTab();
    await waitFor(() => screen.getByText(/#00001/i));
    fireEvent.click(screen.getAllByText(/View items/i)[0]); // order 1 = delivered
    await waitFor(() => screen.getByText('Nordic Chair'));
    const reviewBtns = screen.getAllByRole('link', { name: /Review/i });
    expect(reviewBtns.length).toBeGreaterThan(0);
  });

  it('Review button links to product page with ?tab=reviews', async () => {
    renderOrdersTab();
    await waitFor(() => screen.getByText(/#00001/i));
    fireEvent.click(screen.getAllByText(/View items/i)[0]);
    await waitFor(() => screen.getByText('Nordic Chair'));
    const link = screen.getAllByRole('link', { name: /Review/i })[0];
    expect(link.getAttribute('href')).toMatch(/\/product\/42\?tab=reviews/);
  });

  it('does NOT show Review button for pending orders', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/orders') return Promise.resolve({ data: mockOrders });
      if (url === '/orders/2') return Promise.resolve({
        data: {
          id: 2, status: 'pending',
          items: [{ id: 20, product_id: 99, name: 'Pending Item', image_url: null, quantity: 1, unit_price: '149.50', selected_color: null, selected_size: null }],
        },
      });
      return Promise.resolve({ data: [] });
    });

    renderOrdersTab();
    await waitFor(() => screen.getByText(/#00002/i));
    const viewBtns = screen.getAllByText(/View items/i);
    fireEvent.click(viewBtns[1]); // expand order 2 (pending)
    await waitFor(() => screen.getByText('Pending Item'));
    expect(screen.queryByRole('link', { name: /Review/i })).not.toBeInTheDocument();
  });

  it('does NOT show Review button for cancelled orders', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/orders') return Promise.resolve({ data: mockOrders });
      if (url === '/orders/3') return Promise.resolve({
        data: {
          id: 3, status: 'cancelled',
          items: [{ id: 30, product_id: 88, name: 'Cancelled Item', image_url: null, quantity: 1, unit_price: '89.00', selected_color: null, selected_size: null }],
        },
      });
      return Promise.resolve({ data: [] });
    });

    renderOrdersTab();
    await waitFor(() => screen.getByText(/#00003/i));
    const viewBtns = screen.getAllByText(/View items/i);
    fireEvent.click(viewBtns[2]); // expand order 3 (cancelled)
    await waitFor(() => screen.getByText('Cancelled Item'));
    expect(screen.queryByRole('link', { name: /Review/i })).not.toBeInTheDocument();
  });
});
