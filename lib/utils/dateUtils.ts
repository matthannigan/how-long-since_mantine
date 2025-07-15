import { addDays, addMonths, addWeeks, addYears, formatDistanceToNow, isAfter } from 'date-fns';
import type { ExpectedFrequency, Task } from '@/types';

/**
 * Format time elapsed since a date in human-readable format
 */
export function formatTimeElapsed(date: Date | null): string {
  if (!date) {
    return 'Not done yet';
  }

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Unknown';
  }

  try {
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    // Error logged for debugging purposes
    // eslint-disable-next-line no-console
    console.error('Error formatting time elapsed:', error);
    return 'Unknown';
  }
}

/**
 * Calculate the next due date based on last completion and expected frequency
 */
export function calculateNextDueDate(
  lastCompletedAt: Date | null,
  expectedFrequency: ExpectedFrequency | undefined
): Date | null {
  if (!lastCompletedAt || !expectedFrequency) {
    return null;
  }

  const { value, unit } = expectedFrequency;

  try {
    switch (unit) {
      case 'day':
        return addDays(lastCompletedAt, value);
      case 'week':
        return addWeeks(lastCompletedAt, value);
      case 'month':
        return addMonths(lastCompletedAt, value);
      case 'year':
        return addYears(lastCompletedAt, value);
      default:
        return null;
    }
  } catch (error) {
    // Error logged for debugging purposes
    // eslint-disable-next-line no-console
    console.error('Error calculating next due date:', error);
    return null;
  }
}

/**
 * Check if a task is overdue based on expected frequency
 */
export function isTaskOverdue(task: Task, currentDate: Date = new Date()): boolean {
  if (!task.expectedFrequency || !task.lastCompletedAt) {
    return false;
  }

  const nextDueDate = calculateNextDueDate(task.lastCompletedAt, task.expectedFrequency);

  if (!nextDueDate) {
    return false;
  }

  return isAfter(currentDate, nextDueDate);
}

/**
 * Get overdue status with additional information
 */
export function getOverdueStatus(task: Task, currentDate: Date = new Date()) {
  const isOverdue = isTaskOverdue(task, currentDate);
  const nextDueDate = calculateNextDueDate(task.lastCompletedAt, task.expectedFrequency);

  let overdueBy: string | null = null;

  if (isOverdue && nextDueDate) {
    try {
      overdueBy = formatDistanceToNow(nextDueDate, { addSuffix: false });
    } catch (error) {
      // Error logged for debugging purposes
      // eslint-disable-next-line no-console
      console.error('Error calculating overdue duration:', error);
    }
  }

  return {
    isOverdue,
    nextDueDate,
    overdueBy,
    lastCompleted: task.lastCompletedAt ? formatTimeElapsed(task.lastCompletedAt) : null,
  };
}

/**
 * Get time until next due date
 */
export function getTimeUntilDue(task: Task, currentDate: Date = new Date()): string | null {
  const nextDueDate = calculateNextDueDate(task.lastCompletedAt, task.expectedFrequency);

  if (!nextDueDate) {
    return null;
  }

  if (isAfter(currentDate, nextDueDate)) {
    return null; // Already overdue
  }

  try {
    return formatDistanceToNow(nextDueDate, { addSuffix: true });
  } catch (error) {
    // Error logged for debugging purposes
    // eslint-disable-next-line no-console
    console.error('Error calculating time until due:', error);
    return null;
  }
}

/**
 * Format expected frequency in human-readable format
 */
export function formatExpectedFrequency(frequency: ExpectedFrequency): string {
  const { value, unit } = frequency;

  let unitLabel: string;
  if (value === 1) {
    unitLabel = unit;
  } else {
    unitLabel = `${unit}s`;
  }

  return `Every ${value} ${unitLabel}`;
}

/**
 * Get completion streak for a task (how many times completed in expected frequency periods)
 */
export function getCompletionStreak(task: Task): number {
  // This would require completion history, which isn't in our current data model
  // For now, return 1 if completed, 0 if not
  return task.lastCompletedAt ? 1 : 0;
}

/**
 * Check if a task was completed today
 */
export function wasCompletedToday(task: Task, currentDate: Date = new Date()): boolean {
  if (!task.lastCompletedAt) {
    return false;
  }

  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const completedAt = new Date(task.lastCompletedAt);

  return completedAt >= today && completedAt < tomorrow;
}

/**
 * Get relative time description for task completion
 */
export function getCompletionTimeDescription(task: Task): string {
  if (!task.lastCompletedAt) {
    return 'Never completed';
  }

  const now = new Date();
  const completedAt = new Date(task.lastCompletedAt);
  const diffInHours = (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return 'Just completed';
  }
  if (diffInHours < 24) {
    return 'Completed today';
  }
  if (diffInHours < 48) {
    return 'Completed yesterday';
  }
  return formatTimeElapsed(completedAt);
}
