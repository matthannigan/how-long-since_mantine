// Date and time utility functions
import { differenceInDays, formatDistanceToNow, isThisWeek, isToday, isYesterday } from 'date-fns';
import type { ExpectedFrequency } from '@/types';

/**
 * Format time elapsed since a date in human-readable format
 */
export function formatTimeElapsed(date: Date | null): string {
  if (!date) {
    return 'Not done yet';
  }

  const now = new Date();

  // Handle very recent completions
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  if (diffInMinutes < 60) {
    return 'Just now';
  }

  // Use date-fns for human-readable formatting
  try {
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error formatting date:', error);
    return 'Unknown';
  }
}

/**
 * Get a more detailed time elapsed description
 */
export function getTimeElapsedCategory(
  date: Date | null
): 'just-now' | 'today' | 'yesterday' | 'this-week' | 'older' | 'never' {
  if (!date) {
    return 'never';
  }

  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 60) {
    return 'just-now';
  }

  if (isToday(date)) {
    return 'today';
  }

  if (isYesterday(date)) {
    return 'yesterday';
  }

  if (isThisWeek(date)) {
    return 'this-week';
  }

  return 'older';
}

/**
 * Calculate if a task is overdue based on expected frequency
 */
export function isTaskOverdue(
  lastCompletedAt: Date | null,
  expectedFrequency?: ExpectedFrequency
): boolean {
  if (!expectedFrequency || !lastCompletedAt) {
    return false;
  }

  const now = new Date();
  const daysSinceCompletion = differenceInDays(now, lastCompletedAt);

  // Convert expected frequency to days
  let expectedDays: number;
  switch (expectedFrequency.unit) {
    case 'day':
      expectedDays = expectedFrequency.value;
      break;
    case 'week':
      expectedDays = expectedFrequency.value * 7;
      break;
    case 'month':
      expectedDays = expectedFrequency.value * 30; // Approximate
      break;
    case 'year':
      expectedDays = expectedFrequency.value * 365; // Approximate
      break;
    default:
      return false;
  }

  return daysSinceCompletion > expectedDays;
}

/**
 * Calculate days until a task becomes overdue
 */
export function getDaysUntilOverdue(
  lastCompletedAt: Date | null,
  expectedFrequency?: ExpectedFrequency
): number | null {
  if (!expectedFrequency || !lastCompletedAt) {
    return null;
  }

  const now = new Date();
  const daysSinceCompletion = differenceInDays(now, lastCompletedAt);

  // Convert expected frequency to days
  let expectedDays: number;
  switch (expectedFrequency.unit) {
    case 'day':
      expectedDays = expectedFrequency.value;
      break;
    case 'week':
      expectedDays = expectedFrequency.value * 7;
      break;
    case 'month':
      expectedDays = expectedFrequency.value * 30;
      break;
    case 'year':
      expectedDays = expectedFrequency.value * 365;
      break;
    default:
      return null;
  }

  return expectedDays - daysSinceCompletion;
}

/**
 * Format expected frequency for display
 */
export function formatExpectedFrequency(frequency: ExpectedFrequency): string {
  const { value, unit } = frequency;

  if (value === 1) {
    switch (unit) {
      case 'day':
        return 'Daily';
      case 'week':
        return 'Weekly';
      case 'month':
        return 'Monthly';
      case 'year':
        return 'Yearly';
    }
  }

  const unitLabel =
    unit === 'day' ? 'days' : unit === 'week' ? 'weeks' : unit === 'month' ? 'months' : 'years';

  return `Every ${value} ${unitLabel}`;
}

/**
 * Get the next expected completion date
 */
export function getNextExpectedDate(
  lastCompletedAt: Date | null,
  expectedFrequency?: ExpectedFrequency
): Date | null {
  if (!expectedFrequency || !lastCompletedAt) {
    return null;
  }

  const nextDate = new Date(lastCompletedAt);

  switch (expectedFrequency.unit) {
    case 'day':
      nextDate.setDate(nextDate.getDate() + expectedFrequency.value);
      break;
    case 'week':
      nextDate.setDate(nextDate.getDate() + expectedFrequency.value * 7);
      break;
    case 'month':
      nextDate.setMonth(nextDate.getMonth() + expectedFrequency.value);
      break;
    case 'year':
      nextDate.setFullYear(nextDate.getFullYear() + expectedFrequency.value);
      break;
  }

  return nextDate;
}
