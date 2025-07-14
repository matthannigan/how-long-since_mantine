// Category service for managing category-related operations
import { db } from '@/lib/db';
import { DEFAULT_CATEGORIES } from '@/lib/db/migrations';
import { validateCategory, validateCategoryFormData } from '@/lib/validation/schemas';
import type { Category, CategoryFormData, CategoryWithTaskCount } from '@/types';

export class CategoryService {
  /**
   * Get all categories ordered by order field
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      return await db.categories.orderBy('order').toArray();
    } catch (error) {
      throw new Error(`Failed to fetch categories: ${error}`);
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const category = await db.categories.get(id);
      return category || null;
    } catch (error) {
      throw new Error(`Failed to fetch category: ${error}`);
    }
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData: CategoryFormData): Promise<Category> {
    try {
      // Validate form data
      const formValidation = validateCategoryFormData(categoryData);
      if (!formValidation.success) {
        throw new Error(`Invalid category data: ${formValidation.error.message}`);
      }

      // Check if category name already exists
      const existingCategory = await db.categories
        .where('name')
        .equalsIgnoreCase(categoryData.name.trim())
        .first();

      if (existingCategory) {
        throw new Error('A category with this name already exists');
      }

      // Get next order value
      const maxOrder = await this.getMaxOrder();

      // Create category object
      const category: Category = {
        id: crypto.randomUUID(),
        ...categoryData,
        name: categoryData.name.trim(),
        isDefault: false,
        order: maxOrder + 1,
      };

      // Validate complete category object
      const categoryValidation = validateCategory(category);
      if (!categoryValidation.success) {
        throw new Error(`Category validation failed: ${categoryValidation.error.message}`);
      }

      // Save to database
      await db.categories.add(category);
      return category;
    } catch (error) {
      throw new Error(`Failed to create category: ${error}`);
    }
  }

  /**
   * Update an existing category
   */
  async updateCategory(id: string, updates: Partial<CategoryFormData>): Promise<Category> {
    try {
      const existingCategory = await this.getCategoryById(id);
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      // If updating name, check for duplicates
      if (updates.name && updates.name.trim() !== existingCategory.name) {
        const duplicateCategory = await db.categories
          .where('name')
          .equalsIgnoreCase(updates.name.trim())
          .and((cat) => cat.id !== id)
          .first();

        if (duplicateCategory) {
          throw new Error('A category with this name already exists');
        }
      }

      // Prepare updates with trimmed name if provided
      const processedUpdates = {
        ...updates,
        ...(updates.name && { name: updates.name.trim() }),
      };

      // Merge updates with existing category
      const updatedCategory: Category = {
        ...existingCategory,
        ...processedUpdates,
      };

      // Validate updated category
      const validation = validateCategory(updatedCategory);
      if (!validation.success) {
        throw new Error(`Category validation failed: ${validation.error.message}`);
      }

      // Update in database
      await db.categories.update(id, processedUpdates);

      // Return updated category
      const result = await this.getCategoryById(id);
      if (!result) {
        throw new Error('Failed to retrieve updated category');
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to update category: ${error}`);
    }
  }

  /**
   * Delete a category (only if no tasks are assigned to it)
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      const category = await this.getCategoryById(id);
      if (!category) {
        throw new Error('Category not found');
      }

      // Prevent deletion of default categories
      if (category.isDefault) {
        throw new Error('Cannot delete default categories');
      }

      // Check if any tasks are assigned to this category
      const tasksCount = await db.tasks.where('categoryId').equals(id).count();
      if (tasksCount > 0) {
        throw new Error(
          `Cannot delete category with ${tasksCount} assigned tasks. Please reassign or delete the tasks first.`
        );
      }

      await db.categories.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete category: ${error}`);
    }
  }

  /**
   * Delete a category and reassign its tasks to another category
   */
  async deleteCategoryWithReassignment(id: string, newCategoryId: string): Promise<void> {
    try {
      const category = await this.getCategoryById(id);
      if (!category) {
        throw new Error('Category not found');
      }

      const newCategory = await this.getCategoryById(newCategoryId);
      if (!newCategory) {
        throw new Error('Target category not found');
      }

      // Prevent deletion of default categories
      if (category.isDefault) {
        throw new Error('Cannot delete default categories');
      }

      // Use transaction to ensure data consistency
      await db.transaction('rw', [db.tasks, db.categories], async () => {
        // Reassign all tasks to the new category
        await db.tasks.where('categoryId').equals(id).modify({ categoryId: newCategoryId });

        // Delete the category
        await db.categories.delete(id);
      });
    } catch (error) {
      throw new Error(`Failed to delete category with reassignment: ${error}`);
    }
  }

