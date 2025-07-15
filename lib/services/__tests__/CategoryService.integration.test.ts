import { db } from '@/lib/db';
import type { CategoryFormData } from '@/types';
import { categoryService } from '../CategoryService';
// Setup fake IndexedDB for testing
import 'fake-indexeddb/auto';

describe('CategoryService Integration Tests', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.delete();
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
  });

  describe('Category CRUD Operations', () => {
    const mockCategoryData: CategoryFormData = {
      name: 'Test Category',
      color: '#3B82F6',
      icon: 'utensils',
    };

    it('should create a new category', async () => {
      const category = await categoryService.createCategory(mockCategoryData);

      expect(category).toMatchObject({
        ...mockCategoryData,
        name: 'Test Category',
        isDefault: false,
        order: 1,
      });
      expect(category.id).toBeDefined();
      expect(typeof category.id).toBe('string');

      // Verify it was saved to database
      const savedCategory = await categoryService.getCategoryById(category.id);
      expect(savedCategory).toEqual(category);
    });

    it('should prevent duplicate category names', async () => {
      await categoryService.createCategory(mockCategoryData);

      await expect(categoryService.createCategory(mockCategoryData)).rejects.toThrow(
        'A category with this name already exists'
      );
    });

    it('should update an existing category', async () => {
      const category = await categoryService.createCategory(mockCategoryData);

      const updates: Partial<CategoryFormData> = {
        name: 'Updated Category',
        color: '#EF4444',
      };

      const updatedCategory = await categoryService.updateCategory(category.id, updates);

      expect(updatedCategory).toMatchObject({
        ...category,
        ...updates,
      });

      // Verify it was updated in database
      const savedCategory = await categoryService.getCategoryById(category.id);
      expect(savedCategory).toEqual(updatedCategory);
    });

    it('should prevent updating to duplicate name', async () => {
      const category1 = await categoryService.createCategory(mockCategoryData);
      const category2 = await categoryService.createCategory({
        ...mockCategoryData,
        name: 'Another Category',
      });

      await expect(
        categoryService.updateCategory(category2.id, { name: category1.name })
      ).rejects.toThrow('A category with this name already exists');
    });

    it('should delete a category without tasks', async () => {
      const category = await categoryService.createCategory(mockCategoryData);

      await categoryService.deleteCategory(category.id);

      const deletedCategory = await categoryService.getCategoryById(category.id);
      expect(deletedCategory).toBeNull();
    });

    it('should prevent deletion of default categories', async () => {
      // Initialize default categories
      await categoryService.initializeDefaultCategories();
      const categories = await categoryService.getAllCategories();
      const defaultCategory = categories.find((cat) => cat.isDefault);

      if (defaultCategory) {
        await expect(categoryService.deleteCategory(defaultCategory.id)).rejects.toThrow(
          'Cannot delete default categories'
        );
      }
    });

    it('should prevent deletion of category with tasks', async () => {
      const category = await categoryService.createCategory(mockCategoryData);

      // Add a task to the category
      await db.tasks.add({
        id: crypto.randomUUID(),
        name: 'Test Task',
        description: '',
        categoryId: category.id,
        createdAt: new Date(),
        lastCompletedAt: null,
        isArchived: false,
        notes: '',
      });

      await expect(categoryService.deleteCategory(category.id)).rejects.toThrow(
        'Cannot delete category with 1 assigned tasks'
      );
    });

    it('should delete category with task reassignment', async () => {
      const category1 = await categoryService.createCategory(mockCategoryData);
      const category2 = await categoryService.createCategory({
        ...mockCategoryData,
        name: 'Target Category',
      });

      // Add a task to category1
      const taskId = crypto.randomUUID();
      await db.tasks.add({
        id: taskId,
        name: 'Test Task',
        description: '',
        categoryId: category1.id,
        createdAt: new Date(),
        lastCompletedAt: null,
        isArchived: false,
        notes: '',
      });

      await categoryService.deleteCategoryWithReassignment(category1.id, category2.id);

      // Category should be deleted
      const deletedCategory = await categoryService.getCategoryById(category1.id);
      expect(deletedCategory).toBeNull();

      // Task should be reassigned
      const task = await db.tasks.get(taskId);
      expect(task?.categoryId).toBe(category2.id);
    });
  });

  describe('Category Ordering', () => {
    it('should assign incremental order values', async () => {
      const category1 = await categoryService.createCategory({
        name: 'First',
        color: '#3B82F6',
      });
      const category2 = await categoryService.createCategory({
        name: 'Second',
        color: '#EF4444',
      });

      expect(category1.order).toBe(1);
      expect(category2.order).toBe(2);
    });

    it('should reorder categories', async () => {
      const category1 = await categoryService.createCategory({
        name: 'First',
        color: '#3B82F6',
      });
      const category2 = await categoryService.createCategory({
        name: 'Second',
        color: '#EF4444',
      });
      const category3 = await categoryService.createCategory({
        name: 'Third',
        color: '#10B981',
      });

      // Reorder: [category3, category1, category2]
      await categoryService.reorderCategories([category3.id, category1.id, category2.id]);

      const reorderedCategories = await categoryService.getAllCategories();
      expect(reorderedCategories[0].id).toBe(category3.id);
      expect(reorderedCategories[0].order).toBe(1);
      expect(reorderedCategories[1].id).toBe(category1.id);
      expect(reorderedCategories[1].order).toBe(2);
      expect(reorderedCategories[2].id).toBe(category2.id);
      expect(reorderedCategories[2].order).toBe(3);
    });
  });

  describe('Default Categories', () => {
    it('should initialize default categories', async () => {
      await categoryService.initializeDefaultCategories();

      const categories = await categoryService.getAllCategories();
      expect(categories.length).toBeGreaterThan(0);

      const defaultCategories = categories.filter((cat) => cat.isDefault);
      expect(defaultCategories.length).toBeGreaterThan(0);

      // Check that Kitchen category exists (from default set)
      const kitchenCategory = categories.find((cat) => cat.name === 'Kitchen');
      expect(kitchenCategory).toBeDefined();
      expect(kitchenCategory?.isDefault).toBe(true);
    });

    it('should not duplicate default categories', async () => {
      await categoryService.initializeDefaultCategories();
      const firstCount = await db.categories.count();

      await categoryService.initializeDefaultCategories();
      const secondCount = await db.categories.count();

      expect(firstCount).toBe(secondCount);
    });

    it('should reset to default categories', async () => {
      // Add some custom categories and tasks
      await categoryService.createCategory({
        name: 'Custom Category',
        color: '#3B82F6',
      });

      await db.tasks.add({
        id: crypto.randomUUID(),
        name: 'Test Task',
        description: '',
        categoryId: crypto.randomUUID(),
        createdAt: new Date(),
        lastCompletedAt: null,
        isArchived: false,
        notes: '',
      });

      await categoryService.resetToDefaultCategories();

      const categories = await categoryService.getAllCategories();
      const tasks = await db.tasks.toArray();

      // Should only have default categories
      expect(categories.every((cat) => cat.isDefault)).toBe(true);
      // Should have no tasks
      expect(tasks.length).toBe(0);
    });
  });

  describe('Categories with Task Counts', () => {
    it('should return categories with task counts', async () => {
      const category = await categoryService.createCategory({
        name: 'Test Category',
        color: '#3B82F6',
      });

      // Add some tasks
      await db.tasks.bulkAdd([
        {
          id: crypto.randomUUID(),
          name: 'Task 1',
          description: '',
          categoryId: category.id,
          createdAt: new Date(),
          lastCompletedAt: null,
          isArchived: false,
          notes: '',
        },
        {
          id: crypto.randomUUID(),
          name: 'Task 2',
          description: '',
          categoryId: category.id,
          createdAt: new Date(),
          lastCompletedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          expectedFrequency: { value: 7, unit: 'day' }, // Weekly, so overdue
          isArchived: false,
          notes: '',
        },
        {
          id: crypto.randomUUID(),
          name: 'Archived Task',
          description: '',
          categoryId: category.id,
          createdAt: new Date(),
          lastCompletedAt: null,
          isArchived: true, // Should not be counted
          notes: '',
        },
      ]);

      const categoriesWithCounts = await categoryService.getCategoriesWithTaskCounts();
      const categoryWithCount = categoriesWithCounts.find((cat) => cat.id === category.id);

      expect(categoryWithCount).toBeDefined();
      expect(categoryWithCount?.taskCount).toBe(2); // Excludes archived
      expect(categoryWithCount?.overdueTaskCount).toBe(1); // Only task-2 is overdue
    });
  });

  describe('Validation', () => {
    it('should validate category data on creation', async () => {
      await expect(
        categoryService.createCategory({
          name: '', // Invalid: empty name
          color: '#3B82F6',
        })
      ).rejects.toThrow('Invalid category data');
    });

    it('should validate category data on update', async () => {
      const category = await categoryService.createCategory({
        name: 'Valid Category',
        color: '#3B82F6',
      });

      await expect(
        categoryService.updateCategory(category.id, {
          name: '', // Invalid: empty name
        })
      ).rejects.toThrow('Category validation failed');
    });

    it('should validate color format', async () => {
      await expect(
        categoryService.createCategory({
          name: 'Test Category',
          color: 'invalid-color', // Invalid color format
        })
      ).rejects.toThrow('Invalid category data');
    });

    it('should trim whitespace from category names', async () => {
      const category = await categoryService.createCategory({
        name: '  Test Category  ',
        color: '#3B82F6',
      });

      expect(category.name).toBe('Test Category');
    });
  });
});
