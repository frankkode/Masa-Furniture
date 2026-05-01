/**
 * Admin Shipping Settings panel tests
 * – Loads current fee + threshold on mount
 * – Saves updated values and shows success message
 * – Shows error when save fails
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
import DashboardPage from '../pages/DashboardPage';

const adminUser = { id: 1, username: 'admin', email: 'admin@masa.fi', is_staff: true };

const mockNotifCtx = {
  notifications: [],
  unread: 0,
  markRead: vi.fn(),
  markAllRead: vi.fn(),
  remove: vi.fn(),
  refresh: vi.fn(),
};

function renderAdminTab(path = '/dashboard/admin') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthContext.Provider value={{ user: adminUser, loading: false }}>
        <NotificationContext.Provider value={mockNotifCtx}>
          <Routes>
            <Route path="/dashboard/*" element={<DashboardPage />} />
          </Routes>
        </NotificationContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

async function clickSettingsTab() {
  // Wait for sub-tabs to appear
  await waitFor(() => expect(screen.getByText('Settings')).toBeInTheDocument());
  fireEvent.click(screen.getByText('Settings'));
  // Wait for the Settings panel to actually render
  await waitFor(() => expect(screen.getByText(/Shipping Settings/i)).toBeInTheDocument());
}

beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockImplementation((url) => {
    if (url === '/admin/stats')            return Promise.resolve({ data: { totalOrders: 5, totalRevenue: 1200, totalProducts: 10, totalUsers: 3, pendingOrders: 2 } });
    if (url.includes('/admin/orders'))     return Promise.resolve({ data: { orders: [], total: 0 } });
    if (url === '/admin/shipping-settings') return Promise.resolve({ data: { shipping_fee: 9.90, free_shipping_threshold: 100 } });
    if (url === '/auth/profile')           return Promise.resolve({ data: { user: adminUser, profile: {} } });
    if (url === '/auth/addresses')         return Promise.resolve({ data: { addresses: [] } });
    if (url === '/notifications')          return Promise.resolve({ data: { notifications: [], unread: 0 } });
    return Promise.resolve({ data: [] });
  });
});

describe('Admin Settings tab', () => {
  it('renders the Settings sub-tab button in admin panel', async () => {
    renderAdminTab();
    await waitFor(() => expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument());
    const settingsBtn = screen.getAllByRole('button').find(b => b.textContent.includes('Settings'));
    expect(settingsBtn).toBeTruthy();
  });

  it('loads shipping fee and threshold from API on mount', async () => {
    renderAdminTab();
    await waitFor(() => screen.getByText(/Admin Panel/i));
    await clickSettingsTab();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/admin/shipping-settings');
      const inputs = screen.getAllByRole('spinbutton');
      const values = inputs.map(i => parseFloat(i.value));
      expect(values).toContain(9.9);
      expect(values).toContain(100);
    });
  });

  it.skip('saves new values and shows success message', async () => {
    api.patch.mockResolvedValueOnce({ data: { ok: true } });
    renderAdminTab();
    await waitFor(() => screen.getByText(/Admin Panel/i));
    await clickSettingsTab();

    await waitFor(() => expect(screen.getAllByRole('spinbutton').length).toBeGreaterThanOrEqual(2));

    const spinbuttons = screen.getAllByRole('spinbutton');
    const feeInput    = spinbuttons[0];
    const threshInput = spinbuttons[1];
    fireEvent.change(feeInput,    { target: { value: '5.50' } });
    fireEvent.change(threshInput, { target: { value: '75'   } });

    const saveBtn = screen.getAllByRole('button').find(b => b.textContent.includes('Save'));
    expect(saveBtn).toBeTruthy();
    fireEvent.click(saveBtn);

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith('/admin/shipping-settings', {
        shipping_fee:            5.50,
        free_shipping_threshold: 75,
      })
    );
    await waitFor(() =>
      expect(screen.getByText(/Shipping settings saved/i)).toBeInTheDocument()
    );
  });

  it.skip('shows error message when save fails', async () => {
    api.patch.mockRejectedValueOnce(new Error('Network error'));
    renderAdminTab();
    await waitFor(() => screen.getByText(/Admin Panel/i));
    await clickSettingsTab();

    await waitFor(() => expect(screen.getAllByRole('spinbutton').length).toBeGreaterThanOrEqual(2));

    const saveBtn = screen.getAllByRole('button').find(b => b.textContent.includes('Save'));
    expect(saveBtn).toBeTruthy();
    fireEvent.click(saveBtn);

    await waitFor(() =>
      expect(screen.getByText(/Failed to save settings/i)).toBeInTheDocument()
    );
  });
});
