/**
 * StarRating component tests
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StarRating } from '../components/ProductCard';

describe('StarRating', () => {
  it('renders 5 svg stars', () => {
    const { container } = render(<StarRating rating={4} count={12} />);
    const stars = container.querySelectorAll('svg');
    expect(stars.length).toBe(5);
  });

  it('shows review count when provided', () => {
    render(<StarRating rating={3} count={7} />);
    expect(screen.getByText('(7)')).toBeInTheDocument();
  });

  it('hides count when 0', () => {
    const { queryByText } = render(<StarRating rating={5} count={0} />);
    expect(queryByText(/\(/)).not.toBeInTheDocument();
  });
});
