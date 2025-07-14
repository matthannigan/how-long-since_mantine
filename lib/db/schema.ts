// Database schema definition using Dexie
import Dexie, { type EntityTable } from 'dexie';
import type { AppSettings, Category, Task } from '@/types';

// Database class extending Dexie
export class HowLongSinceDB extends Dexie {
  // Define tables with proper typing
  tasks!: EntityTable<Task, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  settings!: EntityTable<AppSettings, 'id'>;

  constructor() {
    super('HowLongSinceDB');

    // Define database schema
    this.version(1).stores({
      tasks:
        '++id, name, categoryId, lastCompletedAt, isArchived, createdAt, expectedFrequency.unit, timeCommitment',
      categories: '++id, name, isDefault, order',
      settings: '++id',
    });

    // Add hooks for data validation and transformation
    this.tasks.hook('creating', (_primKey, obj, _trans) => {
      obj.createdAt = obj.createdAt || new Date();
      obj.isArchived = obj.isArchived ?? false;
      obj.description = obj.description || '';
      obj.notes = obj.notes || '';
    });

    this.categories.hook('creating', (_primKey, obj, _trans) => {
      obj.isDefault = obj.isDefault ?? false;
      obj.order = obj.order ?? 0;
    });

    this.settings.hook('creating', (_primKey, obj, _trans) => {
      obj.lastBackupDate = obj.lastBackupDate || null;
      obj.currentView = obj.currentView || 'category';
      obj.theme = obj.theme || 'system';
      obj.textSize = obj.textSize || 'default';
      obj.highContrast = obj.highContrast ?? false;
      obj.reducedMotion = obj.reducedMotion ?? false;
      obj.onboardingCompleted = obj.onboardingCompleted ?? false;
    });
  }
}

// Create and export database instance
export const db = new HowLongSinceDB();