  /**
   * Get categories with task counts
   */
  async getCategoriesWithTaskCounts(): Promise<CategoryWithTaskCount[]> {
    try {
      const categories = await this.getAllCategories();
      const categoriesWithCounts: CategoryWithTaskCount[] = [];

      for (const category of categories) {
        // Get total task count (excluding archived)
        const taskCount = await db.tasks
          .where('categoryId')
          .equals(category.id)
          .and((task) => !task.isArchived)
          .count();

        // Get overdue task count
        const tasks = await db.tasks
          .where('categoryId')
          .equals(category.id)
          .and((task) => !task.isArchived)
          .toArray();

        const overdueTasks = tasks.filter((task) => this.isTaskOverdue(task));

        categoriesWithCounts.push({
          ...category,
          taskCount,
          overdueTaskCount: overdueTasks.length,
        });
      }

      return categoriesWithCounts;
    } catch (error) {
      throw new Error(`Failed to fetch categories with task counts: ${error}`);
    }
  }

  /**
   * Reorder categories
   */
  async reorderCategories(categoryIds: string[]): Promise<void> {
    try {
      // Validate that all provided IDs exist
      const existingCategories = await this.getAllCategories();
      const existingIds = existingCategories.map((cat) => cat.id);

      const invalidIds = categoryIds.filter((id) => !existingIds.includes(id));
      if (invalidIds.length > 0) {
        throw new Error(`Invalid category IDs: ${invalidIds.join(', ')}`);
      }

      // Update order for each category
      await db.transaction('rw', db.categories, async () => {
        for (let i = 0; i < categoryIds.length; i++) {
          await db.categories.update(categoryIds[i], { order: i + 1 });
        }
      });
    } catch (error) {
      throw new Error(`Failed to reorder categories: ${error}`);
    }
  }

  /**
   * Initialize default categories if none exist
   */
  async initializeDefaultCategories(): Promise<void> {
    try {
      const existingCount = await db.categories.count();

      if (existingCount === 0) {
        const categoriesWithIds = DEFAULT_CATEGORIES.map((cat) => ({
          ...cat,
          id: crypto.randomUUID(),
        }));

        await db.categories.bulkAdd(categoriesWithIds);
      }
    } catch (error) {
      throw new Error(`Failed to initialize default categories: ${error}`);
    }
  }

  /**
   * Get default categories template
   */
  getDefaultCategories(): Omit<Category, 'id'>[] {
    return [...DEFAULT_CATEGORIES];
  }

  /**
   * Reset categories to defaults (removes all custom categories and tasks)
   */
  async resetToDefaultCategories(): Promise<void> {
    try {
      await db.transaction('rw', [db.categories, db.tasks], async () => {
        // Clear all existing data
        await db.categories.clear();
        await db.tasks.clear();

        // Add default categories
        const categoriesWithIds = DEFAULT_CATEGORIES.map((cat) => ({
          ...cat,
          id: crypto.randomUUID(),
        }));

        await db.categories.bulkAdd(categoriesWithIds);
      });
    } catch (error) {
      throw new Error(`Failed to reset to default categories: ${error}`);
    }
  }

  /**
   * Get maximum order value for positioning new categories
   */
  private async getMaxOrder(): Promise<number> {
    try {
      const categories = await db.categories.orderBy('order').reverse().limit(1).toArray();
      return categories.length > 0 ? categories[0].order : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Helper method to check if a task is overdue (duplicated from TaskService for independence)
   */
  private isTaskOverdue(task: any): boolean {
    if (!task.expectedFrequency || !task.lastCompletedAt) {
      return false;
    }

    const { value, unit } = task.expectedFrequency;
    const lastCompleted = new Date(task.lastCompletedAt);
    const now = new Date();

    // Calculate next due date
    const nextDueDate = new Date(lastCompleted);

    switch (unit) {
      case 'day':
        nextDueDate.setDate(nextDueDate.getDate() + value);
        break;
      case 'week':
        nextDueDate.setDate(nextDueDate.getDate() + value * 7);
        break;
      case 'month':
        nextDueDate.setMonth(nextDueDate.getMonth() + value);
        break;
      case 'year':
        nextDueDate.setFullYear(nextDueDate.getFullYear() + value);
        break;
    }

    return now > nextDueDate;
  }
}

// Export singleton instance
export const categoryService = new CategoryService();
