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

// Track migration state
interface MigrationState {
  id: string;
  lastMigrationVersion: number;
  migratedAt: Date;
}

export const migrations: Migration[] = [
  // Future migrations will be added here
  // Example:
  // {
  //   version: 2,
  //   description: 'Add task priority field',
  //   migrate: async () => {
  //     // Migration logic here
  //   }
  // }
];

// Get current migration version from database
async function getCurrentMigrationVersion(): Promise<number> {
  try {
    const migrationState = await db.transaction('r', db.settings, async () => {
      return await db.settings.get('migration_state');
    });

    return (migrationState as any)?.lastMigrationVersion || 1;
  } catch (error) {
    // If migration state doesn't exist, assume version 1 (initial schema)
    return 1;
  }
}

// Update migration version in database
async function updateMigrationVersion(version: number): Promise<void> {
  const migrationState: MigrationState = {
    id: 'migration_state',
    lastMigrationVersion: version,
    migratedAt: new Date(),
  };

  await db.settings.put(migrationState as any);
}

// Run pending migrations
export async function runMigrations(): Promise<void> {
  try {
    const currentVersion = await getCurrentMigrationVersion();
    const pendingMigrations = migrations.filter((m) => m.version > currentVersion);

    if (pendingMigrations.length === 0) {
      // eslint-disable-next-line no-console
      console.log('Database is up to date');
      return;
    }

    // Sort migrations by version to ensure proper order
    pendingMigrations.sort((a, b) => a.version - b.version);

    // eslint-disable-next-line no-console
    console.log(`Running ${pendingMigrations.length} pending migrations...`);

    for (const migration of pendingMigrations) {
      // eslint-disable-next-line no-console
      console.log(`Running migration ${migration.version}: ${migration.description}`);

      try {
        await migration.migrate();
        await updateMigrationVersion(migration.version);

        // eslint-disable-next-line no-console
        console.log(`Migration ${migration.version} completed successfully`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Migration ${migration.version} failed:`, error);
        throw new Error(`Migration ${migration.version} failed: ${error}`);
      }
    }

    // eslint-disable-next-line no-console
    console.log('All migrations completed successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Migration process failed:', error);
    throw error;
  }
}
