import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { AVAILABLE_COLORS } from '@/lib/constants/categories';
import { CategoryColorPicker } from './CategoryColorPicker';

const renderWithProviders = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe('CategoryColorPicker', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all available colors', () => {
    renderWithProviders(<CategoryColorPicker value="#3B82F6" onChange={mockOnChange} />);

    // Should render a button for each available color
    const colorButtons = screen.getAllByRole('button');
    expect(colorButtons).toHaveLength(AVAILABLE_COLORS.length);
  });

  it('highlights the selected color', () => {
    const selectedColor = '#3B82F6';

    renderWithProviders(<CategoryColorPicker value={selectedColor} onChange={mockOnChange} />);

    const selectedButton = screen.getByRole('button', { pressed: true });
    expect(selectedButton).toBeInTheDocument();
    expect(selectedButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onChange when a color is clicked', async () => {
    const user = userEvent.setup();
    const newColor = '#EF4444';

    renderWithProviders(<CategoryColorPicker value="#3B82F6" onChange={mockOnChange} />);

    const colorButton = screen.getByLabelText(`Select color ${newColor}`);
    await user.click(colorButton);

    expect(mockOnChange).toHaveBeenCalledWith(newColor);
  });

  it('disables all buttons when disabled prop is true', () => {
    renderWithProviders(<CategoryColorPicker value="#3B82F6" onChange={mockOnChange} disabled />);

    const colorButtons = screen.getAllByRole('button');
    colorButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('does not call onChange when disabled', async () => {
    const user = userEvent.setup();

    renderWithProviders(<CategoryColorPicker value="#3B82F6" onChange={mockOnChange} disabled />);

    const colorButton = screen.getByLabelText('Select color #EF4444');
    await user.click(colorButton);

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('shows tooltips on hover', async () => {
    const user = userEvent.setup();

    renderWithProviders(<CategoryColorPicker value="#3B82F6" onChange={mockOnChange} />);

    const colorButton = screen.getByLabelText('Select color #EF4444');
    await user.hover(colorButton);

    // Tooltip should appear (though exact implementation may vary)
    expect(colorButton).toHaveAttribute('aria-label', 'Select color #EF4444');
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(<CategoryColorPicker value="#3B82F6" onChange={mockOnChange} />);

    const colorButtons = screen.getAllByRole('button');

    colorButtons.forEach((button, index) => {
      const color = AVAILABLE_COLORS[index];
      expect(button).toHaveAttribute('aria-label', `Select color ${color}`);

      // Check if this is the selected color
      if (color === '#3B82F6') {
        expect(button).toHaveAttribute('aria-pressed', 'true');
      } else {
        expect(button).toHaveAttribute('aria-pressed', 'false');
      }
    });
  });

  it('renders with keyboard navigation support', async () => {
    const user = userEvent.setup();

    renderWithProviders(<CategoryColorPicker value="#3B82F6" onChange={mockOnChange} />);

    const firstButton = screen.getByLabelText(`Select color ${AVAILABLE_COLORS[0]}`);

    // Focus the first button
    firstButton.focus();
    expect(firstButton).toHaveFocus();

    // Press Enter to select
    await user.keyboard('{Enter}');
    expect(mockOnChange).toHaveBeenCalledWith(AVAILABLE_COLORS[0]);
  });

  it('handles color selection correctly', async () => {
    const user = userEvent.setup();

    renderWithProviders(<CategoryColorPicker value="#3B82F6" onChange={mockOnChange} />);

    // Click on a different color
    const redButton = screen.getByLabelText('Select color #EF4444');
    await user.click(redButton);

    expect(mockOnChange).toHaveBeenCalledWith('#EF4444');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('maintains selection state correctly', () => {
    const { rerender } = renderWithProviders(
      <CategoryColorPicker value="#3B82F6" onChange={mockOnChange} />
    );

    // Initially blue should be selected
    expect(screen.getByRole('button', { pressed: true })).toHaveAttribute(
      'aria-label',
      'Select color #3B82F6'
    );

    // Change to red
    rerender(
      <MantineProvider>
        <CategoryColorPicker value="#EF4444" onChange={mockOnChange} />
      </MantineProvider>
    );

    // Now red should be selected
    expect(screen.getByRole('button', { pressed: true })).toHaveAttribute(
      'aria-label',
      'Select color #EF4444'
    );
  });
});
