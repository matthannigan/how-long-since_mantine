// Test the project foundation setup
import { describe, expect, it } from '@jest/globals';
import { CATEGORY_COLORS, TIME_COMMITMENTS } from '@/lib/constants';
import { formatTimeElapsed, isTaskOverdue } from '@/lib/utils';
import { validateTask } from '@/lib/validation';

describe('Project Foundation Setup', () => {
  describe('Type Validation', () => {
    it('should validate task data correctly', () => {
      const validTask = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Task',
        description: 'Test description',
        categoryId: '123e4567-e89b-12d3-a456-426614174001',
        createdAt: new Date(),
        lastCompletedAt: null,
        isArchived: false,
        notes: '',
      };

      const result = validateTask(validTask);
      expect(result.success).toBe(true);
    });

    it('should reject invalid task data', () => {
      const invalidTask = {
        name: '', // Empty name should fail
        categoryId: 'invalid-uuid',
      };

      const result = validateTask(invalidTask);
      expect(result.success).toBe(false);
    });
  });

  describe('Date Utilities', () => {
    it('should format time elapsed correctly', () => {
      const result = formatTimeElapsed(null);
      expect(result).toBe('Not done yet');
    });

    it('should detect overdue tasks', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10); // 10 days ago

      const frequency = { value: 7, unit: 'day' as const };
      const isOverdue = isTaskOverdue(pastDate, frequency);

      expect(isOverdue).toBe(true);
    });
  });

  describe('Constants', () => {
    it('should have time commitment definitions', () => {
      expect(TIME_COMMITMENTS['15min']).toBeDefined();
      expect(TIME_COMMITMENTS['15min'].minutes).toBe(15);
      expect(TIME_COMMITMENTS['15min'].circles).toBe(1);
    });

    it('should have category colors', () => {
      expect(CATEGORY_COLORS.KITCHEN).toBe('#3B82F6');
      expect(CATEGORY_COLORS.PETS).toBe('#F97316');
    });
  });
});
