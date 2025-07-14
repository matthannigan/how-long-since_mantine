// Database migration utilities
import type { Category } from '@/types';
import { db } from './schema';

// Default categories based on branding guidelines
export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Kitchen', color: '#3B82F6', icon: 'utensils', isDefault: true, order: 1 },
  { name: 'Bathroom', color: '#8B5CF6', icon: 'bath', isDefault: true, order: 2 },
  { name: 'Bedroom', color: '#EC4899', icon: 'bed', isDefault: true, order: 3 },
  { name: 'Living Areas', color: '#10B981', icon: 'sofa', isDefault: true, order: 4 },
  { name: 'Exterior', color: '#F59E0B', icon: 'home', isDefault: true, order: 5 },
  { name: 'Vehicles', color: '#EF4444', icon: 'car', isDefault: true, order: 6 },
  { name: 'Digital/Tech', color: '#6366F1', icon: 'device-desktop', isDefault: true, order: 7 },
  { name: 'Health', color: '#14B8A6', icon: 'heart', isDefault: true, order: 8 },
  { name: 'Garden/Plants', color: '#84CC16', icon: 'plant', isDefault: true, order: 9 },
  { name: 'Pets', color: '#F97316', icon: 'paw', isDefault: true, order: 10 },
];

// Initialize database with default data
export async function initializeDatabase(): Promise<void> {
  try {
    // Check if categories already exist
    const existingCategories = await db.categories.count();

    if (existingCategories === 0) {
      // Add default categories
      await db.categories.bulkAdd(
        DEFAULT_CATEGORIES.map((cat) => ({
          ...cat,
          id: crypto.randomUUID(),
        }))
      );

      // eslint-disable-next-line no-console
      console.log('Default categories initialized');
    }

    // Check if settings exist
    const existingSettings = await db.settings.count();

    if (existingSettings === 0) {
      // Add default settings
      await db.settings.add({
        id: 'default',
        lastBackupDate: null,
        currentView: 'category',
        theme: 'system',
        textSize: 'default',
        highContrast: false,
        reducedMotion: false,
        onboardingCompleted: false,
      });

      // eslint-disable-next-line no-console
      console.log('Default settings initialized');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Migration utilities for future schema changes
export interface Migration {
  version: number;
  description: string;
  migrate: () => Promise<void>;
}

export const migrations: Migration[] = [
  // Future migrations will be added here
];

export async function runMigrations(): Promise<void> {
  // This will be implemented when we need to handle schema changes
  // eslint-disable-next-line no-console
  console.log('No migrations to run');
}
