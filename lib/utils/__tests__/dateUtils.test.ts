import {
  formatTimeElapsed,
  calculateNextDueDate,
  isTaskOverdue,
  getOverdueStatus,
  getTimeUntilDue,
  formatExpectedFrequency,
  wasCompletedToday,
  getCompletionTimeDescription,
} from '../dateUtils';
import type { Task, ExpectedFrequency } from '@/types';

// Mock task for testing
const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  name: 'Test Task',
  description: 'Test description',
  categoryId: 'cat-1',
  createdAt: new Date('2024-01-01'),
  lastCompletedAt: null,
  isArchived: false,
  notes: '',
  ...overrides,
});

describe('dateUtils', () => {
  const fixedDate = new Date('2024-01-15T12:00:00Z');

  beforeAll(() => {
    // Mock Date.now to return a fixed date for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(fixedDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('formatTimeElapsed', () => {
    it('returns "Not done yet" for null date', () => {
      expect(formatTimeElapsed(null)).toBe('Not done yet');
    });

    it('formats recent date correctly', () => {
      const recentDate = new Date('2024-01-14T12:00:00Z'); // 1 day ago
      const result = formatTimeElapsed(recentDate);
      expect(result).toContain('day ago');
    });

    it('handles invalid dates gracefully', () => {
      const invalidDate = new Date('invalid');
      const result = formatTimeElapsed(invalidDate);
      expect(result).toBe('Unknown');
    });
  });

  describe('calculateNextDueDate', () => {
    const lastCompleted = new Date('2024-01-10T12:00:00Z');

    it('calculates next due date for daily frequency', () => {
      const frequency: ExpectedFrequency = { value: 2, unit: 'day' };
      const result = calculateNextDueDate(lastCompleted, frequency);
      expect(result).toEqual(new Date('2024-01-12T12:00:00Z'));
    });

    it('calculates next due date for weekly frequency', () => {
      const frequency: ExpectedFrequency = { value: 1, unit: 'week' };
      const result = calculateNextDueDate(lastCompleted, frequency);
      expect(result).toEqual(new Date('2024-01-17T12:00:00Z'));
    });

    it('calculates next due date for monthly frequency', () => {
      const frequency: ExpectedFrequency = { value: 1, unit: 'month' };
      const result = calculateNextDueDate(lastCompleted, frequency);
      expect(result).toEqual(new Date('2024-02-10T12:00:00Z'));
    });

    it('calculates next due date for yearly frequency', () => {
      const frequency: ExpectedFrequency = { value: 1, unit: 'year' };
      const result = calculateNextDueDate(lastCompleted, frequency);
      expect(result).toEqual(new Date('2025-01-10T12:00:00Z'));
    });

    it('returns null for null lastCompletedAt', () => {
      const frequency: ExpectedFrequency = { value: 1, unit: 'day' };
      const result = calculateNextDueDate(null, frequency);
      expect(result).toBeNull();
    });

    it('returns null for undefined frequency', () => {
      const result = calculateNextDueDate(lastCompleted, undefined);
      expect(result).toBeNull();
    });
  });

  describe('isTaskOverdue', () => {
    it('returns false for task without frequency', () => {
      const task = createMockTask({
        lastCompletedAt: new Date('2024-01-10'),
      });
      expect(isTaskOverdue(task, fixedDate)).toBe(false);
    });

    it('returns false for task without completion date', () => {
      const task = createMockTask({
        expectedFrequency: { value: 1, unit: 'day' },
      });
      expect(isTaskOverdue(task, fixedDate)).toBe(false);
    });

    it('returns true for overdue task', () => {
      const task = createMockTask({
        lastCompletedAt: new Date('2024-01-10'), // 5 days ago
        expectedFrequency: { value: 2, unit: 'day' }, // Should be done every 2 days
      });
      expect(isTaskOverdue(task, fixedDate)).toBe(true);
    });

    it('returns false for task not yet due', () => {
      const task = createMockTask({
        lastCompletedAt: new Date('2024-01-14'), // 1 day ago
        expectedFrequency: { value: 3, unit: 'day' }, // Should be done every 3 days
      });
      expect(isTaskOverdue(task, fixedDate)).toBe(false);
    });
  });

  describe('getOverdueStatus', () => {
    it('returns complete overdue status for overdue task', () => {
      const task = createMockTask({
        lastCompletedAt: new Date('2024-01-10'),
        expectedFrequency: { value: 2, unit: 'day' },
      });
      
      const status = getOverdueStatus(task, fixedDate);
      
      expect(status.isOverdue).toBe(true);
      expect(status.nextDueDate).toEqual(new Date('2024-01-12T00:00:00.000Z'));
      expect(status.overdueBy).toContain('days');
      expect(status.lastCompleted).toContain('days ago');
    });

    it('returns status for non-overdue task', () => {
      const task = createMockTask({
        lastCompletedAt: new Date('2024-01-14'),
        expectedFrequency: { value: 3, unit: 'day' },
      });
      
      const status = getOverdueStatus(task, fixedDate);
      
      expect(status.isOverdue).toBe(false);
      expect(status.nextDueDate).toEqual(new Date('2024-01-17T00:00:00.000Z'));
      expect(status.overdueBy).toBeNull();
    });
  });

  describe('getTimeUntilDue', () => {
    it('returns time until due for upcoming task', () => {
      const task = createMockTask({
        lastCompletedAt: new Date('2024-01-14'),
        expectedFrequency: { value: 3, unit: 'day' },
      });
      
      const result = getTimeUntilDue(task, fixedDate);
      expect(result).toContain('in 1 day');
    });

    it('returns null for overdue task', () => {
      const task = createMockTask({
        lastCompletedAt: new Date('2024-01-10'),
        expectedFrequency: { value: 2, unit: 'day' },
      });
      
      const result = getTimeUntilDue(task, fixedDate);
      expect(result).toBeNull();
    });

    it('returns null for task without frequency', () => {
      const task = createMockTask({
        lastCompletedAt: new Date('2024-01-14'),
      });
      
      const result = getTimeUntilDue(task, fixedDate);
      expect(result).toBeNull();
    });
  });

  describe('formatExpectedFrequency', () => {
    it('formats singular frequency correctly', () => {
      const frequency: ExpectedFrequency = { value: 1, unit: 'day' };
      expect(formatExpectedFrequency(frequency)).toBe('Every 1 day');
    });

    it('formats plural frequency correctly', () => {
      const frequency: ExpectedFrequency = { value: 3, unit: 'week' };
      expect(formatExpectedFrequency(frequency)).toBe('Every 3 weeks');
    });

    it('handles month unit correctly', () => {
      const frequency: ExpectedFrequency = { value: 2, unit: 'month' };
      expect(formatExpectedFrequency(frequency)).toBe('Every 2 months');
    });
  });

  describe('wasCompletedToday', () => {
    it('returns true for task completed today', () => {
      const task = createMockTask({
        lastCompletedAt: new Date('2024-01-15T08:00:00Z'), // Same day as fixedDate
      });
      
      expect(wasCompletedToday(task, fixedDate)).toBe(true);
    });

    it('returns false for task completed yesterday', () => {
      const task = createMockTask({
        lastCompletedAt: new Date('2024-01-14T20:00:00Z'), // Previous day
      });
      
      expect(wasCompletedToday(task, fixedDate)).toBe(false);
    });

    it('returns false for task never completed', () => {
      const task = createMockTask();
      expect(wasCompletedToday(task, fixedDate)).toBe(false);
    });
  });

  describe('getCompletionTimeDescription', () => {
    it('returns "Never completed" for uncompleted task', () => {
      const task = createMockTask();
      expect(getCompletionTimeDescription(task)).toBe('Never completed');
    });

    it('returns "Just completed" for very recent completion', () => {
      const task = createMockTask({
        lastCompletedAt: new Date('2024-01-15T11:30:00Z'), // 30 minutes ago
      });
      
      expect(getCompletionTimeDescription(task)).toBe('Just completed');
    });

    it('returns "Completed today" for same-day completion', () => {
      const task = createMockTask({
        lastCompletedAt: new Date('2024-01-15T08:00:00Z'), // 4 hours ago
      });
      
      expect(getCompletionTimeDescription(task)).toBe('Completed today');
    });

    it('returns "Completed yesterday" for previous day completion', () => {
      const task = createMockTask({
        lastCompletedAt: new Date('2024-01-14T12:00:00Z'), // 24 hours ago
      });
      
      expect(getCompletionTimeDescription(task)).toBe('Completed yesterday');
    });

    it('returns relative time for older completions', () => {
      const task = createMockTask({
        lastCompletedAt: new Date('2024-01-10T12:00:00Z'), // 5 days ago
      });
      
      const result = getCompletionTimeDescription(task);
      expect(result).toContain('days ago');
    });
  });
});