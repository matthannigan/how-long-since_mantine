// Category-related constants

// Default category colors from branding guidelines
export const CATEGORY_COLORS = {
  KITCHEN: '#3B82F6',
  BATHROOM: '#8B5CF6',
  BEDROOM: '#EC4899',
  LIVING_AREAS: '#10B981',
  EXTERIOR: '#F59E0B',
  VEHICLES: '#EF4444',
  DIGITAL_TECH: '#6366F1',
  HEALTH: '#14B8A6',
  GARDEN_PLANTS: '#84CC16',
  PETS: '#F97316',
} as const;

// Available category icons (Tabler Icons)
export const CATEGORY_ICONS = [
  'utensils',
  'bath',
  'bed',
  'sofa',
  'home',
  'car',
  'device-desktop',
  'heart',
  'plant',
  'paw',
  'tools',
  'brush',
  'vacuum-cleaner',
  'washing-machine',
  'shirt',
  'book',
  'dumbbell',
  'stethoscope',
  'pill',
  'tree',
  'flower',
  'leaf',
  'fish',
  'dog',
  'cat',
] as const;

// Color palette for new categories
export const AVAILABLE_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#84CC16', // Lime
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#8B5A2B', // Brown
  '#6B7280', // Gray
  '#DC2626', // Dark Red
  '#059669', // Dark Green
  '#7C3AED', // Dark Purple
] as const;

export type CategoryIcon = (typeof CATEGORY_ICONS)[number];
export type CategoryColor = (typeof AVAILABLE_COLORS)[number];
