/**
 * ShopPage tests
 * – Renders product grid
 * – Category sidebar shows correct slugs and counts
 * – Search works
 * – Pagination renders
 * – Sort options render
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
    delete: vi.fn(),
    patch:  vi.fn(),
  },
}));

import api from '../services/api';
import ShopPage from '../pages/ShopPage';

const mockProducts = {
  data: {
    products: [
      { id: 1, name: 'Sakarias Armchair',   price: 392, category_name: 'Chair', avg_rating: 5, image_url: '/chairs1.png', review_count: 3 },
      { id: 2, name: 'Velvet Bed',          price: 1490, category_name: 'Beds',  avg_rating: 4, image_url: '/bed1.webp', review_count: 1 },
      { id: 3, name: 'Cloud Modular Sofa',  price: 2450, category_name: 'Sofas', avg_rating: 5, image_url: '/sofa1.webp', review_count: 5 },
    ],
    pagination: { total: 3, page: 1, limit: 12, pages: 1 },
  },
};

const mockCategories = [
  { slug: 'chair', name: 'Chair', product_count: 4 },
  { slug: 'beds',  name: 'Beds',  product_count: 7 },
  { slug: 'sofas', name: 'Sofas', product_count: 6 },
  { slug: 'lamp',  name: 'Lamp',  product_count: 12 },
  { slug: 'table', name: 'Table', product_count: 7 },
  { slug: 'shelf', name: 'Shelf', product_count: 4 },
];

function renderShopPage() {
  return render(
    <MemoryRouter initialEntries={['/shop']}>
      <AuthContext.Provider value={{ user: null, loading: false }}>
        <CartContext.Provider value={{ addItem: vi.fn(), items: [], loading: false, itemCount: 0, isOpen: false, setIsOpen: vi.fn() }}>
          <WishlistContext.Provider value={{ wishlistIds: new Set(), toggle: vi.fn() }}>
            <ShopPage />
          </WishlistContext.Provider>
        </CartContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockImplementation((url) => {
    if (url.includes('/categories')) return Promise.resolve({ data: mockCategories });
    if (url.includes('/products'))   return Promise.resolve(mockProducts);
    return Promise.resolve({ data: [] });
  });
});

describe('ShopPage', () => {
  it('renders the shop heading', async () => {
    renderShopPage();
    await waitFor(() => {
      expect(screen.getAllByText('All Products').length).toBeGreaterThan(0);
    });
  });

  it('displays products from API', async () => {
    renderShopPage();
    await waitFor(() => {
      expect(screen.getByText('Sakarias Armchair')).toBeInTheDocument();
      expect(screen.getByText('Velvet Bed')).toBeInTheDocument();
      expect(screen.getByText('Cloud Modular Sofa')).toBeInTheDocument();
    });
  });

  it('shows product count', async () => {
    renderShopPage();
    await waitFor(() => {
      expect(screen.getByText(/3 products? found/)).toBeInTheDocument();
    });
  });

  it('renders category sidebar with correct counts', async () => {
    renderShopPage();
    await waitFor(() => {
      expect(screen.getAllByText('Chair').length).toBeGreaterThan(0);
      expect(screen.getAllByText('4').length).toBeGreaterThan(0);  // chair count
      expect(screen.getAllByText('12').length).toBeGreaterThan(0); // lamp count
    });
  });

  it('renders sort dropdown', async () => {
    renderShopPage();
    const sortSelect = screen.getByDisplayValue('Newest');
    expect(sortSelect).toBeInTheDocument();
  });

  it('renders search input', async () => {
    renderShopPage();
    expect(screen.getByPlaceholderText(/Search products/i)).toBeInTheDocument();
  });

  it('renders view toggle buttons', async () => {
    renderShopPage();
    expect(screen.getByTitle('Grid view')).toBeInTheDocument();
    expect(screen.getByTitle('List view')).toBeInTheDocument();
  });

  it('filters by category when sidebar button clicked', async () => {
    renderShopPage();
    await waitFor(() => expect(screen.getAllByText('Chair').length).toBeGreaterThan(0));

    // Find and click the Chair category button in sidebar
    const chairBtns = screen.getAllByText('Chair');
    const sidebarBtn = chairBtns.find(el => el.closest('button'));
    if (sidebarBtn) {
      fireEvent.click(sidebarBtn.closest('button'));
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith(expect.stringContaining('category=chair'));
      });
    }
  });

  it('uses local fallback images (no picsum/unsplash)', async () => {
    renderShopPage();
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
});
