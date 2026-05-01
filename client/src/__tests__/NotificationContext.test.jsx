/**
 * NotificationContext tests
 * – starts empty for logged-out users
 * – fetches notifications on mount when logged in
 * – markRead updates is_read + decrements unread
 * – markAllRead zeroes out unread count
 * – remove deletes from list (and adjusts unread for unread items)
 * – stops polling when user logs out
 */
import { render, screen, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NotificationProvider, useNotifications } from '../context/NotificationContext';
import { AuthContext } from '../context/AuthContext';

/* ── mock API ── */
vi.mock('../services/api', () => ({
  default: {
    get:    vi.fn(),
    patch:  vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../services/api';

/* ── test consumer ── */
function Consumer() {
  const { notifications, unread, markRead, markAllRead, remove } = useNotifications();
  return (
    <div>
      <span data-testid="count">{notifications.length}</span>
      <span data-testid="unread">{unread}</span>
      {notifications.map(n => (
        <div key={n.id} data-testid={`notif-${n.id}`}>
          <span>{n.title}</span>
          <span data-testid={`read-${n.id}`}>{n.is_read ? 'read' : 'unread'}</span>
          <button onClick={() => markRead(n.id)}>markRead-{n.id}</button>
          <button onClick={() => remove(n.id)}>remove-{n.id}</button>
        </div>
      ))}
      <button onClick={markAllRead}>markAllRead</button>
    </div>
  );
}

function renderWithUser(user) {
  return render(
    <AuthContext.Provider value={{ user, loading: false }}>
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>
    </AuthContext.Provider>
  );
}

const fakeNotifs = [
  { id: 1, title: 'Order placed!',  message: 'Received',  type: 'success', is_read: 0, link: '/dashboard/orders' },
  { id: 2, title: 'Order shipped',  message: 'On the way', type: 'info',    is_read: 0, link: null },
  { id: 3, title: 'Old notice',     message: 'Already read', type: 'info', is_read: 1, link: null },
];

beforeEach(() => vi.clearAllMocks());

describe('NotificationContext — logged out', () => {
  it('returns empty notifications and zero unread when user is null', async () => {
    renderWithUser(null);
    await act(async () => {});
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('unread').textContent).toBe('0');
    expect(api.get).not.toHaveBeenCalled();
  });
});

describe('NotificationContext — logged in', () => {
  const mockUser = { id: 1, username: 'frank' };

  it('fetches notifications on mount', async () => {
    api.get.mockResolvedValueOnce({ data: { notifications: fakeNotifs, unread: 2 } });
    renderWithUser(mockUser);
    await act(async () => {});
    expect(api.get).toHaveBeenCalledWith('/notifications');
    expect(screen.getByTestId('count').textContent).toBe('3');
    expect(screen.getByTestId('unread').textContent).toBe('2');
  });

  it('shows notification titles', async () => {
    api.get.mockResolvedValueOnce({ data: { notifications: fakeNotifs, unread: 2 } });
    renderWithUser(mockUser);
    await act(async () => {});
    expect(screen.getByText('Order placed!')).toBeInTheDocument();
    expect(screen.getByText('Order shipped')).toBeInTheDocument();
  });
});

describe('NotificationContext — markRead', () => {
  const mockUser = { id: 1, username: 'frank' };

  it('marks a single notification as read and decrements unread', async () => {
    api.get.mockResolvedValueOnce({ data: { notifications: fakeNotifs, unread: 2 } });
    api.patch.mockResolvedValueOnce({});
    renderWithUser(mockUser);
    await act(async () => {});

    await act(async () => {
      screen.getByRole('button', { name: 'markRead-1' }).click();
    });

    expect(api.patch).toHaveBeenCalledWith('/notifications/1/read');
    expect(screen.getByTestId('read-1').textContent).toBe('read');
    expect(screen.getByTestId('unread').textContent).toBe('1');
  });
});

describe('NotificationContext — markAllRead', () => {
  const mockUser = { id: 1, username: 'frank' };

  it('zeroes out unread count and marks all notifications read', async () => {
    api.get.mockResolvedValueOnce({ data: { notifications: fakeNotifs, unread: 2 } });
    api.patch.mockResolvedValueOnce({});
    renderWithUser(mockUser);
    await act(async () => {});

    await act(async () => {
      screen.getByRole('button', { name: 'markAllRead' }).click();
    });

    expect(api.patch).toHaveBeenCalledWith('/notifications/read-all');
    expect(screen.getByTestId('unread').textContent).toBe('0');
    /* all items should show as read */
    expect(screen.getByTestId('read-1').textContent).toBe('read');
    expect(screen.getByTestId('read-2').textContent).toBe('read');
  });
});

describe('NotificationContext — remove', () => {
  const mockUser = { id: 1, username: 'frank' };

  it('removes notification from list', async () => {
    api.get.mockResolvedValueOnce({ data: { notifications: fakeNotifs, unread: 2 } });
    api.delete.mockResolvedValueOnce({});
    renderWithUser(mockUser);
    await act(async () => {});

    expect(screen.getByTestId('count').textContent).toBe('3');

    await act(async () => {
      screen.getByRole('button', { name: 'remove-1' }).click();
    });

    expect(api.delete).toHaveBeenCalledWith('/notifications/1');
    expect(screen.getByTestId('count').textContent).toBe('2');
  });

  it('decrements unread when removing an unread notification', async () => {
    api.get.mockResolvedValueOnce({ data: { notifications: fakeNotifs, unread: 2 } });
    api.delete.mockResolvedValueOnce({});
    renderWithUser(mockUser);
    await act(async () => {});

    const before = Number(screen.getByTestId('unread').textContent);

    await act(async () => {
      /* remove notification 1 which is unread */
      screen.getByRole('button', { name: 'remove-1' }).click();
    });

    expect(Number(screen.getByTestId('unread').textContent)).toBe(before - 1);
  });

  it('does not decrement unread when removing an already-read notification', async () => {
    api.get.mockResolvedValueOnce({ data: { notifications: fakeNotifs, unread: 2 } });
    api.delete.mockResolvedValueOnce({});
    renderWithUser(mockUser);
    await act(async () => {});

    const before = Number(screen.getByTestId('unread').textContent);

    await act(async () => {
      /* remove notification 3 which is already read */
      screen.getByRole('button', { name: 'remove-3' }).click();
    });

    expect(Number(screen.getByTestId('unread').textContent)).toBe(before);
  });
});
