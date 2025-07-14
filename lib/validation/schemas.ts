// Zod validation schemas for data models
import { z } from 'zod';

// Task validation schemas
export const FrequencyUnitSchema = z.enum(['day', 'week', 'month', 'year']);

export const ExpectedFrequencySchema = z.object({
  value: z.number().positive().int(),
  unit: FrequencyUnitSchema,
});

export const TimeCommitmentSchema = z.enum(['15min', '30min', '1hr', '2hrs', '4hrs', '5hrs+']);

export const TaskSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(1, 'Task name is required')
    .max(128, 'Task name must be 128 characters or less'),
  description: z.string().max(512, 'Description must be 512 characters or less').default(''),
  categoryId: z.string().uuid('Invalid category ID'),
  createdAt: z.date(),
  lastCompletedAt: z.date().nullable(),
  expectedFrequency: ExpectedFrequencySchema.optional(),
  timeCommitment: TimeCommitmentSchema.optional(),
  isArchived: z.boolean().default(false),
  notes: z.string().max(512, 'Notes must be 512 characters or less').default(''),
});

export const TaskFormDataSchema = z.object({
  name: z
    .string()
    .min(1, 'Task name is required')
    .max(128, 'Task name must be 128 characters or less'),
  description: z.string().max(512, 'Description must be 512 characters or less').default(''),
  categoryId: z.string().uuid('Please select a category'),
  expectedFrequency: ExpectedFrequencySchema.optional(),
  timeCommitment: TimeCommitmentSchema.optional(),
  notes: z.string().max(512, 'Notes must be 512 characters or less').default(''),
});

// Category validation schemas
export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(50, 'Category name must be 50 characters or less'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format. Use hex format like #FF0000'),
  icon: z.string().optional(),
  isDefault: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});

export const CategoryFormDataSchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(50, 'Category name must be 50 characters or less'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format. Use hex format like #FF0000'),
  icon: z.string().optional(),
});

// Settings validation schemas
export const ViewModeSchema = z.enum(['category', 'time']);
export const ThemeSchema = z.enum(['light', 'dark', 'system']);
export const TextSizeSchema = z.enum(['default', 'large', 'larger']);

export const AppSettingsSchema = z.object({
  id: z.string(),
  lastBackupDate: z.date().nullable(),
  currentView: ViewModeSchema.default('category'),
  theme: ThemeSchema.default('system'),
  textSize: TextSizeSchema.default('default'),
  highContrast: z.boolean().default(false),
  reducedMotion: z.boolean().default(false),
  onboardingCompleted: z.boolean().default(false),
});

export const UserPreferencesSchema = z.object({
  theme: ThemeSchema,
  textSize: TextSizeSchema,
  highContrast: z.boolean(),
  reducedMotion: z.boolean(),
  backupReminders: z.boolean(),
});

// Export data validation schema
export const ExportDataSchema = z.object({
  version: z.string(),
  exportDate: z.date(),
  tasks: z.array(TaskSchema),
  categories: z.array(CategorySchema),
  settings: AppSettingsSchema,
});

// Validation helper functions
export function validateTask(data: unknown) {
  return TaskSchema.safeParse(data);
}

export function validateTaskFormData(data: unknown) {
  return TaskFormDataSchema.safeParse(data);
}

export function validateCategory(data: unknown) {
  return CategorySchema.safeParse(data);
}

export function validateCategoryFormData(data: unknown) {
  return CategoryFormDataSchema.safeParse(data);
}

export function validateAppSettings(data: unknown) {
  return AppSettingsSchema.safeParse(data);
}

export function validateExportData(data: unknown) {
  return ExportDataSchema.safeParse(data);
}
