// Database schema and validation tests
import { validateAppSettings, validateCategory, validateTask } from '@/lib/validation/schemas';
import type { AppSettings, Category, Task } from '@/types';
import { DEFAULT_CATEGORIES, runMigrations } from '../migrations';

describe('Database Schema and Validation', () => {
  describe('Default Categories', () => {
    it('should have correct default categories', () => {
      expect(DEFAULT_CATEGORIES).toHaveLength(10);
      expect(DEFAULT_CATEGORIES.find((cat) => cat.name === 'Kitchen')).toBeDefined();
      expect(DEFAULT_CATEGORIES.find((cat) => cat.name === 'Bathroom')).toBeDefined();
      expect(DEFAULT_CATEGORIES.find((cat) => cat.name === 'Bedroom')).toBeDefined();
      expect(DEFAULT_CATEGORIES.find((cat) => cat.name === 'Living Areas')).toBeDefined();
      expect(DEFAULT_CATEGORIES.find((cat) => cat.name === 'Exterior')).toBeDefined();
      expect(DEFAULT_CATEGORIES.find((cat) => cat.name === 'Vehicles')).toBeDefined();
      expect(DEFAULT_CATEGORIES.find((cat) => cat.name === 'Digital/Tech')).toBeDefined();
      expect(DEFAULT_CATEGORIES.find((cat) => cat.name === 'Health')).toBeDefined();
      expect(DEFAULT_CATEGORIES.find((cat) => cat.name === 'Garden/Plants')).toBeDefined();
      expect(DEFAULT_CATEGORIES.find((cat) => cat.name === 'Pets')).toBeDefined();
    });

    it('should have all default categories marked as default', () => {
      expect(DEFAULT_CATEGORIES.every((cat) => cat.isDefault)).toBe(true);
    });

    it('should have valid colors for all default categories', () => {
      const hexColorRegex = /^#[0-9A-F]{6}$/i;
      expect(DEFAULT_CATEGORIES.every((cat) => hexColorRegex.test(cat.color))).toBe(true);
    });
  });

  describe('Task Validation', () => {
    const validCategoryId = crypto.randomUUID();

    it('should validate a correct task', () => {
      const task: Task = {
        id: crypto.randomUUID(),
        name: 'Test Task',
        description: 'Test description',
        categoryId: validCategoryId,
        createdAt: new Date(),
        lastCompletedAt: null,
        isArchived: false,
        notes: 'Test notes',
      };

      const result = validateTask(task);
      expect(result.success).toBe(true);
    });

    it('should reject task with empty name', () => {
      const task: Task = {
        id: crypto.randomUUID(),
        name: '', // Invalid: empty name
        description: 'Test description',
        categoryId: validCategoryId,
        createdAt: new Date(),
        lastCompletedAt: null,
        isArchived: false,
        notes: '',
      };

      const result = validateTask(task);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes('name'))).toBe(true);
      }
    });

    it('should reject task with name too long', () => {
      const task: Task = {
        id: crypto.randomUUID(),
        name: 'a'.repeat(129), // Invalid: too long
        description: 'Test description',
        categoryId: validCategoryId,
        createdAt: new Date(),
        lastCompletedAt: null,
        isArchived: false,
        notes: '',
      };

      const result = validateTask(task);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes('name'))).toBe(true);
      }
    });

    it('should reject task with invalid category ID', () => {
      const task: Task = {
        id: crypto.randomUUID(),
        name: 'Test Task',
        description: 'Test description',
        categoryId: 'invalid-uuid', // Invalid UUID
        createdAt: new Date(),
        lastCompletedAt: null,
        isArchived: false,
        notes: '',
      };

      const result = validateTask(task);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes('categoryId'))).toBe(true);
      }
    });

    it('should accept task with valid expected frequency', () => {
      const task: Task = {
        id: crypto.randomUUID(),
        name: 'Test Task',
        description: 'Test description',
        categoryId: validCategoryId,
        createdAt: new Date(),
        lastCompletedAt: null,
        expectedFrequency: {
          value: 7,
          unit: 'day',
        },
        isArchived: false,
        notes: '',
      };

      const result = validateTask(task);
      expect(result.success).toBe(true);
    });

    it('should accept task with valid time commitment', () => {
      const task: Task = {
        id: crypto.randomUUID(),
        name: 'Test Task',
        description: 'Test description',
        categoryId: validCategoryId,
        createdAt: new Date(),
        lastCompletedAt: null,
        timeCommitment: '1hr',
        isArchived: false,
        notes: '',
      };

      const result = validateTask(task);
      expect(result.success).toBe(true);
    });

    it('should reject task with invalid time commitment', () => {
      const task = {
        id: crypto.randomUUID(),
        name: 'Test Task',
        description: 'Test description',
        categoryId: validCategoryId,
        createdAt: new Date(),
        lastCompletedAt: null,
        timeCommitment: 'invalid-time', // Invalid time commitment
        isArchived: false,
        notes: '',
      };

      const result = validateTask(task);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes('timeCommitment'))).toBe(
          true
        );
      }
    });
  });

  describe('Category Validation', () => {
    it('should validate a correct category', () => {
      const category: Category = {
        id: crypto.randomUUID(),
        name: 'Test Category',
        color: '#FF0000',
        icon: 'test-icon',
        isDefault: false,
        order: 1,
      };

      const result = validateCategory(category);
      expect(result.success).toBe(true);
    });

    it('should reject category with empty name', () => {
      const category: Category = {
        id: crypto.randomUUID(),
        name: '', // Invalid: empty name
        color: '#FF0000',
        isDefault: false,
        order: 1,
      };

      const result = validateCategory(category);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes('name'))).toBe(true);
      }
    });

    it('should reject category with invalid color format', () => {
      const category: Category = {
        id: crypto.randomUUID(),
        name: 'Test Category',
        color: 'invalid-color', // Invalid: not hex format
        isDefault: false,
        order: 1,
      };

      const result = validateCategory(category);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes('color'))).toBe(true);
      }
    });

    it('should reject category with name too long', () => {
      const category: Category = {
        id: crypto.randomUUID(),
        name: 'a'.repeat(51), // Invalid: too long
        color: '#FF0000',
        isDefault: false,
        order: 1,
      };

      const result = validateCategory(category);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes('name'))).toBe(true);
      }
    });

    it('should accept valid hex colors', () => {
      const validColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000', '#123ABC'];

      validColors.forEach((color) => {
        const category: Category = {
          id: crypto.randomUUID(),
          name: 'Test Category',
          color,
          isDefault: false,
          order: 1,
        };

        const result = validateCategory(category);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Settings Validation', () => {
    it('should validate correct settings', () => {
      const settings: AppSettings = {
        id: 'test-settings',
        lastBackupDate: new Date(),
        currentView: 'category',
        theme: 'dark',
        textSize: 'large',
        highContrast: true,
        reducedMotion: false,
        onboardingCompleted: true,
      };

      const result = validateAppSettings(settings);
      expect(result.success).toBe(true);
    });

    it('should accept valid view modes', () => {
      const validViews: Array<'category' | 'time'> = ['category', 'time'];

      validViews.forEach((view) => {
        const settings: AppSettings = {
          id: 'test-settings',
          lastBackupDate: null,
          currentView: view,
          theme: 'system',
          textSize: 'default',
          highContrast: false,
          reducedMotion: false,
          onboardingCompleted: false,
        };

        const result = validateAppSettings(settings);
        expect(result.success).toBe(true);
      });
    });

    it('should accept valid themes', () => {
      const validThemes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];

      validThemes.forEach((theme) => {
        const settings: AppSettings = {
          id: 'test-settings',
          lastBackupDate: null,
          currentView: 'category',
          theme,
          textSize: 'default',
          highContrast: false,
          reducedMotion: false,
          onboardingCompleted: false,
        };

        const result = validateAppSettings(settings);
        expect(result.success).toBe(true);
      });
    });

    it('should accept valid text sizes', () => {
      const validSizes: Array<'default' | 'large' | 'larger'> = ['default', 'large', 'larger'];

      validSizes.forEach((textSize) => {
        const settings: AppSettings = {
          id: 'test-settings',
          lastBackupDate: null,
          currentView: 'category',
          theme: 'system',
          textSize,
          highContrast: false,
          reducedMotion: false,
          onboardingCompleted: false,
        };

        const result = validateAppSettings(settings);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid view mode', () => {
      const settings = {
        id: 'test-settings',
        lastBackupDate: null,
        currentView: 'invalid-view', // Invalid view mode
        theme: 'system',
        textSize: 'default',
        highContrast: false,
        reducedMotion: false,
        onboardingCompleted: false,
      };

      const result = validateAppSettings(settings);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes('currentView'))).toBe(true);
      }
    });
  });

  describe('Migration System', () => {
    it('should have runMigrations function', () => {
      expect(typeof runMigrations).toBe('function');
    });

    it('should handle empty migrations gracefully', async () => {
      // This should not throw an error
      await expect(runMigrations()).resolves.not.toThrow();
    });
  });
});
