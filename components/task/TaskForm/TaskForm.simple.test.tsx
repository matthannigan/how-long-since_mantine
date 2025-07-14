import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { TaskForm } from './TaskForm';
import type { Category } from '@/types';

// Mock categories for testing
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Kitchen',
    color: '#3B82F6',
    icon: 'utensils',
    isDefault: true,
    order: 1,
  },
];

// Test wrapper with MantineProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe('TaskForm Basic Tests', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    categories: mockCategories,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    mode: 'create' as const,
  };

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <TaskForm {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Create New Task')).toBeInTheDocument();
  });

  it('renders form fields', () => {
    render(
      <TestWrapper>
        <TaskForm {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('task-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('task-category-select')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
  });
});