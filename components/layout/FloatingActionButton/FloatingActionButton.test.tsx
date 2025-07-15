import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
// Import the mocked hook to access it in tests
import { useMediaQuery } from '@mantine/hooks';
import { render } from '../../../test-utils';
import { FloatingActionButton } from './FloatingActionButton';

// Mock Mantine hooks
jest.mock('@mantine/hooks', () => ({
  ...jest.requireActual('@mantine/hooks'),
  useMediaQuery: jest.fn(),
}));

// Mock navigator.vibrate
const mockVibrate = jest.fn();
Object.defineProperty(navigator, 'vibrate', {
  value: mockVibrate,
  writable: true,
});

const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>;

describe('FloatingActionButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    mockUseMediaQuery.mockReturnValue(false); // Desktop

    render(<FloatingActionButton onClick={mockOnClick} />);

    const button = screen.getByTestId('floating-action-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Add Task');
  });

  it('calls onClick when clicked', () => {
    mockUseMediaQuery.mockReturnValue(false); // Desktop

    render(<FloatingActionButton onClick={mockOnClick} />);

    const button = screen.getByTestId('floating-action-button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalled();
    expect(mockVibrate).toHaveBeenCalledWith([20]); // Medium haptic feedback
  });

  it('does not call onClick when disabled', () => {
    mockUseMediaQuery.mockReturnValue(false); // Desktop

    render(<FloatingActionButton onClick={mockOnClick} disabled />);

    const button = screen.getByTestId('floating-action-button');
    fireEvent.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
    expect(mockVibrate).not.toHaveBeenCalled();
  });

  it('supports keyboard navigation with Enter key', () => {
    mockUseMediaQuery.mockReturnValue(false); // Desktop

    render(<FloatingActionButton onClick={mockOnClick} />);

    const button = screen.getByTestId('floating-action-button');
    fireEvent.keyDown(button, { key: 'Enter' });

    expect(mockOnClick).toHaveBeenCalled();
    // Note: Haptic feedback is only triggered on click, not keyboard events
  });

  it('supports keyboard navigation with Space key', () => {
    mockUseMediaQuery.mockReturnValue(false); // Desktop

    render(<FloatingActionButton onClick={mockOnClick} />);

    const button = screen.getByTestId('floating-action-button');
    fireEvent.keyDown(button, { key: ' ' });

    expect(mockOnClick).toHaveBeenCalled();
    // Note: Haptic feedback is only triggered on click, not keyboard events
  });

  it('does not trigger on other keys', () => {
    mockUseMediaQuery.mockReturnValue(false); // Desktop

    render(<FloatingActionButton onClick={mockOnClick} />);

    const button = screen.getByTestId('floating-action-button');
    fireEvent.keyDown(button, { key: 'Tab' });

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('does not trigger keyboard events when disabled', () => {
    mockUseMediaQuery.mockReturnValue(false); // Desktop

    render(<FloatingActionButton onClick={mockOnClick} disabled />);

    const button = screen.getByTestId('floating-action-button');
    fireEvent.keyDown(button, { key: 'Enter' });

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('uses custom aria-label when provided', () => {
    mockUseMediaQuery.mockReturnValue(false); // Desktop

    render(
      <FloatingActionButton
        onClick={mockOnClick}
        label="Default Label"
        aria-label="Custom Aria Label"
      />
    );

    const button = screen.getByTestId('floating-action-button');
    expect(button).toHaveAttribute('aria-label', 'Custom Aria Label');
  });

  it('adjusts size for mobile', () => {
    mockUseMediaQuery.mockReturnValue(true); // Mobile

    render(<FloatingActionButton onClick={mockOnClick} />);

    const button = screen.getByTestId('floating-action-button');
    expect(button).toBeInTheDocument();
    // Size adjustment is handled via CSS classes, so we just verify it renders
  });

  it('adjusts size for desktop', () => {
    mockUseMediaQuery.mockReturnValue(false); // Desktop

    render(<FloatingActionButton onClick={mockOnClick} />);

    const button = screen.getByTestId('floating-action-button');
    expect(button).toBeInTheDocument();
    // Size adjustment is handled via CSS classes, so we just verify it renders
  });

  it('handles keyboard events properly', () => {
    mockUseMediaQuery.mockReturnValue(false); // Desktop

    render(<FloatingActionButton onClick={mockOnClick} />);

    const button = screen.getByTestId('floating-action-button');

    // Test that both Enter and Space trigger the onClick
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(button, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);

    // Test that other keys don't trigger onClick
    fireEvent.keyDown(button, { key: 'Tab' });
    expect(mockOnClick).toHaveBeenCalledTimes(2); // Should still be 2
  });
});
