// CategoryService unit tests
import { db } from '@/lib/db';
import { DEFAULT_CATEGORIES } from '@/lib/db/migrations';
import type { Category, CategoryFormData } from '@/types';
import { CategoryService } from '../CategoryService';

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    categories: {
      orderBy: jest.fn(),
      where: jest.fn(),
      get: jest.fn(),
      add: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      clear: jest.fn(),
      bulkAdd: jest.fn(),
      toArray: jest.fn(),
    },
    tasks: {
      where: jest.fn(),
      count: jest.fn(),
      toArray: jest.fn(),
      modify: jest.fn(),
      clear: jest.fn(),
    },
    transaction: jest.fn(),
  },
}));

// Mock migrations
jest.mock('@/lib/db/migrations', () => ({
  DEFAULT_CATEGORIES: [
    { name: 'Kitchen', color: '#3B82F6', icon: 'utensils', isDefault: true, order: 1 },
    { name: 'Bathroom', color: '#8B5CF6', icon: 'bath', isDefault: true, order: 2 },
  ],
}));

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let mockCategory: Category;
  let mockCategoryFormData: CategoryFormData;

  beforeEach(() => {
    categoryService = new CategoryService();

    mockCategory = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Test Category',
      color: '#FF0000',
      icon: 'test-icon',
      isDefault: false,
      order: 1,
    };

    mockCategoryFormData = {
      name: 'Test Category',
      color: '#FF0000',
      icon: 'test-icon',
    };

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getAllCategories', () => {
    it('should return all categories ordered by order field', async () => {
      const mockCategories = [mockCategory];
      const mockOrderBy = {
        toArray: jest.fn().mockResolvedValue(mockCategories),
      };

      (db.categories.orderBy as jest.Mock).mockReturnValue(mockOrderBy);

      const result = await categoryService.getAllCategories();

      expect(db.categories.orderBy).toHaveBeenCalledWith('order');
      expect(result).toEqual(mockCategories);
    });

    it('should throw error when database operation fails', async () => {
      (db.categories.orderBy as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(categoryService.getAllCategories()).rejects.toThrow(
        'Failed to fetch categories: Error: Database error'
      );
    });
  });

  describe('getCategoryById', () => {
    it('should return category when found', async () => {
      (db.categories.get as jest.Mock).mockResolvedValue(mockCategory);

      const result = await categoryService.getCategoryById('test-category-id');

      expect(db.categories.get).toHaveBeenCalledWith('test-category-id');
      expect(result).toEqual(mockCategory);
    });

    it('should return null when category not found', async () => {
      (db.categories.get as jest.Mock).mockResolvedValue(undefined);

      const result = await categoryService.getCategoryById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should throw error when database operation fails', async () => {
      (db.categories.get as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(categoryService.getCategoryById('test-category-id')).rejects.toThrow(
        'Failed to fetch category: Error: Database error'
      );
    });
  });

  describe('createCategory', () => {
    it('should create category successfully with valid data', async () => {
      // Mock no existing category with same name
      const mockWhere = {
        equalsIgnoreCase: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue(null),
        }),
      };
      (db.categories.where as jest.Mock).mockReturnValue(mockWhere);

      // Mock max order
      const mockOrderBy = {
        reverse: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([{ order: 5 }]),
          }),
        }),
      };
      (db.categories.orderBy as jest.Mock).mockReturnValue(mockOrderBy);

      (db.categories.add as jest.Mock).mockResolvedValue('test-category-id');

      // Mock crypto.randomUUID
      const mockUUID = '550e8400-e29b-41d4-a716-446655440002';
      const mockCrypto = {
        randomUUID: jest.fn().mockReturnValue(mockUUID),
      };
      Object.defineProperty(global, 'crypto', {
        value: mockCrypto,
        writable: true,
      });

      const result = await categoryService.createCategory(mockCategoryFormData);

      expect(db.categories.add).toHaveBeenCalled();
      expect(result.id).toBe(mockUUID);
      expect(result.name).toBe(mockCategoryFormData.name);
      expect(result.isDefault).toBe(false);
      expect(result.order).toBe(6); // max order + 1
    });

    it('should throw error when category name already exists', async () => {
      const mockWhere = {
        equalsIgnoreCase: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue(mockCategory),
        }),
      };
      (db.categories.where as jest.Mock).mockReturnValue(mockWhere);

      await expect(categoryService.createCategory(mockCategoryFormData)).rejects.toThrow(
        'A category with this name already exists'
      );
    });

    it('should throw error with invalid category data', async () => {
      const invalidData = { ...mockCategoryFormData, name: '' }; // Empty name

      await expect(categoryService.createCategory(invalidData)).rejects.toThrow(
        'Invalid category data'
      );
    });

    it('should throw error with invalid color format', async () => {
      const invalidData = { ...mockCategoryFormData, color: 'invalid-color' };

      await expect(categoryService.createCategory(invalidData)).rejects.toThrow(
        'Invalid category data'
      );
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      const updates = { name: 'Updated Category Name' };
      const updatedCategory = { ...mockCategory, ...updates };

      (db.categories.get as jest.Mock)
        .mockResolvedValueOnce(mockCategory) // First call for existence check
        .mockResolvedValueOnce(updatedCategory); // Second call for return value

      // Mock no duplicate name check
      const mockWhere = {
        equalsIgnoreCase: jest.fn().mockReturnValue({
          and: jest.fn().mockReturnValue({
            first: jest.fn().mockResolvedValue(null),
          }),
        }),
      };
      (db.categories.where as jest.Mock).mockReturnValue(mockWhere);

      (db.categories.update as jest.Mock).mockResolvedValue(1);

      const result = await categoryService.updateCategory('test-category-id', updates);

      expect(db.categories.update).toHaveBeenCalledWith('test-category-id', {
        name: 'Updated Category Name',
      });
      expect(result.name).toBe('Updated Category Name');
    });

    it('should throw error when category not found', async () => {
      (db.categories.get as jest.Mock).mockResolvedValue(null);

      await expect(
        categoryService.updateCategory('non-existent-id', { name: 'Updated' })
      ).rejects.toThrow('Category not found');
    });

    it('should throw error when updating to existing category name', async () => {
      (db.categories.get as jest.Mock).mockResolvedValue(mockCategory);

      const mockWhere = {
        equalsIgnoreCase: jest.fn().mockReturnValue({
          and: jest.fn().mockReturnValue({
            first: jest.fn().mockResolvedValue({ id: 'other-category', name: 'Existing Name' }),
          }),
        }),
      };
      (db.categories.where as jest.Mock).mockReturnValue(mockWhere);

      await expect(
        categoryService.updateCategory('test-category-id', { name: 'Existing Name' })
      ).rejects.toThrow('A category with this name already exists');
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully when no tasks assigned', async () => {
      (db.categories.get as jest.Mock).mockResolvedValue(mockCategory);

      const mockTasksWhere = {
        equals: jest.fn().mockReturnValue({
          count: jest.fn().mockResolvedValue(0),
        }),
      };
      (db.tasks.where as jest.Mock).mockReturnValue(mockTasksWhere);

      (db.categories.delete as jest.Mock).mockResolvedValue(1);

      await categoryService.deleteCategory('test-category-id');

      expect(db.categories.delete).toHaveBeenCalledWith('test-category-id');
    });

    it('should throw error when category not found', async () => {
      (db.categories.get as jest.Mock).mockResolvedValue(null);

      await expect(categoryService.deleteCategory('non-existent-id')).rejects.toThrow(
        'Category not found'
      );
    });

    it('should throw error when trying to delete default category', async () => {
      const defaultCategory = { ...mockCategory, isDefault: true };
      (db.categories.get as jest.Mock).mockResolvedValue(defaultCategory);

      await expect(categoryService.deleteCategory('test-category-id')).rejects.toThrow(
        'Cannot delete default categories'
      );
    });

    it('should throw error when category has assigned tasks', async () => {
      (db.categories.get as jest.Mock).mockResolvedValue(mockCategory);

      const mockTasksWhere = {
        equals: jest.fn().mockReturnValue({
          count: jest.fn().mockResolvedValue(5),
        }),
      };
      (db.tasks.where as jest.Mock).mockReturnValue(mockTasksWhere);

      await expect(categoryService.deleteCategory('test-category-id')).rejects.toThrow(
        'Cannot delete category with 5 assigned tasks'
      );
    });
  });

  describe('initializeDefaultCategories', () => {
    it('should initialize default categories when none exist', async () => {
      (db.categories.count as jest.Mock).mockResolvedValue(0);
      (db.categories.bulkAdd as jest.Mock).mockResolvedValue(['id1', 'id2']);

      global.crypto = { randomUUID: jest.fn().mockReturnValue('generated-uuid') } as any;

      await categoryService.initializeDefaultCategories();

      expect(db.categories.bulkAdd).toHaveBeenCalled();
    });

    it('should not initialize when categories already exist', async () => {
      (db.categories.count as jest.Mock).mockResolvedValue(5);

      await categoryService.initializeDefaultCategories();

      expect(db.categories.bulkAdd).not.toHaveBeenCalled();
    });

    it('should throw error when initialization fails', async () => {
      (db.categories.count as jest.Mock).mockResolvedValue(0);
      (db.categories.bulkAdd as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(categoryService.initializeDefaultCategories()).rejects.toThrow(
        'Failed to initialize default categories'
      );
    });
  });

  describe('getDefaultCategories', () => {
    it('should return default categories template', () => {
      const result = categoryService.getDefaultCategories();

      expect(result).toEqual(DEFAULT_CATEGORIES);
      expect(result).not.toBe(DEFAULT_CATEGORIES); // Should be a copy
    });
  });
});
