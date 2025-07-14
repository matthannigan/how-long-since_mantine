// Database exports and initialization
export { db, HowLongSinceDB } from './schema';
export { initializeDatabase, runMigrations, DEFAULT_CATEGORIES } from './migrations';

// Re-export types for convenience
export type { Task, Category, AppSettings } from '@/types';
