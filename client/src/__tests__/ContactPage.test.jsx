/**
 * ContactPage component tests
 * – Form renders correctly
 * – Submitting the form calls api.post('/contact', ...) with the right payload
 * – Shows success state on resolution
 * – Shows error state when the API rejects
 * – "Send another message" resets the form
 */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

/* ── mock API module ──────────────────────────────────────── */
vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
    get:  vi.fn(),
  },
}));

import api from '../services/api';
import ContactPage from '../pages/ContactPage';

const renderContact = () =>
  render(<MemoryRouter><ContactPage /></MemoryRouter>);

function fillForm({ name = 'Testi User', email = 'testi@masa.fi', message = 'Hello there' } = {}) {
  fireEvent.change(screen.getByPlaceholderText(/Jane Smith/i),             { target: { value: name    } });
  fireEvent.change(screen.getByPlaceholderText(/jane@example\.com/i),      { target: { value: email   } });
  fireEvent.change(screen.getByPlaceholderText(/Tell us how we can help/i), { target: { value: message } });
}

beforeEach(() => vi.clearAllMocks());

/* ── render ── */
describe('ContactPage — static content', () => {
  it('renders heading', () => {
    renderContact();
    expect(screen.getByText(/We'd love to hear from you/i)).toBeInTheDocument();
  });

  it('shows the contact form fields', () => {
    renderContact();
    expect(screen.getByPlaceholderText(/Jane Smith/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/jane@example\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tell us how we can help/i)).toBeInTheDocument();
  });

  it('displays Helsinki address info', () => {
    renderContact();
    expect(screen.getByText(/Mannerheimintie 10/i)).toBeInTheDocument();
    expect(screen.getByText(/Helsinki/i)).toBeInTheDocument();
  });

  it('has a Send Message button', () => {
    renderContact();
    expect(screen.getByRole('button', { name: /Send Message/i })).toBeInTheDocument();
  });
});

/* ── API call ── */
describe('ContactPage — form submission', () => {
  it('calls api.post with the correct payload', async () => {
    api.post.mockResolvedValueOnce({ data: { ok: true } });
    renderContact();
    fillForm({ name: 'Alice', email: 'alice@masa.fi', message: 'I need help' });
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/contact', {
        name:    'Alice',
        email:   'alice@masa.fi',
        subject: undefined, // no topic selected
        message: 'I need help',
      });
    });
  });

  it('shows success state after successful submission', async () => {
    api.post.mockResolvedValueOnce({ data: { ok: true } });
    renderContact();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));
    await waitFor(() => expect(screen.getByText(/Message sent!/i)).toBeInTheDocument());
  });

  it('shows "Send another message" button after success', async () => {
    api.post.mockResolvedValueOnce({ data: { ok: true } });
    renderContact();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Send another message/i })).toBeInTheDocument()
    );
  });

  it('resets form when "Send another message" is clicked', async () => {
    api.post.mockResolvedValueOnce({ data: { ok: true } });
    renderContact();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));
    await waitFor(() => screen.getByRole('button', { name: /Send another message/i }));
    fireEvent.click(screen.getByRole('button', { name: /Send another message/i }));
    /* form is visible again */
    expect(screen.getByRole('button', { name: /Send Message/i })).toBeInTheDocument();
  });

  it('shows error message when API rejects', async () => {
    api.post.mockRejectedValueOnce(new Error('Network error'));
    renderContact();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));
    await waitFor(() =>
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
    );
  });

  it('includes topic in payload when a topic is selected', async () => {
    api.post.mockResolvedValueOnce({ data: { ok: true } });
    renderContact();
    fillForm();
    /* select a topic from the dropdown */
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Returns & warranty' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    await waitFor(() => {
      const call = api.post.mock.calls[0];
      expect(call[1].subject).toBe('Returns & warranty');
    });
  });
});
