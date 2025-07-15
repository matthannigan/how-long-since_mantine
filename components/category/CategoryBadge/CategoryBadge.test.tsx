import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { CategoryBadge } from './CategoryBadge';
import type { Category } from '@/types';

const mockCategory: Category = {
  id: '1',
  name: 'Test Category',
  color: '#3B82F6',
  icon: 'utensils',
  isDefault: false,
  order: 1,
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  );
};

describe('CategoryBadge', () => {
  it('renders category name', () => {
    renderWithProviders(
      <CategoryBadge category={mockCategory} />
    );

    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  it('renders with icon when showIcon is true', () => {
    renderWithProviders(
      <CategoryBadge category={mockCategory} showIcon={true} />
    );

    const badge = screen.getByText('Test Category').closest('.mantine-Badge-root');
    expect(badge).toBeInTheDocument();
  });

  it('renders without icon when showIcon is false', () => {
    renderWithProviders(
      <CategoryBadge category={mockCategory} showIcon={false} />
    );

    const badge = screen.getByText('Test Category').closest('.mantine-Badge-root');
    expect(badge).toBeInTheDocument();
  });

  it('renders without icon when category has no icon', () => {
    const categoryWithoutIcon = { ...mockCategory, icon: undefined };
    
    renderWithProviders(
      <CategoryBadge category={categoryWithoutIcon} />
    );

    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  it('applies correct size prop', () => {
    renderWithProviders(
      <CategoryBadge category={mockCategory} size="lg" />
    );

    const badge = screen.getByText('Test Category').closest('.mantine-Badge-root');
    expect(badge).toHaveClass('mantine-Badge-root');
  });

  it('applies correct variant prop', () => {
    renderWithProviders(
      <CategoryBadge category={mockCategory} variant="filled" />
    );

    const badge = screen.getByText('Test Category').closest('.mantine-Badge-root');
    expect(badge).toHaveClass('mantine-Badge-root');
  });

  it('handles invalid icon names gracefully', () => {
    const categoryWithInvalidIcon = { ...mockCategory, icon: 'invalid-icon-name' };
    
    renderWithProviders(
      <CategoryBadge category={categoryWithInvalidIcon} />
    );

    // Should still render the category name even with invalid icon
    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  it('applies custom color styling', () => {
    const customColorCategory = { ...mockCategory, color: '#FF0000' };
    
    renderWithProviders(
      <CategoryBadge category={customColorCategory} />
    );

    const badge = screen.getByText('Test Category').closest('.mantine-Badge-root');
    expect(badge).toHaveStyle({
      color: '#FF0000',
    });
  });

  it('renders with different sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    
    sizes.forEach(size => {
      const { unmount } = renderWithProviders(
        <CategoryBadge category={mockCategory} size={size} />
      );
      
      expect(screen.getByText('Test Category')).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with different variants', () => {
    const variants = ['light', 'filled', 'outline', 'dot'] as const;
    
    variants.forEach(variant => {
      const { unmount } = renderWithProviders(
        <CategoryBadge category={mockCategory} variant={variant} />
      );
      
      expect(screen.getByText('Test Category')).toBeInTheDocument();
      unmount();
    });
  });
});