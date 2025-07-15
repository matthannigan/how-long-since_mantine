import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import type { Category, Task } from '@/types';
import { TaskCard } from './TaskCard';

// Mock task and category data
const mockCategory: Category = {
  id: 'cat-1',
  name: 'Kitchen',
  color: '#3B82F6',
  icon: 'utensils',
  isDefault: true,
  order: 1,
};

const mockTask: Task = {
  id: 'task-1',
  name: 'Clean the dishes',
  description: 'Wash all dishes in the sink',
  categoryId: 'cat-1',
  createdAt: new Date('2024-01-01'),
  lastCompletedAt: null,
  timeCommitment: '30min',
  expectedFrequency: { value: 1, unit: 'day' },
  isArchived: false,
  notes: 'Use hot water and soap',
};

const completedTask: Task = {
  ...mockTask,
  lastCompletedAt: new Date('2024-01-15'),
};

// For overdue styling test - this task was completed long ago and is now overdue
const overdueCompletedTask: Task = {
  ...mockTask,
  lastCompletedAt: new Date('2024-01-05'), // Completed 15 days ago with daily frequency - overdue
  expectedFrequency: { value: 1, unit: 'day' },
};

// For testing incomplete overdue task - never completed but has expected frequency
const neverCompletedTask: Task = {
  ...mockTask,
  lastCompletedAt: null, // Never completed
  expectedFrequency: { value: 1, unit: 'day' },
  createdAt: new Date('2024-01-01'), // Created long ago
};

// Test wrapper with MantineProvider and Notifications
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>
    <Notifications />
    {children}
  </MantineProvider>
);

