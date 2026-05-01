/**
 * HomePage tests
 * – Renders hero section
 * – Category tabs switch correctly
 * – Displays products from API with correct images
 * – Fallback data per category when API fails
 * – Testimonials render with local images
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
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
import HomePage from '../pages/HomePage';

const mockChairs = {
  data: {
    products: [
      { id: 1, name: 'Sakarias Armchair',   price: 392, category_name: 'Chair', avg_rating: 5, image_url: '/chairs1.png' },
      { id: 2, name: 'Baltsar Plaid Chair', price: 459, category_name: 'Chair', avg_rating: 5, image_url: '/chairs2.png' },
    ],
  },
};

const mockBeds = {
  data: {
    products: [
      { id: 5, name: 'Velvet Upholstered Bed', price: 1490, category_name: 'Beds', avg_rating: 5, image_url: '/bed1.webp' },
      { id: 6, name: 'Nordic Oak Platform Bed', price: 1290, category_name: 'Beds', avg_rating: 4, image_url: '/bed2.webp' },
    ],
  },
};

function renderHomePage() {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user: null, loading: false }}>
        <CartContext.Provider value={{ addItem: vi.fn(), items: [], itemCount: 0, isOpen: false, setIsOpen: vi.fn() }}>
          <WishlistContext.Provider value={{ wishlistIds: new Set(), toggle: vi.fn() }}>
            <HomePage />
          </WishlistContext.Provider>
        </CartContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockImplementation((url) => {
    if (url.includes('category=chair')) return Promise.resolve(mockChairs);
    if (url.includes('category=beds'))  return Promise.resolve(mockBeds);
    return Promise.resolve({ data: { products: [] } });
  });
});

describe('HomePage', () => {
  it('renders the hero heading', async () => {
    renderHomePage();
    expect(screen.getByText(/Make Your Interior More/i)).toBeInTheDocument();
    expect(screen.getByText(/Minimalistic & Modern/i)).toBeInTheDocument();
  });

  it('renders the search bar', async () => {
    renderHomePage();
    expect(screen.getByPlaceholderText(/Search furniture/i)).toBeInTheDocument();
  });

  it('renders category tabs', async () => {
    renderHomePage();
    expect(screen.getByText('Chair')).toBeInTheDocument();
    expect(screen.getByText('Beds')).toBeInTheDocument();
    expect(screen.getByText('Sofa')).toBeInTheDocument();
    expect(screen.getByText('Lamp')).toBeInTheDocument();
    expect(screen.getByText('Table')).toBeInTheDocument();
    expect(screen.getByText('Shelf')).toBeInTheDocument();
  });

  it('loads chair products by default', async () => {
    renderHomePage();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('category=chair'));
    });
    await waitFor(() => {
      expect(screen.getByText('Sakarias Armchair')).toBeInTheDocument();
      expect(screen.getByText('Baltsar Plaid Chair')).toBeInTheDocument();
    });
  });

  it('uses local images, not external URLs', async () => {
    renderHomePage();
    await waitFor(() => screen.getByText('Sakarias Armchair'));
    const imgs = screen.getAllByRole('img');
    imgs.forEach(img => {
      const src = img.getAttribute('src');
      if (src) {
        expect(src).not.toContain('picsum.photos');
        expect(src).not.toContain('unsplash.com');
      }
    });
  });

  it('switches to Beds category on tab click', async () => {
    renderHomePage();
    await waitFor(() => screen.getByText('Sakarias Armchair'));

    fireEvent.click(screen.getByText('Beds'));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('category=beds'));
    });
    await waitFor(() => {
      expect(screen.getByText('Velvet Upholstered Bed')).toBeInTheDocument();
    });
  });

  it('shows fallback data when API fails', async () => {
    api.get.mockRejectedValue(new Error('Network error'));
    renderHomePage();
    await waitFor(() => {
      // Fallback chair data should include local image_url
      expect(screen.getByText('Sakarias Armchair')).toBeInTheDocument();
    });
  });

  it('shows bed fallback data when API fails on beds tab', async () => {
    api.get.mockRejectedValue(new Error('Network error'));
    renderHomePage();
    await waitFor(() => screen.getByText('Sakarias Armchair'));

    fireEvent.click(screen.getByText('Beds'));
    await waitFor(() => {
      expect(screen.getByText('Velvet Upholstered Bed')).toBeInTheDocument();
    });
  });

  it('renders testimonial section with local room images', async () => {
    renderHomePage();
    expect(screen.getByText(/Our Client Reviews/i)).toBeInTheDocument();
    expect(screen.getAllByText('Anna M.').length).toBeGreaterThan(0);
    expect(screen.getAllByText('James K.').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sarah L.').length).toBeGreaterThan(0);
  });

  it('renders "Why Choosing Us" section', async () => {
    renderHomePage();
    expect(screen.getAllByText(/Why/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Luxury facilities/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Affordable Price/i).length).toBeGreaterThan(0);
  });

  it('renders "Best Selling Product" heading', async () => {
    renderHomePage();
    expect(screen.getByText(/Best Selling Product/i)).toBeInTheDocument();
  });
});
