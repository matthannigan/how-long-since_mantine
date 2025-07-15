import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { CategoryForm } from './CategoryForm';
import { categoryService } from '@/lib/services/CategoryService';
import type { Category } from '@/types';

// Mock the category service
jest.mock('@/lib/services/CategoryService');
const mockCategoryService = categoryService as jest.Mocked<typeof categoryService>;

// Mock notifications
jest.mock('@mantine/notifications', () => ({
  notifications: {
    show: jest.fn(),
  },
  Notifications: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

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
      <Notifications />
      {component}
    </MantineProvider>
  );
};

describe('CategoryForm', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('renders create form correctly', () => {
      renderWithProviders(
        <CategoryForm
          opened={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      expect(screen.getByText('Create New Category')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /category name/i })).toBeInTheDocument();
      expect(screen.getByText('Color')).toBeInTheDocument();
      expect(screen.getByText('Icon (Optional)')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Category' })).toBeInTheDocument();
    });

    it('creates category successfully', async () => {
      const user = userEvent.setup();
      const createdCategory = { ...mockCategory, name: 'New Category' };
      mockCategoryService.createCategory.mockResolvedValue(createdCategory);

      renderWithProviders(
        <CategoryForm
          opened={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      // Fill in the form
      await user.type(screen.getByRole('textbox', { name: /category name/i }), 'New Category');
      
      // Submit the form
      await user.click(screen.getByRole('button', { name: 'Create Category' }));

      await waitFor(() => {
        expect(mockCategoryService.createCategory).toHaveBeenCalledWith({
          name: 'New Category',
          color: '#3B82F6', // Default color
          icon: undefined,
        });
      });

      expect(mockOnSuccess).toHaveBeenCalledWith(createdCategory);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('shows validation error for empty name', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <CategoryForm
          opened={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      // Try to submit without entering a name
      await user.click(screen.getByRole('button', { name: 'Create Category' }));

      await waitFor(() => {
        expect(screen.getByText('Category name is required')).toBeInTheDocument();
      });

      expect(mockCategoryService.createCategory).not.toHaveBeenCalled();
    });

    it('shows validation error for name too long', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <CategoryForm
          opened={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      // Enter a name that's too long
      const longName = 'a'.repeat(51);
      await user.type(screen.getByRole('textbox', { name: /category name/i }), longName);
      await user.click(screen.getByRole('button', { name: 'Create Category' }));

      await waitFor(() => {
        expect(screen.getByText('Category name must be 50 characters or less')).toBeInTheDocument();
      });

      expect(mockCategoryService.createCategory).not.toHaveBeenCalled();
    });

    it('handles service error gracefully', async () => {
      const user = userEvent.setup();
      mockCategoryService.createCategory.mockRejectedValue(new Error('Service error'));

      renderWithProviders(
        <CategoryForm
          opened={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      await user.type(screen.getByRole('textbox', { name: /category name/i }), 'Test Category');
      await user.click(screen.getByRole('button', { name: 'Create Category' }));

      await waitFor(() => {
        expect(mockCategoryService.createCategory).toHaveBeenCalled();
      });

      // Should not call success callbacks on error
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    it('renders edit form with pre-filled values', () => {
      renderWithProviders(
        <CategoryForm
          opened={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          category={mockCategory}
          mode="edit"
        />
      );

      expect(screen.getByText('Edit Category')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Category')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    });

    it('updates category successfully', async () => {
      const user = userEvent.setup();
      const updatedCategory = { ...mockCategory, name: 'Updated Category' };
      mockCategoryService.updateCategory.mockResolvedValue(updatedCategory);

      renderWithProviders(
        <CategoryForm
          opened={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          category={mockCategory}
          mode="edit"
        />
      );

      // Update the name
      const nameInput = screen.getByDisplayValue('Test Category');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Category');
      
      // Submit the form
      await user.click(screen.getByRole('button', { name: 'Save Changes' }));

      await waitFor(() => {
        expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(mockCategory.id, {
          name: 'Updated Category',
          color: mockCategory.color,
          icon: mockCategory.icon,
        });
      });

      expect(mockOnSuccess).toHaveBeenCalledWith(updatedCategory);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('throws error when category is missing in edit mode', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <CategoryForm
          opened={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          mode="edit"
        />
      );

      await user.click(screen.getByRole('button', { name: 'Save Changes' }));

      // Should not call the service without a category
      expect(mockCategoryService.updateCategory).not.toHaveBeenCalled();
    });
  });

  describe('Form Interactions', () => {
    it('closes form when cancel is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <CategoryForm
          opened={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('disables form during loading', async () => {
      const user = userEvent.setup();
      // Make the service call hang to test loading state
      mockCategoryService.createCategory.mockImplementation(() => new Promise(() => {}));

      renderWithProviders(
        <CategoryForm
          opened={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      await user.type(screen.getByRole('textbox', { name: /category name/i }), 'Test');
      await user.click(screen.getByRole('button', { name: 'Create Category' }));

      // Form should be disabled during loading
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /category name/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
      });
    });

    it('focuses on name input when opened', () => {
      renderWithProviders(
        <CategoryForm
          opened={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      const nameInput = screen.getByRole('textbox', { name: /category name/i });
      expect(nameInput).toHaveAttribute('data-autofocus');
    });
  });
});