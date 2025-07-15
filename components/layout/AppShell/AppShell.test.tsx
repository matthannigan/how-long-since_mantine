import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { theme } from '../../../theme';
import { AppShell } from './AppShell';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock useMediaQuery hook
jest.mock('@mantine/hooks', () => ({
  ...jest.requireActual('@mantine/hooks'),
  useDisclosure: () => [false, { toggle: jest.fn(), close: jest.fn() }],
  useMediaQuery: jest.fn(),
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>;

// Test wrapper with Mantine provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider theme={theme}>{children}</MantineProvider>
);

describe('AppShell', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
    mockUsePathname.mockReturnValue('/');
    jest.clearAllMocks();
  });

  it('should render app title', () => {
    render(
      <TestWrapper>
        <AppShell>
          <div>Test content</div>
        </AppShell>
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: 'How Long Since' })).toBeInTheDocument();
  });

  it('should render main content', () => {
    render(
      <TestWrapper>
        <AppShell>
          <div>Test content</div>
        </AppShell>
      </TestWrapper>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByLabelText('Main content')).toBeInTheDocument();
  });

  it('should render desktop navigation on large screens', () => {
    mockUseMediaQuery.mockReturnValue(false); // Desktop

    render(
      <TestWrapper>
        <AppShell>
          <div>Test content</div>
        </AppShell>
      </TestWrapper>
    );

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tasks' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  });

  it('should render mobile navigation on small screens', () => {
    mockUseMediaQuery.mockReturnValue(true); // Mobile

    render(
      <TestWrapper>
        <AppShell>
          <div>Test content</div>
        </AppShell>
      </TestWrapper>
    );

    expect(screen.getByRole('navigation', { name: 'Bottom navigation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tasks' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Task' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  });

  it('should show burger menu on mobile', () => {
    mockUseMediaQuery.mockReturnValue(true); // Mobile

    render(
      <TestWrapper>
        <AppShell>
          <div>Test content</div>
        </AppShell>
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: 'Toggle navigation menu' })).toBeInTheDocument();
  });

  it('should navigate when clicking navigation links', () => {
    mockUseMediaQuery.mockReturnValue(false); // Desktop

    render(
      <TestWrapper>
        <AppShell>
          <div>Test content</div>
        </AppShell>
      </TestWrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(mockPush).toHaveBeenCalledWith('/settings');
  });

  it('should navigate when clicking mobile navigation buttons', () => {
    mockUseMediaQuery.mockReturnValue(true); // Mobile

    render(
      <TestWrapper>
        <AppShell>
          <div>Test content</div>
        </AppShell>
      </TestWrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add Task' }));
    expect(mockPush).toHaveBeenCalledWith('/add-task');
  });

  it('should highlight active navigation item', () => {
    mockUseMediaQuery.mockReturnValue(false); // Desktop
    mockUsePathname.mockReturnValue('/settings');

    render(
      <TestWrapper>
        <AppShell>
          <div>Test content</div>
        </AppShell>
      </TestWrapper>
    );

    const settingsButton = screen.getByRole('button', { name: 'Settings' });
    expect(settingsButton).toHaveAttribute('aria-current', 'page');
  });

  it('should support keyboard navigation', () => {
    mockUseMediaQuery.mockReturnValue(false); // Desktop

    render(
      <TestWrapper>
        <AppShell>
          <div>Test content</div>
        </AppShell>
      </TestWrapper>
    );

    const settingsButton = screen.getByRole('button', { name: 'Settings' });

    // Test Enter key
    fireEvent.keyDown(settingsButton, { key: 'Enter' });
    expect(mockPush).toHaveBeenCalledWith('/settings');

    // Test Space key
    fireEvent.keyDown(settingsButton, { key: ' ' });
    expect(mockPush).toHaveBeenCalledTimes(2);
  });

  it('should have proper ARIA labels and roles', () => {
    render(
      <TestWrapper>
        <AppShell>
          <div>Test content</div>
        </AppShell>
      </TestWrapper>
    );

    expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
    expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
    expect(screen.getByLabelText('Main content')).toBeInTheDocument();
  });

  it('should meet minimum touch target requirements', () => {
    mockUseMediaQuery.mockReturnValue(true); // Mobile

    render(
      <TestWrapper>
        <AppShell>
          <div>Test content</div>
        </AppShell>
      </TestWrapper>
    );

    const addTaskButton = screen.getByRole('button', { name: 'Add Task' });

    // Check that the button exists and has proper classes for touch targets
    expect(addTaskButton).toBeInTheDocument();
    expect(addTaskButton).toHaveClass('bottomNavItem');
  });

  it('should handle responsive layout changes', async () => {
    // Start with desktop
    mockUseMediaQuery.mockReturnValue(false);

    const { rerender } = render(
      <TestWrapper>
        <AppShell>
          <div>Test content</div>
        </AppShell>
      </TestWrapper>
    );

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Bottom navigation' })).not.toBeInTheDocument();

    // Switch to mobile
    mockUseMediaQuery.mockReturnValue(true);

    rerender(
      <TestWrapper>
        <AppShell>
          <div>Test content</div>
        </AppShell>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: 'Bottom navigation' })).toBeInTheDocument();
    });
  });

  it('should have semantic HTML structure', () => {
    render(
      <TestWrapper>
        <AppShell>
          <div>Test content</div>
        </AppShell>
      </TestWrapper>
    );

    // Check for proper semantic elements
    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getByRole('main')).toBeInTheDocument(); // main
    expect(screen.getByRole('navigation')).toBeInTheDocument(); // nav
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument(); // h1
  });
});
