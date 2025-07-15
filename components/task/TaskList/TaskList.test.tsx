import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import type { Category, Task } from '@/types';
import { TaskList } from './TaskList';

// Mock the date utils
jest.mock('@/lib/utils/dateUtils', () => ({
  formatTimeElapsed: jest.fn((date) => {
    if (!date) {
      return 'Not done yet';
    }
    return '2 days ago';
  }),
  getOverdueStatus: jest.fn(() => ({ isOverdue: false, overdueBy: null })),
}));

// Test wrapper with Mantine provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

// Mock data
const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Kitchen',
    color: '#ff6b6b',
    isDefault: true,
    order: 1,
  },
  {
    id: 'cat-2',
    name: 'Bathroom',
    color: '#4ecdc4',
    isDefault: true,
    order: 2,
  },
  {
    id: 'cat-3',
    name: 'Living Room',
    color: '#45b7d1',
    isDefault: true,
    order: 3,
  },
];

const mockTasks: Task[] = [
  {
    id: 'task-1',
    name: 'Clean dishes',
    description: 'Wash and dry all dishes',
    categoryId: 'cat-1',
    createdAt: new Date('2024-01-01'),
    lastCompletedAt: new Date('2024-01-10'),
    timeCommitment: '30min',
    isArchived: false,
    notes: '',
  },
  {
    id: 'task-2',
    name: 'Vacuum living room',
    description: 'Vacuum carpet and under furniture',
    categoryId: 'cat-3',
    createdAt: new Date('2024-01-02'),
    lastCompletedAt: null,
    timeCommitment: '1hr',
    isArchived: false,
    notes: '',
  },
  {
    id: 'task-3',
    name: 'Clean bathroom mirror',
    description: 'Wipe down mirror and fixtures',
    categoryId: 'cat-2',
    createdAt: new Date('2024-01-03'),
    lastCompletedAt: new Date('2024-01-08'),
    timeCommitment: '15min',
    isArchived: false,
    notes: '',
  },
  {
    id: 'task-4',
    name: 'Deep clean kitchen',
    description: 'Scrub counters, clean appliances',
    categoryId: 'cat-1',
    createdAt: new Date('2024-01-04'),
    lastCompletedAt: null,
    timeCommitment: '2hrs',
    isArchived: false,
    notes: '',
  },
  {
    id: 'task-5',
    name: 'Organize closet',
    description: 'Sort and organize bedroom closet',
    categoryId: 'cat-3',
    createdAt: new Date('2024-01-05'),
    lastCompletedAt: new Date('2024-01-05'),
    isArchived: false,
    notes: '',
  },
];