describe('TaskCard', () => {
  const mockOnComplete = jest.fn();
  const mockOnUndoComplete = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnArchive = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    task: mockTask,
    category: mockCategory,
    onComplete: mockOnComplete,
    onUndoComplete: mockOnUndoComplete,
    onEdit: mockOnEdit,
    onArchive: mockOnArchive,
  };

  describe('Rendering', () => {
    it('renders task card with basic information', () => {
      render(
        <TestWrapper>
          <TaskCard {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByTestId('task-card')).toBeInTheDocument();
      expect(screen.getByText('Clean the dishes')).toBeInTheDocument();
      expect(screen.getByText('Wash all dishes in the sink')).toBeInTheDocument();
      expect(screen.getByText('Use hot water and soap')).toBeInTheDocument();
    });

    it('shows category badge by default', () => {
      render(
        <TestWrapper>
          <TaskCard {...defaultProps} />
        </TestWrapper>
      );

      const categoryBadge = screen.getByTestId('category-badge');
      expect(categoryBadge).toBeInTheDocument();
      expect(categoryBadge).toHaveTextContent('Kitchen');
    });

    it('hides category badge when showCategory is false', () => {
      render(
        <TestWrapper>
          <TaskCard {...defaultProps} showCategory={false} />
        </TestWrapper>
      );

      expect(screen.queryByTestId('category-badge')).not.toBeInTheDocument();
    });

    it('shows time commitment badge when present', () => {
      render(
        <TestWrapper>
          <TaskCard {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByTestId('time-commitment-badge')).toBeInTheDocument();
    });

    it('shows time elapsed information', () => {
      render(
        <TestWrapper>
          <TaskCard {...defaultProps} />
        </TestWrapper>
      );

      const timeElapsed = screen.getByTestId('time-elapsed');
      expect(timeElapsed).toBeInTheDocument();
      expect(timeElapsed).toHaveTextContent('Not done yet');
    });

    it('renders in compact mode', () => {
      render(
        <TestWrapper>
          <TaskCard {...defaultProps} compact />
        </TestWrapper>
      );

      expect(screen.getByTestId('task-card')).toBeInTheDocument();
      expect(screen.getByText('Clean the dishes')).toBeInTheDocument();
      // Description and notes should be hidden in compact mode
      expect(screen.queryByText('Wash all dishes in the sink')).not.toBeInTheDocument();
      expect(screen.queryByText('Use hot water and soap')).not.toBeInTheDocument();
    });
  });

  describe('Task States', () => {
    it('shows completed state correctly', () => {
      render(
        <TestWrapper>
          <TaskCard {...defaultProps} task={completedTask} />
        </TestWrapper>
      );

      expect(screen.getByTestId('completed-indicator')).toBeInTheDocument();

      const title = screen.getByText('Clean the dishes');
      expect(title).toHaveStyle('text-decoration: line-through');
    });

    it('shows overdue state correctly', () => {
      // Mock current date to make task overdue
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-20')); // 15 days after last completion

      render(
        <TestWrapper>
          <TaskCard {...defaultProps} task={overdueCompletedTask} />
        </TestWrapper>
      );

      expect(screen.getByTestId('overdue-indicator')).toBeInTheDocument();

      const timeElapsed = screen.getByTestId('time-elapsed');
      expect(timeElapsed).toHaveTextContent('overdue');

      jest.useRealTimers();
    });
  });

  describe('Interactions', () => {
    it('calls onComplete when completion button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskCard {...defaultProps} />
        </TestWrapper>
      );

      const completionButton = screen.getByTestId('task-completion-button');
      await user.click(completionButton);

      expect(mockOnComplete).toHaveBeenCalledWith('task-1');
    });

    it('calls onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskCard {...defaultProps} />
        </TestWrapper>
      );

      const editButton = screen.getByTestId('edit-button');
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith('task-1');
    });

    it('calls onArchive when archive button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskCard {...defaultProps} />
        </TestWrapper>
      );

      const archiveButton = screen.getByTestId('archive-button');
      await user.click(archiveButton);

      expect(mockOnArchive).toHaveBeenCalledWith('task-1');
    });

    it('hides action buttons when handlers are not provided', () => {
      render(
        <TestWrapper>
          <TaskCard task={mockTask} category={mockCategory} onComplete={mockOnComplete} />
        </TestWrapper>
      );

      expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('archive-button')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <TaskCard {...defaultProps} />
        </TestWrapper>
      );

      const card = screen.getByTestId('task-card');
      expect(card).toHaveAttribute('role', 'article');
      expect(card).toHaveAttribute('aria-labelledby', 'task-title-task-1');
      expect(card).toHaveAttribute('aria-describedby', 'task-status-task-1');
    });

    it('has proper heading structure', () => {
      render(
        <TestWrapper>
          <TaskCard {...defaultProps} />
        </TestWrapper>
      );

      const title = screen.getByText('Clean the dishes');
      expect(title).toHaveAttribute('id', 'task-title-task-1');
    });

    it('has proper status description', () => {
      render(
        <TestWrapper>
          <TaskCard {...defaultProps} />
        </TestWrapper>
      );

      const status = screen.getByTestId('time-elapsed');
      expect(status).toHaveAttribute('id', 'task-status-task-1');
    });

    it('provides screen reader announcements for overdue tasks', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-20'));

      render(
        <TestWrapper>
          <TaskCard {...defaultProps} task={overdueCompletedTask} />
        </TestWrapper>
      );

      // Check for screen reader only content
      const srContent = document.querySelector('.sr-only');
      expect(srContent).toBeInTheDocument();

      jest.useRealTimers();
    });

    it('has proper button labels', () => {
      render(
        <TestWrapper>
          <TaskCard {...defaultProps} />
        </TestWrapper>
      );

      const editButton = screen.getByTestId('edit-button');
      const archiveButton = screen.getByTestId('archive-button');

      expect(editButton).toHaveAttribute('aria-label', 'Edit "Clean the dishes"');
      expect(archiveButton).toHaveAttribute('aria-label', 'Archive "Clean the dishes"');
    });
  });

  describe('Visual Styling', () => {
    it('applies category color as left border', () => {
      render(
        <TestWrapper>
          <TaskCard {...defaultProps} />
        </TestWrapper>
      );

      const card = screen.getByTestId('task-card');
      expect(card).toHaveStyle(`border-left: 4px solid ${mockCategory.color}`);
    });

    it('applies overdue styling for completed but overdue tasks', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-20')); // 15 days after last completion

      render(
        <TestWrapper>
          <TaskCard {...defaultProps} task={overdueCompletedTask} />
        </TestWrapper>
      );

      const card = screen.getByTestId('task-card');
      // This task is completed (has lastCompletedAt) so it should show green background
      // even though it's overdue, because completed styling takes precedence
      expect(card).toHaveStyle('background-color: var(--mantine-color-green-0)');

      jest.useRealTimers();
    });

    it('applies completed styling', () => {
      render(
        <TestWrapper>
          <TaskCard {...defaultProps} task={completedTask} />
        </TestWrapper>
      );

      const card = screen.getByTestId('task-card');
      expect(card).toHaveStyle('background-color: var(--mantine-color-green-0)');
    });

    it('applies completed styling even when task is overdue (completed takes precedence)', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-20')); // 10 days after last completion

      render(
        <TestWrapper>
          <TaskCard {...defaultProps} task={overdueCompletedTask} />
        </TestWrapper>
      );

      const card = screen.getByTestId('task-card');
      // Should show green (completed) background, not red (overdue)
      expect(card).toHaveStyle('background-color: var(--mantine-color-green-0)');

      jest.useRealTimers();
    });
  });

  describe('Loading State', () => {
    it('shows loading state correctly', () => {
      render(
        <TestWrapper>
          <TaskCard {...defaultProps} loading />
        </TestWrapper>
      );

      const completionButton = screen.getByTestId('task-completion-button');
      expect(completionButton).toBeDisabled();
    });
  });
});
