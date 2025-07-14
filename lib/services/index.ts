// Service layer exports
export { TaskService, taskService } from './TaskService';
export { CategoryService, categoryService } from './CategoryService';
export { SettingsService, settingsService } from './SettingsService';
export { ExportImportService, exportImportService } from './ExportImportService';

// Re-export types for convenience
export type { Task, TaskFormData, TaskStats } from '@/types/task';
export type { Category, CategoryFormData, CategoryWithTaskCount } from '@/types/category';
export type { AppSettings, UserPreferences, ExportData } from '@/types/settings';
