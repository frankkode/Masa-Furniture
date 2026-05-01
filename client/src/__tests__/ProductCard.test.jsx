/**
 * ProductCard component tests
 * – Grid and list variants render correctly
 * – Uses local image, no external fallback
 * – Shows product info: name, price, category, rating
 * – Add to cart button works
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

const mockProduct = {
  id: 1,
  name: 'Sakarias Armchair',
  price: 392,
  category_name: 'Chair',
  avg_rating: 4,
  review_count: 12,
  image_url: '/chairs1.png',
};

const mockProductNoImage = {
  id: 2,
  name: 'Mystery Chair',
  price: 299,
  category_name: 'Chair',
  avg_rating: 3,
  review_count: 0,
  image_url: null,
};

const addItem = vi.fn().mockResolvedValue();

function renderCard(product = mockProduct, variant = 'grid') {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user: null, loading: false }}>
        <CartContext.Provider value={{ addItem, items: [], loading: false, itemCount: 0, isOpen: false, setIsOpen: vi.fn() }}>
          <WishlistContext.Provider value={{ wishlistIds: new Set(), toggle: vi.fn() }}>
            <ProductCard product={product} variant={variant} />
          </WishlistContext.Provider>
        </CartContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

beforeEach(() => vi.clearAllMocks());

describe('ProductCard — grid variant', () => {
  it('renders product name', () => {
    renderCard();
    expect(screen.getByText('Sakarias Armchair')).toBeInTheDocument();
  });

  it('renders product price', () => {
    renderCard();
    expect(screen.getByText('$392.00')).toBeInTheDocument();
  });

  it('renders category name', () => {
    renderCard();
    expect(screen.getByText('Chair')).toBeInTheDocument();
  });

  it('renders product image with local src', () => {
    renderCard();
    const img = screen.getByAltText('Sakarias Armchair');
    expect(img.getAttribute('src')).toBe('/chairs1.png');
  });

  it('uses local fallback when image_url is null', () => {
    renderCard(mockProductNoImage);
    const img = screen.getByAltText('Mystery Chair');
    expect(img.getAttribute('src')).toBe('/chairs1.png');
    expect(img.getAttribute('src')).not.toContain('picsum');
  });

  it('calls addItem on Add button click', async () => {
    renderCard();
    const addBtn = screen.getByText('Add');
    fireEvent.click(addBtn);
    await waitFor(() => expect(addItem).toHaveBeenCalledWith(1, 1));
  });

  it('has link to product page', () => {
    renderCard();
    const links = screen.getAllByRole('link');
    const productLink = links.find(a => a.getAttribute('href') === '/product/1');
    expect(productLink).toBeTruthy();
  });
});

describe('ProductCard — list variant', () => {
  it('renders product name in list mode', () => {
    renderCard(mockProduct, 'list');
    expect(screen.getByText('Sakarias Armchair')).toBeInTheDocument();
  });

  it('renders price in list mode', () => {
    renderCard(mockProduct, 'list');
    expect(screen.getByText('$392.00')).toBeInTheDocument();
  });

  it('renders Add to Cart button in list mode', () => {
    renderCard(mockProduct, 'list');
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });

  it('renders product image in list mode', () => {
    renderCard(mockProduct, 'list');
    const img = screen.getByAltText('Sakarias Armchair');
    expect(img.getAttribute('src')).toBe('/chairs1.png');
  });
});
