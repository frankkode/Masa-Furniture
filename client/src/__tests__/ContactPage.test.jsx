/**
 * ContactPage component tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import ContactPage from '../pages/ContactPage';

const renderContact = () =>
  render(<MemoryRouter><ContactPage /></MemoryRouter>);

describe('ContactPage', () => {
  it('renders heading', () => {
    renderContact();
    expect(screen.getByText(/We'd love to hear from you/i)).toBeInTheDocument();
  });

  it('shows the contact form', () => {
    renderContact();
    expect(screen.getByPlaceholderText(/Jane Smith/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/jane@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tell us how we can help/i)).toBeInTheDocument();
  });

  it('displays Helsinki address info', () => {
    renderContact();
    expect(screen.getByText(/Mannerheimintie 10/i)).toBeInTheDocument();
    expect(screen.getByText(/Helsinki/i)).toBeInTheDocument();
  });

  it('shows success message after form submission', async () => {
    renderContact();
    fireEvent.change(screen.getByPlaceholderText(/Jane Smith/i), { target: { value: 'Testi User' } });
    fireEvent.change(screen.getByPlaceholderText(/jane@example.com/i), { target: { value: 'testi@masa.fi' } });
    fireEvent.change(screen.getByPlaceholderText(/Tell us how we can help/i), { target: { value: 'Hello!' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));
    await waitFor(() => {
      expect(screen.getByText(/Message sent!/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('shows "send another" button after submission', async () => {
    renderContact();
    fireEvent.change(screen.getByPlaceholderText(/Jane Smith/i), { target: { value: 'Testi User' } });
    fireEvent.change(screen.getByPlaceholderText(/jane@example.com/i), { target: { value: 'testi@masa.fi' } });
    fireEvent.change(screen.getByPlaceholderText(/Tell us how we can help/i), { target: { value: 'Hello!' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Send another message/i })).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
