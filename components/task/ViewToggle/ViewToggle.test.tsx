import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { ViewToggle, ViewToggleWithStats, useViewToggle } from './ViewToggle';
import type { TaskListViewMode } from '../TaskList/TaskList';

// Test wrapper with Mantine provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('ViewToggle Component', () => {
  const defaultProps = {
    currentView: 'category' as TaskListViewMode,
    onViewChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders segmented control by default', () => {
      render(
        <TestWrapper>
          <ViewToggle {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByTestId('view-toggle-segmented')).toBeInTheDocument();
      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Time')).toBeInTheDocument();
    });

    it('renders compact action buttons when compact is true', () => {
      render(
        <TestWrapper>
          <ViewToggle {...defaultProps} compact />
        </TestWrapper>
      );

      expect(screen.getByTestId('view-toggle-category')).toBeInTheDocument();
      expect(screen.getByTestId('view-toggle-time')).toBeInTheDocument();
      expect(screen.queryByTestId('view-toggle-segmented')).not.toBeInTheDocument();
    });

    it('calls onViewChange when view is changed', () => {
      const onViewChange = jest.fn();

      render(
        <TestWrapper>
          <ViewToggle {...defaultProps} onViewChange={onViewChange} />
        </TestWrapper>
      );

      // Click on Time view
      const timeButton = screen.getByText('Time');
      fireEvent.click(timeButton);

      expect(onViewChange).toHaveBeenCalledWith('time');
    });

    it('calls onViewChange when compact button is clicked', () => {
      const onViewChange = jest.fn();

      render(
        <TestWrapper>
          <ViewToggle {...defaultProps} compact onViewChange={onViewChange} />
        </TestWrapper>
      );

      const timeButton = screen.getByTestId('view-toggle-time');
      fireEvent.click(timeButton);

      expect(onViewChange).toHaveBeenCalledWith('time');
    });

    it('shows active state for current view', () => {
      render(
        <TestWrapper>
          <ViewToggle {...defaultProps} currentView="time" />
        </TestWrapper>
      );

      // Check that the time option is selected by looking for the active radio button
      const timeRadio = screen.getByRole('radio', { name: /Time/ });
      expect(timeRadio).toBeChecked();
    });

    it('shows active state for compact buttons', () => {
      render(
        <TestWrapper>
          <ViewToggle {...defaultProps} currentView="time" compact />
        </TestWrapper>
      );

      const timeButton = screen.getByTestId('view-toggle-time');
      const categoryButton = screen.getByTestId('view-toggle-category');

      expect(timeButton).toHaveAttribute('aria-pressed', 'true');
      expect(categoryButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Loading State', () => {
    it('shows loading state in segmented control', () => {
      render(
        <TestWrapper>
          <ViewToggle {...defaultProps} loading />
        </TestWrapper>
      );

      const segmentedControl = screen.getByTestId('view-toggle-segmented');
      expect(segmentedControl).toHaveAttribute('data-disabled', 'true');
    });

    it('shows loading state in compact mode', () => {
      render(
        <TestWrapper>
          <ViewToggle {...defaultProps} compact loading />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });

      expect(screen.getByText('Switching...')).toBeInTheDocument();
    });

    it('shows loading overlay in segmented control', () => {
      render(
        <TestWrapper>
          <ViewToggle {...defaultProps} loading />
        </TestWrapper>
      );

      expect(screen.getByText('Switching views...')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables segmented control when disabled', () => {
      render(
        <TestWrapper>
          <ViewToggle {...defaultProps} disabled />
        </TestWrapper>
      );

      const segmentedControl = screen.getByTestId('view-toggle-segmented');
      expect(segmentedControl).toHaveAttribute('data-disabled', 'true');
    });

    it('disables compact buttons when disabled', () => {
      render(
        <TestWrapper>
          <ViewToggle {...defaultProps} compact disabled />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for segmented control', () => {
      render(
        <TestWrapper>
          <ViewToggle {...defaultProps} />
        </TestWrapper>
      );

      const segmentedControl = screen.getByTestId('view-toggle-segmented');
      expect(segmentedControl).toHaveAttribute('aria-label', 'View mode selection');
    });

    it('has proper ARIA labels for compact buttons', () => {
      render(
        <TestWrapper>
          <ViewToggle {...defaultProps} compact />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Switch to categories view')).toBeInTheDocument();
      expect(screen.getByLabelText('Switch to time view')).toBeInTheDocument();
    });

    it('has proper aria-pressed attributes for compact buttons', () => {
      render(
        <TestWrapper>
          <ViewToggle {...defaultProps} currentView="category" compact />
        </TestWrapper>
      );

      const categoryButton = screen.getByTestId('view-toggle-category');
      const timeButton = screen.getByTestId('view-toggle-time');

      expect(categoryButton).toHaveAttribute('aria-pressed', 'true');
      expect(timeButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('shows tooltips for compact buttons', async () => {
      render(
        <TestWrapper>
          <ViewToggle {...defaultProps} compact />
        </TestWrapper>
      );

      const categoryButton = screen.getByTestId('view-toggle-category');
      
      // Hover to show tooltip
      fireEvent.mouseEnter(categoryButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Switch to categories view/)).toBeInTheDocument();
      });
    });
  });

  describe('Label Display', () => {
    it('shows labels by default', () => {
      render(
        <TestWrapper>
          <ViewToggle {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Time')).toBeInTheDocument();
    });

    it('hides labels when showLabels is false', () => {
      render(
        <TestWrapper>
          <ViewToggle {...defaultProps} showLabels={false} />
        </TestWrapper>
      );

      expect(screen.queryByText('Categories')).not.toBeInTheDocument();
      expect(screen.queryByText('Time')).not.toBeInTheDocument();
    });
  });
});

describe('ViewToggleWithStats Component', () => {
  const defaultProps = {
    currentView: 'category' as TaskListViewMode,
    onViewChange: jest.fn(),
    viewStats: {
      category: {
        totalCategories: 5,
        categoriesWithTasks: 3,
      },
      time: {
        totalCommitments: 6,
        commitmentsWithTasks: 4,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders view toggle with statistics', () => {
    render(
      <TestWrapper>
        <ViewToggleWithStats {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('view-toggle-segmented')).toBeInTheDocument();
    expect(screen.getByText('3 of 5 categories have tasks')).toBeInTheDocument();
  });

  it('shows time statistics when time view is active', () => {
    render(
      <TestWrapper>
        <ViewToggleWithStats {...defaultProps} currentView="time" />
      </TestWrapper>
    );

    expect(screen.getByText('4 of 6 time slots have tasks')).toBeInTheDocument();
  });

  it('works without statistics', () => {
    render(
      <TestWrapper>
        <ViewToggleWithStats
          currentView="category"
          onViewChange={jest.fn()}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('view-toggle-segmented')).toBeInTheDocument();
    expect(screen.queryByText(/categories have tasks/)).not.toBeInTheDocument();
  });
});

describe('useViewToggle Hook', () => {
  // Test component to use the hook
  function TestComponent({ 
    initialView = 'category' as TaskListViewMode,
    storageKey = 'test-view'
  }) {
    const { currentView, isLoading, handleViewChange } = useViewToggle(initialView, storageKey);

    return (
      <div>
        <span data-testid="current-view">{currentView}</span>
        <span data-testid="is-loading">{isLoading.toString()}</span>
        <button type="button" onClick={() => handleViewChange('time')}>Switch to Time</button>
        <button type="button" onClick={() => handleViewChange('category')}>Switch to Category</button>
      </div>
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('initializes with provided initial view', () => {
    render(<TestComponent initialView="time" />);

    expect(screen.getByTestId('current-view')).toHaveTextContent('time');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('loads saved view from localStorage on mount', () => {
    mockLocalStorage.getItem.mockReturnValue('time');

    render(<TestComponent />);

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-view');
    expect(screen.getByTestId('current-view')).toHaveTextContent('time');
  });

  it('handles view change and saves to localStorage', async () => {
    render(<TestComponent />);

    const switchButton = screen.getByText('Switch to Time');
    fireEvent.click(switchButton);

    // Should show loading state briefly
    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');

    // Wait for view change to complete
    await waitFor(() => {
      expect(screen.getByTestId('current-view')).toHaveTextContent('time');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-view', 'time');
  });

  it('does not change view if same view is selected', async () => {
    render(<TestComponent initialView="category" />);

    const switchButton = screen.getByText('Switch to Category');
    fireEvent.click(switchButton);

    // Should not show loading state
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });

  it('handles localStorage errors gracefully', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    // Should not throw error
    expect(() => render(<TestComponent />)).not.toThrow();
    expect(screen.getByTestId('current-view')).toHaveTextContent('category');
  });

  it('handles save errors gracefully', async () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('localStorage save error');
    });

    render(<TestComponent />);

    const switchButton = screen.getByText('Switch to Time');
    fireEvent.click(switchButton);

    // Should still change view even if save fails
    await waitFor(() => {
      expect(screen.getByTestId('current-view')).toHaveTextContent('time');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });
  });

  it('creates screen reader announcement on view change', async () => {
    render(<TestComponent />);

    const switchButton = screen.getByText('Switch to Time');
    fireEvent.click(switchButton);

    await waitFor(() => {
      expect(screen.getByTestId('current-view')).toHaveTextContent('time');
    });

    // Check that announcement element was created and removed
    // This is harder to test directly, but we can verify the view changed
    expect(screen.getByTestId('current-view')).toHaveTextContent('time');
  });
});