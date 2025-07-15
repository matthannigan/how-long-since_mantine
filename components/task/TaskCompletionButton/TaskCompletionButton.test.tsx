import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { Notifications, notifications } from '@mantine/notifications';
import type { Task } from '@/types';
import { TaskCompletionButton } from './TaskCompletionButton';

// Mock task data
const mockTask: Task = {
  id: '1',
  name: 'Test Task',
  description: 'Test description',
  categoryId: 'cat-1',
  createdAt: new Date('2024-01-01'),
  lastCompletedAt: null,
  isArchived: false,
  notes: '',
};

const completedTask: Task = {
  ...mockTask,
  lastCompletedAt: new Date('2024-01-15'),
};

// Test wrapper with MantineProvider and Notifications
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>
    <Notifications />
    {children}
  </MantineProvider>
);

describe('TaskCompletionButton', () => {
  const mockOnComplete = jest.fn();
  const mockOnUndoComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear all notifications before each test
    notifications.clean();
  });

  afterEach(() => {
    // Clean up notifications after each test
    notifications.clean();
  });

  describe('Icon Variant', () => {
    it('renders completion button for incomplete task', () => {
      render(
        <TestWrapper>
          <TaskCompletionButton
            task={mockTask}
            onComplete={mockOnComplete}
            onUndoComplete={mockOnUndoComplete}
          />
        </TestWrapper>
      );

      const button = screen.getByTestId('task-completion-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Mark "Test Task" as completed');
    });

    it('renders different state for completed task', () => {
      render(
        <TestWrapper>
          <TaskCompletionButton
            task={completedTask}
            onComplete={mockOnComplete}
            onUndoComplete={mockOnUndoComplete}
          />
        </TestWrapper>
      );

      const button = screen.getByTestId('task-completion-button');
      expect(button).toHaveAttribute('aria-label', 'Mark "Test Task" as not completed');
    });

    it('calls onComplete when clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskCompletionButton
            task={mockTask}
            onComplete={mockOnComplete}
            onUndoComplete={mockOnUndoComplete}
          />
        </TestWrapper>
      );

      const button = screen.getByTestId('task-completion-button');
      await user.click(button);

      expect(mockOnComplete).toHaveBeenCalledWith('1');
    });

    it('shows loading state', () => {
      render(
        <TestWrapper>
          <TaskCompletionButton task={mockTask} onComplete={mockOnComplete} loading />
        </TestWrapper>
      );

      const button = screen.getByTestId('task-completion-button');
      expect(button).toBeDisabled();
    });

    it('meets accessibility requirements for touch targets', () => {
      render(
        <TestWrapper>
          <TaskCompletionButton task={mockTask} onComplete={mockOnComplete} size="md" />
        </TestWrapper>
      );

      const button = screen.getByTestId('task-completion-button');

      // Should have minimum 44px touch target
      expect(button).toHaveStyle('min-width: 44px');
      expect(button).toHaveStyle('min-height: 44px');
    });
  });

  describe('Button Variant', () => {
    it('renders button variant correctly', () => {
      render(
        <TestWrapper>
          <TaskCompletionButton task={mockTask} onComplete={mockOnComplete} variant="button" />
        </TestWrapper>
      );

      const button = screen.getByTestId('task-completion-button');
      expect(button).toHaveTextContent('Just Done');
    });

    it('shows different text for completed task', () => {
      render(
        <TestWrapper>
          <TaskCompletionButton task={completedTask} onComplete={mockOnComplete} variant="button" />
        </TestWrapper>
      );

      const button = screen.getByTestId('task-completion-button');
      expect(button).toHaveTextContent('Mark as not done');
    });
  });

  describe('Undo Functionality', () => {
    it('does not show undo when showUndo is false', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskCompletionButton
            task={mockTask}
            onComplete={mockOnComplete}
            onUndoComplete={mockOnUndoComplete}
            showUndo={false}
          />
        </TestWrapper>
      );

      const button = screen.getByTestId('task-completion-button');

      await act(async () => {
        await user.click(button);
      });

      expect(mockOnComplete).toHaveBeenCalledWith('1');

      // Wait a bit to ensure no undo button appears
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Should not show undo button
      expect(screen.queryByTestId('undo-button')).not.toBeInTheDocument();
    });

    it('handles undo completion', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskCompletionButton
            task={mockTask}
            onComplete={mockOnComplete}
            onUndoComplete={mockOnUndoComplete}
            undoTimeout={1000}
          />
        </TestWrapper>
      );

      const button = screen.getByTestId('task-completion-button');

      await act(async () => {
        await user.click(button);
      });

      expect(mockOnComplete).toHaveBeenCalledWith('1');

      // Wait for undo button to appear in notification
      await waitFor(() => {
        expect(screen.getByTestId('undo-button')).toBeInTheDocument();
      });

      const undoButton = screen.getByTestId('undo-button');

      await act(async () => {
        await user.click(undoButton);
      });

      expect(mockOnUndoComplete).toHaveBeenCalledWith('1');
    });
  });

  describe('Error Handling', () => {
    it('handles completion errors gracefully', async () => {
      const user = userEvent.setup();
      const mockOnCompleteError = jest.fn().mockRejectedValue(new Error('Completion failed'));

      render(
        <TestWrapper>
          <TaskCompletionButton task={mockTask} onComplete={mockOnCompleteError} />
        </TestWrapper>
      );

      const button = screen.getByTestId('task-completion-button');
      await user.click(button);

      expect(mockOnCompleteError).toHaveBeenCalledWith('1');

      // Should show error notification
      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });
    });

    it('handles undo errors gracefully', async () => {
      const user = userEvent.setup();
      const mockOnUndoError = jest.fn().mockRejectedValue(new Error('Undo failed'));

      render(
        <TestWrapper>
          <TaskCompletionButton
            task={mockTask}
            onComplete={mockOnComplete}
            onUndoComplete={mockOnUndoError}
          />
        </TestWrapper>
      );

      const button = screen.getByTestId('task-completion-button');

      await act(async () => {
        await user.click(button);
      });

      await waitFor(() => {
        expect(screen.getByTestId('undo-button')).toBeInTheDocument();
      });

      const undoButton = screen.getByTestId('undo-button');

      await act(async () => {
        await user.click(undoButton);
      });

      expect(mockOnUndoError).toHaveBeenCalledWith('1');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <TestWrapper>
          <TaskCompletionButton task={mockTask} onComplete={mockOnComplete} />
        </TestWrapper>
      );

      const button = screen.getByTestId('task-completion-button');
      expect(button).toHaveAttribute('aria-label');
    });

    it('provides keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskCompletionButton task={mockTask} onComplete={mockOnComplete} />
        </TestWrapper>
      );

      const button = screen.getByTestId('task-completion-button');

      // Focus the button
      button.focus();
      expect(button).toHaveFocus();

      // Activate with Enter key
      await user.keyboard('{Enter}');
      expect(mockOnComplete).toHaveBeenCalledWith('1');
    });

    it('provides keyboard navigation with Space key', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskCompletionButton task={mockTask} onComplete={mockOnComplete} />
        </TestWrapper>
      );

      const button = screen.getByTestId('task-completion-button');

      // Focus the button
      button.focus();
      expect(button).toHaveFocus();

      // Activate with Space key
      await user.keyboard(' ');
      expect(mockOnComplete).toHaveBeenCalledWith('1');
    });
  });
});
