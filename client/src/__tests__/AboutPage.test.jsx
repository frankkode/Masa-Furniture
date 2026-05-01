/**
 * AboutPage component tests
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import AboutPage from '../pages/AboutPage';

const renderAbout = () =>
  render(<MemoryRouter><AboutPage /></MemoryRouter>);

describe('AboutPage', () => {
  it('renders the main heading', () => {
    renderAbout();
    expect(screen.getByText(/Furniture that feels like home/i)).toBeInTheDocument();
  });

  it('renders Our Story subtitle', () => {
    renderAbout();
    expect(screen.getByText(/Our Story/i)).toBeInTheDocument();
  });

  it('shows all four values', () => {
    renderAbout();
    expect(screen.getByText('Timeless Design')).toBeInTheDocument();
    expect(screen.getByText('Sustainable Materials')).toBeInTheDocument();
    expect(screen.getByText('Crafted by People')).toBeInTheDocument();
    expect(screen.getByText('10-Year Guarantee')).toBeInTheDocument();
  });

  it('shows team section', () => {
    renderAbout();
    expect(screen.getByText('The people behind Masa')).toBeInTheDocument();
    expect(screen.getByText('Elina Mäkinen')).toBeInTheDocument();
  });

  it('has Shop Collection CTA link', () => {
    renderAbout();
    const link = screen.getByRole('link', { name: /Shop Collection/i });
    expect(link).toHaveAttribute('href', '/shop');
  });

  it('has Get in Touch link to /contact', () => {
    renderAbout();
    const link = screen.getByRole('link', { name: /Get in Touch/i });
    expect(link).toHaveAttribute('href', '/contact');
  });

  it('shows stats section with Helsinki', () => {
    renderAbout();
    expect(screen.getByText('Founded in Helsinki')).toBeInTheDocument();
  });
});
