import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
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

// Test wrapper with MantineProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe('TaskCard Basic Tests', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    task: mockTask,
    category: mockCategory,
    onComplete: mockOnComplete,
  };

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <TaskCard {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('task-card')).toBeInTheDocument();
  });

  it('displays task information', () => {
    render(
      <TestWrapper>
        <TaskCard {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Clean the dishes')).toBeInTheDocument();
    expect(screen.getByText('Wash all dishes in the sink')).toBeInTheDocument();
    expect(screen.getByText('Use hot water and soap')).toBeInTheDocument();
  });

  it('shows category badge', () => {
    render(
      <TestWrapper>
        <TaskCard {...defaultProps} />
      </TestWrapper>
    );

    const categoryBadge = screen.getByTestId('category-badge');
    expect(categoryBadge).toBeInTheDocument();
    expect(categoryBadge).toHaveTextContent('Kitchen');
  });

  it('shows time commitment badge', () => {
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

  it('has proper accessibility attributes', () => {
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
});
