// Time commitment related constants
import type { TimeCommitment } from '@/types';

// Time commitment options with display labels and values in minutes
export const TIME_COMMITMENTS: Record<
  TimeCommitment,
  { label: string; minutes: number; circles: number }
> = {
  '15min': { label: '15 minutes', minutes: 15, circles: 1 },
  '30min': { label: '30 minutes', minutes: 30, circles: 2 },
  '1hr': { label: '1 hour', minutes: 60, circles: 3 },
  '2hrs': { label: '2 hours', minutes: 120, circles: 4 },
  '4hrs': { label: '4 hours', minutes: 240, circles: 5 },
  '5hrs+': { label: '5+ hours', minutes: 300, circles: 6 },
} as const;

// Ordered list of time commitments for display
export const TIME_COMMITMENT_ORDER: TimeCommitment[] = [
  '15min',
  '30min',
  '1hr',
  '2hrs',
  '4hrs',
  '5hrs+',
];

// Helper function to get time commitment display info
export function getTimeCommitmentInfo(commitment: TimeCommitment) {
  return TIME_COMMITMENTS[commitment];
}

// Helper function to get all time commitment options
export function getTimeCommitmentOptions() {
  return TIME_COMMITMENT_ORDER.map((commitment) => ({
    value: commitment,
    label: TIME_COMMITMENTS[commitment].label,
    minutes: TIME_COMMITMENTS[commitment].minutes,
    circles: TIME_COMMITMENTS[commitment].circles,
  }));
}
