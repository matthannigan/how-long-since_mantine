import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import type { TimeCommitment } from '@/types';
import { TimeCommitmentFilter, TimeCommitmentPresets } from './TimeCommitmentFilter';

// Test wrapper with Mantine provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe('TimeCommitmentFilter Component', () => {
  const defaultProps = {
    selectedCommitments: [] as TimeCommitment[],
    onCommitmentToggle: jest.fn(),
    onClearAll: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders all time commitment options', () => {
      render(
        <TestWrapper>
          <TimeCommitmentFilter {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('15 minutes')).toBeInTheDocument();
      expect(screen.getByText('30 minutes')).toBeInTheDocument();
      expect(screen.getByText('1 hour')).toBeInTheDocument();
      expect(screen.getByText('2 hours')).toBeInTheDocument();
      expect(screen.getByText('4 hours')).toBeInTheDocument();
      expect(screen.getByText('5+ hours')).toBeInTheDocument();
    });

    it('shows filter header with icon', () => {
      render(
        <TestWrapper>
          <TimeCommitmentFilter {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Filter by Time')).toBeInTheDocument();
    });

    it('calls onCommitmentToggle when a commitment button is clicked', () => {
      const onCommitmentToggle = jest.fn();

      render(
        <TestWrapper>
          <TimeCommitmentFilter {...defaultProps} onCommitmentToggle={onCommitmentToggle} />
        </TestWrapper>
      );

      const button = screen.getByTestId('time-filter-15min');
      fireEvent.click(button);

      expect(onCommitmentToggle).toHaveBeenCalledWith('15min');
    });

    it('shows selected commitments as filled buttons', () => {
      render(
        <TestWrapper>
          <TimeCommitmentFilter {...defaultProps} selectedCommitments={['15min', '1hr']} />
        </TestWrapper>
      );

      const fifteenMinButton = screen.getByTestId('time-filter-15min');
      const oneHourButton = screen.getByTestId('time-filter-1hr');
      const thirtyMinButton = screen.getByTestId('time-filter-30min');

      expect(fifteenMinButton).toHaveAttribute('aria-pressed', 'true');
      expect(oneHourButton).toHaveAttribute('aria-pressed', 'true');
      expect(thirtyMinButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Task Counts', () => {
    const commitmentCounts = {
      '15min': 3,
      '30min': 2,
      '1hr': 5,
      '2hrs': 1,
      '4hrs': 0,
      '5hrs+': 2,
      unknown: 4,
    } as const;

    it('displays task counts when showCounts is true', () => {
      render(
        <TestWrapper>
          <TimeCommitmentFilter {...defaultProps} showCounts commitmentCounts={commitmentCounts} />
        </TestWrapper>
      );

      // Check that counts are displayed as badges
      expect(screen.getByText('3')).toBeInTheDocument(); // 15min count
      expect(screen.getAllByText('2')).toHaveLength(2); // 30min count and 5hrs+ count
      expect(screen.getByText('5')).toBeInTheDocument(); // 1hr count
    });

    it('shows unknown time commitment filter when there are unknown tasks', () => {
      render(
        <TestWrapper>
          <TimeCommitmentFilter {...defaultProps} showCounts commitmentCounts={commitmentCounts} />
        </TestWrapper>
      );

      expect(screen.getByTestId('time-filter-unknown')).toBeInTheDocument();
      expect(screen.getByText('Time Unknown')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument(); // unknown count
    });

    it('does not show unknown filter when there are no unknown tasks', () => {
      const countsWithoutUnknown = { ...commitmentCounts, unknown: 0 };

      render(
        <TestWrapper>
          <TimeCommitmentFilter
            {...defaultProps}
            showCounts
            commitmentCounts={countsWithoutUnknown}
          />
        </TestWrapper>
      );

      expect(screen.queryByTestId('time-filter-unknown')).not.toBeInTheDocument();
    });
  });

  describe('Active Filters', () => {
    it('shows clear all button when filters are active', () => {
      render(
        <TestWrapper>
          <TimeCommitmentFilter {...defaultProps} selectedCommitments={['15min', '1hr']} />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Clear all time commitment filters')).toBeInTheDocument();
    });

    it('does not show clear all button when no filters are active', () => {
      render(
        <TestWrapper>
          <TimeCommitmentFilter {...defaultProps} selectedCommitments={[]} />
        </TestWrapper>
      );

      expect(screen.queryByLabelText('Clear all time commitment filters')).not.toBeInTheDocument();
    });

    it('calls onClearAll when clear button is clicked', () => {
      const onClearAll = jest.fn();

      render(
        <TestWrapper>
          <TimeCommitmentFilter
            {...defaultProps}
            selectedCommitments={['15min']}
            onClearAll={onClearAll}
          />
        </TestWrapper>
      );

      const clearButton = screen.getByLabelText('Clear all time commitment filters');
      fireEvent.click(clearButton);

      expect(onClearAll).toHaveBeenCalled();
    });

    it('displays active filters section when filters are selected', () => {
      render(
        <TestWrapper>
          <TimeCommitmentFilter {...defaultProps} selectedCommitments={['15min', '2hrs']} />
        </TestWrapper>
      );

      expect(screen.getByText('Active filters:')).toBeInTheDocument();
    });

    it('allows removing individual filters from active filters section', () => {
      const onCommitmentToggle = jest.fn();

      render(
        <TestWrapper>
          <TimeCommitmentFilter
            {...defaultProps}
            selectedCommitments={['15min', '2hrs']}
            onCommitmentToggle={onCommitmentToggle}
          />
        </TestWrapper>
      );

      // Find the remove button in the active filters section (the small X button)
      const removeButtons = screen.getAllByLabelText('Remove 15 minutes filter');
      const badgeRemoveButton = removeButtons.find(
        (button) => button.getAttribute('data-size') === 'xs'
      );

      expect(badgeRemoveButton).toBeDefined();
      fireEvent.click(badgeRemoveButton!);

      expect(onCommitmentToggle).toHaveBeenCalledWith('15min');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for buttons', () => {
      render(
        <TestWrapper>
          <TimeCommitmentFilter {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Add 15 minutes filter')).toBeInTheDocument();
      expect(screen.getByLabelText('Add 30 minutes filter')).toBeInTheDocument();
    });

    it('updates ARIA labels based on selection state', () => {
      render(
        <TestWrapper>
          <TimeCommitmentFilter {...defaultProps} selectedCommitments={['15min']} />
        </TestWrapper>
      );

      // There will be multiple "Remove 15 minutes filter" buttons (main button + badge button)
      expect(screen.getAllByLabelText('Remove 15 minutes filter')).toHaveLength(2);
      expect(screen.getByLabelText('Add 30 minutes filter')).toBeInTheDocument();
    });

    it('includes task counts in ARIA labels when available', () => {
      const commitmentCounts = {
        '15min': 3,
        '30min': 2,
        '1hr': 5,
        '2hrs': 1,
        '4hrs': 0,
        '5hrs+': 2,
        unknown: 4,
      } as const;

      render(
        <TestWrapper>
          <TimeCommitmentFilter {...defaultProps} showCounts commitmentCounts={commitmentCounts} />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Add 15 minutes filter (3 tasks)')).toBeInTheDocument();
    });

    it('announces filter changes to screen readers', () => {
      render(
        <TestWrapper>
          <TimeCommitmentFilter {...defaultProps} selectedCommitments={['15min', '1hr']} />
        </TestWrapper>
      );

      const announcement = screen.getByText(/Filtering by 2 time commitments: 15 minutes, 1 hour/);
      expect(announcement).toHaveClass('sr-only');
      expect(announcement).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Disabled State', () => {
    it('disables all buttons when disabled prop is true', () => {
      render(
        <TestWrapper>
          <TimeCommitmentFilter {...defaultProps} disabled />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Compact Mode', () => {
    it('renders in compact mode when compact prop is true', () => {
      render(
        <TestWrapper>
          <TimeCommitmentFilter {...defaultProps} compact />
        </TestWrapper>
      );

      // This is harder to test directly, but we can verify the component renders
      expect(screen.getByText('Filter by Time')).toBeInTheDocument();
    });
  });
});

describe('TimeCommitmentPresets Component', () => {
  const defaultProps = {
    onPresetSelect: jest.fn(),
    selectedCommitments: [] as TimeCommitment[],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders preset buttons', () => {
    render(
      <TestWrapper>
        <TimeCommitmentPresets {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Quick Tasks (≤30min)')).toBeInTheDocument();
    expect(screen.getByText('Medium Tasks (1-2hrs)')).toBeInTheDocument();
    expect(screen.getByText('Long Tasks (4hrs+)')).toBeInTheDocument();
  });

  it('calls onPresetSelect when preset button is clicked', () => {
    const onPresetSelect = jest.fn();

    render(
      <TestWrapper>
        <TimeCommitmentPresets {...defaultProps} onPresetSelect={onPresetSelect} />
      </TestWrapper>
    );

    const quickButton = screen.getByTestId('preset-quick');
    fireEvent.click(quickButton);

    expect(onPresetSelect).toHaveBeenCalledWith(['15min', '30min']);
  });

  it('shows active preset as filled button', () => {
    render(
      <TestWrapper>
        <TimeCommitmentPresets {...defaultProps} selectedCommitments={['15min', '30min']} />
      </TestWrapper>
    );

    const quickButton = screen.getByTestId('preset-quick');
    expect(quickButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('disables buttons when disabled prop is true', () => {
    render(
      <TestWrapper>
        <TimeCommitmentPresets {...defaultProps} disabled />
      </TestWrapper>
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});
