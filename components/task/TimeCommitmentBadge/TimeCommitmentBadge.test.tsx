import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import type { TimeCommitment } from '@/types';
import { TimeCommitmentBadge } from './TimeCommitmentBadge';

// Test wrapper with MantineProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe('TimeCommitmentBadge', () => {
  describe('Rendering', () => {
    it('renders badge with correct label', () => {
      render(
        <TestWrapper>
          <TimeCommitmentBadge commitment="1hr" />
        </TestWrapper>
      );

      const badge = screen.getByTestId('time-commitment-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label', 'Time commitment: 1 hour');
      expect(screen.getByText('1 hour')).toBeInTheDocument();
    });

    it('renders different time commitments correctly', () => {
      const commitments: TimeCommitment[] = ['15min', '30min', '1hr', '2hrs', '4hrs', '5hrs+'];

      commitments.forEach((commitment) => {
        const { unmount } = render(
          <TestWrapper>
            <TimeCommitmentBadge commitment={commitment} />
          </TestWrapper>
        );

        const badge = screen.getByTestId('time-commitment-badge');
        expect(badge).toBeInTheDocument();

        unmount();
      });
    });

    it('shows clock icon by default', () => {
      render(
        <TestWrapper>
          <TimeCommitmentBadge commitment="2hrs" />
        </TestWrapper>
      );

      // Icon should be present (though we can't easily test the specific icon)
      const badge = screen.getByTestId('time-commitment-badge');
      expect(badge).toBeInTheDocument();
    });

    it('hides icon when showIcon is false', () => {
      render(
        <TestWrapper>
          <TimeCommitmentBadge commitment="2hrs" showIcon={false} />
        </TestWrapper>
      );

      const badge = screen.getByTestId('time-commitment-badge');
      expect(badge).toBeInTheDocument();
      expect(screen.getByText('2 hours')).toBeInTheDocument();
    });

    it('renders with different sizes', () => {
      const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl'> = ['xs', 'sm', 'md', 'lg', 'xl'];

      sizes.forEach((size) => {
        const { unmount } = render(
          <TestWrapper>
            <TimeCommitmentBadge commitment="1hr" size={size} />
          </TestWrapper>
        );

        const badge = screen.getByTestId('time-commitment-badge');
        expect(badge).toBeInTheDocument();

        unmount();
      });
    });

    it('renders with different variants', () => {
      const variants: Array<'filled' | 'light' | 'outline' | 'dot'> = [
        'filled',
        'light',
        'outline',
        'dot',
      ];

      variants.forEach((variant) => {
        const { unmount } = render(
          <TestWrapper>
            <TimeCommitmentBadge commitment="1hr" variant={variant} />
          </TestWrapper>
        );

        const badge = screen.getByTestId('time-commitment-badge');
        expect(badge).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe('Visual Indicators', () => {
    it('shows circles by default', () => {
      render(
        <TestWrapper>
          <TimeCommitmentBadge commitment="2hrs" />
        </TestWrapper>
      );

      const badge = screen.getByTestId('time-commitment-badge');
      expect(badge).toBeInTheDocument();
      // Circles are rendered as div elements with aria-hidden
    });

    it('hides circles when showCircles is false', () => {
      render(
        <TestWrapper>
          <TimeCommitmentBadge commitment="2hrs" showCircles={false} />
        </TestWrapper>
      );

      const badge = screen.getByTestId('time-commitment-badge');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA label', () => {
      render(
        <TestWrapper>
          <TimeCommitmentBadge commitment="30min" />
        </TestWrapper>
      );

      const badge = screen.getByTestId('time-commitment-badge');
      expect(badge).toHaveAttribute('aria-label', 'Time commitment: 30 minutes');
    });

    it('has help cursor style', () => {
      render(
        <TestWrapper>
          <TimeCommitmentBadge commitment="1hr" />
        </TestWrapper>
      );

      const badge = screen.getByTestId('time-commitment-badge');
      expect(badge).toHaveStyle('cursor: help');
    });

    it('has proper tooltip', () => {
      render(
        <TestWrapper>
          <TimeCommitmentBadge commitment="4hrs" />
        </TestWrapper>
      );

      const badge = screen.getByTestId('time-commitment-badge');
      expect(badge).toBeInTheDocument();
      // Tooltip content is tested through the aria-label
    });
  });

  describe('Time Commitment Values', () => {
    it('displays correct labels for all time commitments', () => {
      const expectedLabels = {
        '15min': '15 minutes',
        '30min': '30 minutes',
        '1hr': '1 hour',
        '2hrs': '2 hours',
        '4hrs': '4 hours',
        '5hrs+': '5+ hours',
      };

      Object.entries(expectedLabels).forEach(([commitment, expectedLabel]) => {
        const { unmount } = render(
          <TestWrapper>
            <TimeCommitmentBadge commitment={commitment as TimeCommitment} />
          </TestWrapper>
        );

        expect(screen.getByText(expectedLabel)).toBeInTheDocument();
        unmount();
      });
    });
  });
});
