// Category-related type definitions

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isDefault: boolean;
  order: number;
}

export interface CategoryFormData {
  name: string;
  color: string;
  icon?: string;
}

export interface CategoryWithTaskCount extends Category {
  taskCount: number;
  overdueTaskCount: number;
}
