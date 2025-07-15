// Database schema definition using Dexie
import Dexie, { type EntityTable } from 'dexie';
import { validateAppSettings, validateCategory, validateTask } from '@/lib/validation/schemas';
import type { AppSettings, Category, Task } from '@/types';

// Database class extending Dexie
export class HowLongSinceDB extends Dexie {
  // Define tables with proper typing
  tasks!: EntityTable<Task, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  settings!: EntityTable<AppSettings, 'id'>;

  constructor() {
    super('HowLongSinceDB');

    // Define database schema with proper indexing for performance
    this.version(1).stores({
      // Tasks table with indexes for common queries
      tasks:
        '++id, name, categoryId, lastCompletedAt, isArchived, createdAt, [categoryId+isArchived], [lastCompletedAt+isArchived], timeCommitment',
      // Categories table with indexes for ordering and default status
      categories: '++id, name, isDefault, order, [isDefault+order]',
      // Settings table - simple key-value store
      settings: '++id',
    });

    // Add hooks for data validation and transformation
    this.tasks.hook('creating', (_primKey, obj, _trans) => {
      // Set default values
      obj.createdAt = obj.createdAt || new Date();
      obj.isArchived = obj.isArchived ?? false;
      obj.description = obj.description || '';
      obj.notes = obj.notes || '';

      // Validate data before creating
      const validation = validateTask(obj);
      if (!validation.success) {
        throw new Error(`Task validation failed: ${validation.error.message}`);
      }
    });

    this.tasks.hook('updating', (_modifications, _primKey, obj, _trans) => {
      // Convert string dates back to Date objects for validation
      if (obj.createdAt && typeof obj.createdAt === 'string') {
        obj.createdAt = new Date(obj.createdAt);
      }
      if (obj.lastCompletedAt && typeof obj.lastCompletedAt === 'string') {
        obj.lastCompletedAt = new Date(obj.lastCompletedAt);
      }

      // Validate data before updating
      const validation = validateTask(obj);
      if (!validation.success) {
        throw new Error(`Task validation failed: ${validation.error.message}`);
      }
    });

    this.categories.hook('creating', (_primKey, obj, _trans) => {
      // Set default values
      obj.isDefault = obj.isDefault ?? false;
      obj.order = obj.order ?? 0;

      // Validate data before creating
      const validation = validateCategory(obj);
      if (!validation.success) {
        throw new Error(`Category validation failed: ${validation.error.message}`);
      }
    });

    this.categories.hook('updating', (_modifications, _primKey, obj, _trans) => {
      // Validate data before updating
      const validation = validateCategory(obj);
      if (!validation.success) {
        throw new Error(`Category validation failed: ${validation.error.message}`);
      }
    });

    this.settings.hook('creating', (_primKey, obj, _trans) => {
      // Set default values
      obj.lastBackupDate = obj.lastBackupDate || null;
      obj.currentView = obj.currentView || 'category';
      obj.theme = obj.theme || 'system';
      obj.textSize = obj.textSize || 'default';
      obj.highContrast = obj.highContrast ?? false;
      obj.reducedMotion = obj.reducedMotion ?? false;
      obj.onboardingCompleted = obj.onboardingCompleted ?? false;

      // Validate data before creating
      const validation = validateAppSettings(obj);
      if (!validation.success) {
        throw new Error(`Settings validation failed: ${validation.error.message}`);
      }
    });

    this.settings.hook('updating', (_modifications, _primKey, obj, _trans) => {
      // Validate data before updating
      const validation = validateAppSettings(obj);
      if (!validation.success) {
        throw new Error(`Settings validation failed: ${validation.error.message}`);
      }
    });
  }
}

// Create and export database instance
export const db = new HowLongSinceDB();
