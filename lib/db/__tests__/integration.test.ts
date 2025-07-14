// Integration test for database functionality
import type { Category, Task } from '@/types';
import { db, initializeDatabase } from '../index';

// Mock crypto.randomUUID for testing
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => {
      // Generate a proper UUID v4 format for testing
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
  },
});

describe('Database Integration', () => {
  beforeAll(async () => {
    // Initialize the database
    await initializeDatabase();
  });

  afterAll(async () => {
    // Clean up
    await db.delete();
  });

  describe('Database Schema Integration', () => {
    it('should have the correct database structure', () => {
      expect(db.tasks).toBeDefined();
      expect(db.categories).toBeDefined();
      expect(db.settings).toBeDefined();
    });

    it('should have default categories after initialization', async () => {
      const categories = await db.categories.toArray();
      expect(categories.length).toBeGreaterThan(0);

      const kitchenCategory = categories.find((cat) => cat.name === 'Kitchen');
      expect(kitchenCategory).toBeDefined();
      expect(kitchenCategory?.isDefault).toBe(true);
      expect(kitchenCategory?.color).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should have default settings after initialization', async () => {
      const settings = await db.settings.toArray();
      expect(settings.length).toBeGreaterThan(0);

      const defaultSettings = settings.find((s) => s.id === 'default');
      expect(defaultSettings).toBeDefined();
      expect(defaultSettings?.currentView).toBe('category');
      expect(defaultSettings?.theme).toBe('system');
    });
  });

  describe('CRUD Operations', () => {
    let testCategoryId: string;

    beforeEach(async () => {
      // Get a test category
      const categories = await db.categories.toArray();
      testCategoryId = categories[0].id;
    });

    it('should create and retrieve a task', async () => {
      const task: Task = {
        id: crypto.randomUUID(),
        name: 'Integration Test Task',
        description: 'Test description',
        categoryId: testCategoryId,
        createdAt: new Date(),
        lastCompletedAt: null,
        isArchived: false,
        notes: 'Test notes',
      };

      // Create task
      await db.tasks.add(task);

      // Retrieve task
      const retrievedTask = await db.tasks.get(task.id);
      expect(retrievedTask).toBeDefined();
      expect(retrievedTask?.name).toBe(task.name);
      expect(retrievedTask?.categoryId).toBe(testCategoryId);
    });

    it('should create and retrieve a category', async () => {
      const category: Category = {
        id: crypto.randomUUID(),
        name: 'Integration Test Category',
        color: '#FF5722',
        icon: 'test',
        isDefault: false,
        order: 999,
      };

      // Create category
      await db.categories.add(category);

      // Retrieve category
      const retrievedCategory = await db.categories.get(category.id);
      expect(retrievedCategory).toBeDefined();
      expect(retrievedCategory?.name).toBe(category.name);
      expect(retrievedCategory?.color).toBe(category.color);
    });

    it('should query tasks by category', async () => {
      // Create multiple tasks for the same category
      const tasks: Task[] = Array.from({ length: 3 }, (_, i) => ({
        id: crypto.randomUUID(),
        name: `Query Test Task ${i}`,
        description: '',
        categoryId: testCategoryId,
        createdAt: new Date(),
        lastCompletedAt: null,
        isArchived: false,
        notes: '',
      }));

      await db.tasks.bulkAdd(tasks);

      // Query tasks by category
      const categoryTasks = await db.tasks.where('categoryId').equals(testCategoryId).toArray();

      expect(categoryTasks.length).toBeGreaterThanOrEqual(3);
      expect(categoryTasks.every((task) => task.categoryId === testCategoryId)).toBe(true);
    });

    it('should query non-archived tasks', async () => {
      // Create mix of archived and non-archived tasks
      const archivedTask: Task = {
        id: crypto.randomUUID(),
        name: 'Archived Task',
        description: '',
        categoryId: testCategoryId,
        createdAt: new Date(),
        lastCompletedAt: null,
        isArchived: true,
        notes: '',
      };

      const activeTask: Task = {
        id: crypto.randomUUID(),
        name: 'Active Task',
        description: '',
        categoryId: testCategoryId,
        createdAt: new Date(),
        lastCompletedAt: null,
        isArchived: false,
        notes: '',
      };

      await db.tasks.bulkAdd([archivedTask, activeTask]);

      // Query only non-archived tasks - using filter instead of where/equals for boolean values
      const activeTasks = await db.tasks.filter((task) => !task.isArchived).toArray();

      expect(activeTasks.every((task) => !task.isArchived)).toBe(true);
      expect(activeTasks.find((task) => task.id === activeTask.id)).toBeDefined();
      expect(activeTasks.find((task) => task.id === archivedTask.id)).toBeUndefined();
    });
  });

  describe('Data Validation Integration', () => {
    let testCategoryId: string;

    beforeEach(async () => {
      const categories = await db.categories.toArray();
      testCategoryId = categories[0].id;
    });

    it('should enforce task validation on creation', async () => {
      const invalidTask = {
        id: crypto.randomUUID(),
        name: '', // Invalid: empty name
        description: 'Test',
        categoryId: testCategoryId,
        createdAt: new Date(),
        lastCompletedAt: null,
        isArchived: false,
        notes: '',
      } as Task;

      await expect(db.tasks.add(invalidTask)).rejects.toThrow('Task validation failed');
    });

    it('should enforce category validation on creation', async () => {
      const invalidCategory = {
        id: crypto.randomUUID(),
        name: 'Test Category',
        color: 'invalid-color', // Invalid: not hex format
        isDefault: false,
        order: 1,
      } as Category;

      await expect(db.categories.add(invalidCategory)).rejects.toThrow(
        'Category validation failed'
      );
    });

    it('should set default values during creation', async () => {
      const taskWithMissingFields = {
        id: crypto.randomUUID(),
        name: 'Test Task',
        categoryId: testCategoryId,
        createdAt: new Date(),
        lastCompletedAt: null,
      } as Task;

      await db.tasks.add(taskWithMissingFields);
      const savedTask = await db.tasks.get(taskWithMissingFields.id);

      expect(savedTask?.description).toBe('');
      expect(savedTask?.notes).toBe('');
      expect(savedTask?.isArchived).toBe(false);
    });
  });
});
