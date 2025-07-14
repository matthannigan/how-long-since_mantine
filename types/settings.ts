// Import from task types for ExportData
import type { Category } from './category';
import type { Task } from './task';

// Settings and app configuration type definitions

export type ViewMode = 'category' | 'time';
export type Theme = 'light' | 'dark' | 'system';
export type TextSize = 'default' | 'large' | 'larger';

export interface AppSettings {
  id: string;
  lastBackupDate: Date | null;
  currentView: ViewMode;
  theme: Theme;
  textSize: TextSize;
  highContrast: boolean;
  reducedMotion: boolean;
  onboardingCompleted: boolean;
}

export interface UserPreferences {
  theme: Theme;
  textSize: TextSize;
  highContrast: boolean;
  reducedMotion: boolean;
  backupReminders: boolean;
}

export interface ExportData {
  version: string;
  exportDate: Date;
  tasks: Task[];
  categories: Category[];
  settings: AppSettings;
}