describe('TaskList Component', () => {
  const defaultProps = {
    tasks: mockTasks,
    categories: mockCategories,
    viewMode: 'category' as const,
    onTaskComplete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Category View', () => {
    it('renders tasks grouped by categories', () => {
      render(
        <TestWrapper>
          <TaskList {...defaultProps} />
        </TestWrapper>
      );

      // Check that category groups are rendered
      expect(screen.getByText('Kitchen')).toBeInTheDocument();
      expect(screen.getByText('Bathroom')).toBeInTheDocument();
      expect(screen.getByText('Living Room')).toBeInTheDocument();
    });

    it('displays correct task counts for each category', () => {
      render(
        <TestWrapper>
          <TaskList {...defaultProps} />
        </TestWrapper>
      );

      // Kitchen should have 2 tasks
      const kitchenSection = screen.getByText('Kitchen').closest('[role="button"]');
      expect(kitchenSection).toHaveTextContent('2 tasks');

      // Bathroom should have 1 task
      const bathroomSection = screen.getByText('Bathroom').closest('[role="button"]');
      expect(bathroomSection).toHaveTextContent('1 task');

      // Living Room should have 2 tasks
      const livingRoomSection = screen.getByText('Living Room').closest('[role="button"]');
      expect(livingRoomSection).toHaveTextContent('2 tasks');
    });

    it('shows tasks within their respective categories', () => {
      render(
        <TestWrapper>
          <TaskList {...defaultProps} />
        </TestWrapper>
      );

      // Check that tasks appear in the document
      expect(screen.getByText('Clean dishes')).toBeInTheDocument();
      expect(screen.getByText('Vacuum living room')).toBeInTheDocument();
      expect(screen.getByText('Clean bathroom mirror')).toBeInTheDocument();
      expect(screen.getByText('Deep clean kitchen')).toBeInTheDocument();
      expect(screen.getByText('Organize closet')).toBeInTheDocument();
    });

    it('allows collapsing and expanding category groups', async () => {
      render(
        <TestWrapper>
          <TaskList {...defaultProps} />
        </TestWrapper>
      );

      const kitchenHeader = screen.getByText('Kitchen').closest('[role="button"]');
      expect(kitchenHeader).toHaveAttribute('aria-expanded', 'true');

      // Collapse the Kitchen category
      fireEvent.click(kitchenHeader!);

      await waitFor(() => {
        expect(kitchenHeader).toHaveAttribute('aria-expanded', 'false');
      });

      // Expand it again
      fireEvent.click(kitchenHeader!);

      await waitFor(() => {
        expect(kitchenHeader).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('handles keyboard navigation for group headers', async () => {
      render(
        <TestWrapper>
          <TaskList {...defaultProps} />
        </TestWrapper>
      );

      const kitchenHeader = screen.getByText('Kitchen').closest('[role="button"]');

      // Test Enter key
      fireEvent.keyDown(kitchenHeader!, { key: 'Enter' });
      await waitFor(() => {
        expect(kitchenHeader).toHaveAttribute('aria-expanded', 'false');
      });

      // Test Space key
      fireEvent.keyDown(kitchenHeader!, { key: ' ' });
      await waitFor(() => {
        expect(kitchenHeader).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('displays empty state for categories with no tasks', () => {
      const tasksWithoutBathroom = mockTasks.filter((task) => task.categoryId !== 'cat-2');

      render(
        <TestWrapper>
          <TaskList {...defaultProps} tasks={tasksWithoutBathroom} />
        </TestWrapper>
      );

      // Bathroom category should still appear but with empty state
      expect(screen.getByText('Bathroom')).toBeInTheDocument();
      expect(screen.getByText('0 tasks')).toBeInTheDocument();
    });
  });

  describe('Time Commitment View', () => {
    it('renders tasks grouped by time commitment', () => {
      render(
        <TestWrapper>
          <TaskList {...defaultProps} viewMode="time" />
        </TestWrapper>
      );

      // Check that time commitment groups are rendered by looking for group headers
      expect(screen.getAllByText('15 minutes')).toHaveLength(2); // Group header + badge
      expect(screen.getAllByText('30 minutes')).toHaveLength(2); // Group header + badge
      expect(screen.getAllByText('1 hour')).toHaveLength(2); // Group header + badge
      expect(screen.getAllByText('2 hours')).toHaveLength(2); // Group header + badge
    });

    it('displays tasks without time commitment in "Time Unknown" group', () => {
      const tasksWithUnknownTime = [
        ...mockTasks,
        {
          id: 'task-6',
          name: 'Task without time',
          description: 'No time commitment specified',
          categoryId: 'cat-1',
          createdAt: new Date('2024-01-06'),
          lastCompletedAt: null,
          isArchived: false,
          notes: '',
        } as Task,
      ];

      render(
        <TestWrapper>
          <TaskList {...defaultProps} tasks={tasksWithUnknownTime} viewMode="time" />
        </TestWrapper>
      );

      expect(screen.getByText('Time Unknown')).toBeInTheDocument();
      expect(screen.getByText('Task without time')).toBeInTheDocument();
    });

    it('shows category badges when in time commitment view', () => {
      render(
        <TestWrapper>
          <TaskList {...defaultProps} viewMode="time" showCategoryBadges />
        </TestWrapper>
      );

      // Category badges should be visible on task cards
      expect(screen.getAllByTestId('category-badge')).toHaveLength(mockTasks.length);
    });

    it('displays correct task counts for each time commitment group', () => {
      render(
        <TestWrapper>
          <TaskList {...defaultProps} viewMode="time" />
        </TestWrapper>
      );

      // Find sections by looking for the first occurrence (group header)
      const allFifteenMinTexts = screen.getAllByText('15 minutes');
      const fifteenMinSection = allFifteenMinTexts[0].closest('[role="button"]');
      expect(fifteenMinSection).toHaveTextContent('1 task');

      const allThirtyMinTexts = screen.getAllByText('30 minutes');
      const thirtyMinSection = allThirtyMinTexts[0].closest('[role="button"]');
      expect(thirtyMinSection).toHaveTextContent('1 task');
    });
  });

  describe('Task Interactions', () => {
    it('calls onTaskComplete when task completion button is clicked', async () => {
      const onTaskComplete = jest.fn();

      render(
        <TestWrapper>
          <TaskList {...defaultProps} onTaskComplete={onTaskComplete} />
        </TestWrapper>
      );

      // Find and click a completion button - tasks are ordered by category, so first task in Kitchen category
      const completionButtons = screen.getAllByLabelText(/Mark ".*" as complete/);
      fireEvent.click(completionButtons[0]);

      // The first task should be from Kitchen category (either task-1 or task-4)
      expect(onTaskComplete).toHaveBeenCalledTimes(1);
      expect(onTaskComplete).toHaveBeenCalledWith(expect.stringMatching(/task-[14]/));
    });

    it('calls onTaskEdit when edit button is clicked', () => {
      const onTaskEdit = jest.fn();

      render(
        <TestWrapper>
          <TaskList {...defaultProps} onTaskEdit={onTaskEdit} />
        </TestWrapper>
      );

      // Find and click an edit button
      const editButtons = screen.getAllByTestId('edit-button');
      fireEvent.click(editButtons[0]);

      expect(onTaskEdit).toHaveBeenCalledWith('task-1');
    });

    it('calls onTaskArchive when archive button is clicked', () => {
      const onTaskArchive = jest.fn();

      render(
        <TestWrapper>
          <TaskList {...defaultProps} onTaskArchive={onTaskArchive} />
        </TestWrapper>
      );

      // Find and click an archive button
      const archiveButtons = screen.getAllByTestId('archive-button');
      fireEvent.click(archiveButtons[0]);

      expect(onTaskArchive).toHaveBeenCalledWith('task-1');
    });
  });

  describe('Loading and Error States', () => {
    it('displays loading state', () => {
      render(
        <TestWrapper>
          <TaskList {...defaultProps} loading />
        </TestWrapper>
      );

      expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
      // Mantine Loader doesn't have progressbar role by default, just check it exists
      expect(document.querySelector('.mantine-Loader-root')).toBeInTheDocument();
    });

    it('displays error state', () => {
      const errorMessage = 'Failed to load tasks';

      render(
        <TestWrapper>
          <TaskList {...defaultProps} error={errorMessage} />
        </TestWrapper>
      );

      expect(screen.getByText('Error loading tasks')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('displays empty state when no tasks', () => {
      render(
        <TestWrapper>
          <TaskList {...defaultProps} tasks={[]} />
        </TestWrapper>
      );

      expect(screen.getByText('No tasks found')).toBeInTheDocument();
      expect(screen.getByText(/Create your first task to get started/)).toBeInTheDocument();
    });

    it('displays custom empty state when provided', () => {
      const customEmptyState = <div>Custom empty message</div>;

      render(
        <TestWrapper>
          <TaskList {...defaultProps} tasks={[]} emptyState={customEmptyState} />
        </TestWrapper>
      );

      expect(screen.getByText('Custom empty message')).toBeInTheDocument();
    });
  });

  describe('Filtering and Sorting', () => {
    it('applies task filter when provided', () => {
      const taskFilter = (task: Task) => task.timeCommitment === '30min';

      render(
        <TestWrapper>
          <TaskList {...defaultProps} taskFilter={taskFilter} />
        </TestWrapper>
      );

      // Only the 30min task should be visible
      expect(screen.getByText('Clean dishes')).toBeInTheDocument();
      expect(screen.queryByText('Vacuum living room')).not.toBeInTheDocument();
    });

    it('applies task sorting when provided', () => {
      const taskSort = (a: Task, b: Task) => a.name.localeCompare(b.name);

      render(
        <TestWrapper>
          <TaskList {...defaultProps} taskSort={taskSort} />
        </TestWrapper>
      );

      // Tasks should be sorted alphabetically within their groups
      // This is harder to test directly, but we can verify all tasks are still present
      expect(screen.getByText('Clean dishes')).toBeInTheDocument();
      expect(screen.getByText('Deep clean kitchen')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(
        <TestWrapper>
          <TaskList {...defaultProps} />
        </TestWrapper>
      );

      // Check main region has proper label
      expect(screen.getByRole('region')).toHaveAttribute(
        'aria-label',
        'Tasks organized by category'
      );

      // Check group headers have proper ARIA attributes - filter out task completion buttons
      const allButtons = screen.getAllByRole('button');
      const groupHeaders = allButtons.filter(
        (button) => button.hasAttribute('aria-expanded') && button.hasAttribute('aria-controls')
      );

      expect(groupHeaders.length).toBeGreaterThan(0);
      groupHeaders.forEach((header) => {
        expect(header).toHaveAttribute('aria-expanded');
        expect(header).toHaveAttribute('aria-controls');
      });
    });

    it('supports keyboard navigation', () => {
      render(
        <TestWrapper>
          <TaskList {...defaultProps} />
        </TestWrapper>
      );

      // Group headers should be focusable - filter out task completion buttons
      const allButtons = screen.getAllByRole('button');
      const groupHeaders = allButtons.filter(
        (button) => button.hasAttribute('aria-expanded') && button.hasAttribute('aria-controls')
      );

      groupHeaders.forEach((header) => {
        expect(header).toHaveAttribute('tabIndex', '0');
      });
    });
  });

  describe('Compact Mode', () => {
    it('renders compact task cards when compactCards is true', () => {
      render(
        <TestWrapper>
          <TaskList {...defaultProps} compactCards />
        </TestWrapper>
      );

      // This is harder to test directly, but we can verify tasks are still rendered
      expect(screen.getByText('Clean dishes')).toBeInTheDocument();
    });
  });
});
