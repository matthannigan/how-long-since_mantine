// ExportImportService unit tests
import { db } from '@/lib/db';
import type { AppSettings, Category, ExportData, Task } from '@/types';
import { categoryService } from '../CategoryService';
import { ExportImportService } from '../ExportImportService';
import { settingsService } from '../SettingsService';
import { taskService } from '../TaskService';

// Mock the services
jest.mock('../TaskService', () => ({
  taskService: {
    getAllTasks: jest.fn(),
  },
}));

jest.mock('../CategoryService', () => ({
  categoryService: {
    getAllCategories: jest.fn(),
  },
}));

jest.mock('../SettingsService', () => ({
  settingsService: {
    getSettings: jest.fn(),
    updateLastBackupDate: jest.fn(),
    importSettings: jest.fn(),
    shouldShowBackupReminder: jest.fn(),
    getLastBackupDate: jest.fn(),
  },
}));

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    transaction: jest.fn(),
    tasks: {
      get: jest.fn(),
      add: jest.fn(),
      update: jest.fn(),
    },
    categories: {
      get: jest.fn(),
      add: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('ExportImportService', () => {
  let exportImportService: ExportImportService;
  let mockTask: Task;
  let mockCategory: Category;
  let mockSettings: AppSettings;
  let mockExportData: ExportData;

  beforeEach(() => {
    exportImportService = new ExportImportService();

    mockTask = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Test Task',
      description: 'Test Description',
      categoryId: '550e8400-e29b-41d4-a716-446655440001',
      createdAt: new Date('2024-01-01'),
      lastCompletedAt: new Date('2024-01-02'),
      expectedFrequency: { value: 7, unit: 'day' },
      timeCommitment: '1hr',
      isArchived: false,
      notes: 'Test notes',
    };

    mockCategory = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Test Category',
      color: '#FF0000',
      icon: 'test-icon',
      isDefault: false,
      order: 1,
    };

    mockSettings = {
      id: 'default',
      lastBackupDate: new Date('2024-01-01'),
      currentView: 'category',
      theme: 'system',
      textSize: 'default',
      highContrast: false,
      reducedMotion: false,
      onboardingCompleted: true,
    };

    mockExportData = {
      version: '1.0.0',
      exportDate: new Date('2024-01-01'),
      tasks: [mockTask],
      categories: [mockCategory],
      settings: mockSettings,
    };

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('exportToJSON', () => {
    it('should export all data to JSON format', async () => {
      (taskService.getAllTasks as jest.Mock).mockResolvedValue([mockTask]);
      (categoryService.getAllCategories as jest.Mock).mockResolvedValue([mockCategory]);
      (settingsService.getSettings as jest.Mock).mockResolvedValue(mockSettings);

      const result = await exportImportService.exportToJSON();

      const parsedResult = JSON.parse(result);
      expect(parsedResult).toMatchObject({
        version: '1.0.0',
        exportDate: expect.any(String),
        tasks: [expect.objectContaining({ id: '550e8400-e29b-41d4-a716-446655440000' })],
        categories: [expect.objectContaining({ id: '550e8400-e29b-41d4-a716-446655440001' })],
        settings: expect.objectContaining({ id: 'default' }),
      });
    });

    it('should throw error when data preparation fails', async () => {
      (taskService.getAllTasks as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(exportImportService.exportToJSON()).rejects.toThrow(
        'Failed to export data to JSON'
      );
    });
  });

  describe('exportTasksToCSV', () => {
    it('should export tasks to CSV format', async () => {
      (taskService.getAllTasks as jest.Mock).mockResolvedValue([mockTask]);
      (categoryService.getAllCategories as jest.Mock).mockResolvedValue([mockCategory]);

      const result = await exportImportService.exportTasksToCSV();

      const lines = result.split('\n');
      expect(lines[0]).toContain('ID,Name,Description,Category');
      expect(lines[1]).toContain(
        '550e8400-e29b-41d4-a716-446655440000,Test Task,Test Description,Test Category'
      );
    });

    it('should handle tasks with commas in fields', async () => {
      const taskWithCommas = {
        ...mockTask,
        name: 'Task, with commas',
        description: 'Description, with, multiple, commas',
      };

      (taskService.getAllTasks as jest.Mock).mockResolvedValue([taskWithCommas]);
      (categoryService.getAllCategories as jest.Mock).mockResolvedValue([mockCategory]);

      const result = await exportImportService.exportTasksToCSV();

      expect(result).toContain('"Task, with commas"');
      expect(result).toContain('"Description, with, multiple, commas"');
    });

    it('should handle tasks with quotes in fields', async () => {
      const taskWithQuotes = {
        ...mockTask,
        name: 'Task with "quotes"',
        notes: 'Notes with "multiple" "quotes"',
      };

      (taskService.getAllTasks as jest.Mock).mockResolvedValue([taskWithQuotes]);
      (categoryService.getAllCategories as jest.Mock).mockResolvedValue([mockCategory]);

      const result = await exportImportService.exportTasksToCSV();

      expect(result).toContain('"Task with ""quotes"""');
      expect(result).toContain('"Notes with ""multiple"" ""quotes"""');
    });

    it('should throw error when export fails', async () => {
      (taskService.getAllTasks as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(exportImportService.exportTasksToCSV()).rejects.toThrow(
        'Failed to export tasks to CSV'
      );
    });
  });

  describe('importFromJSON', () => {
    it('should import valid JSON data successfully', async () => {
      const jsonData = JSON.stringify(mockExportData);

      const mockTransaction = jest.fn().mockImplementation(async (_mode, _tables, callback) => {
        await callback();
      });
      (db.transaction as jest.Mock).mockImplementation(mockTransaction);

      (db.categories.get as jest.Mock)
        .mockResolvedValueOnce(null) // First call for category import check
        .mockResolvedValueOnce(mockCategory); // Second call for task import check
      (db.categories.add as jest.Mock).mockResolvedValue('test-category-id');
      (db.tasks.get as jest.Mock).mockResolvedValue(null);
      (db.tasks.add as jest.Mock).mockResolvedValue('test-task-id');
      (settingsService.importSettings as jest.Mock).mockResolvedValue(mockSettings);
      (settingsService.updateLastBackupDate as jest.Mock).mockResolvedValue(undefined);

      const result = await exportImportService.importFromJSON(jsonData);

      expect(result).toEqual({
        tasksImported: 1,
        categoriesImported: 1,
        settingsImported: true,
        errors: [],
      });
      expect(settingsService.updateLastBackupDate).toHaveBeenCalled();
    });

    it('should handle existing categories and tasks by updating them', async () => {
      const jsonData = JSON.stringify(mockExportData);

      const mockTransaction = jest.fn().mockImplementation(async (_mode, _tables, callback) => {
        await callback();
      });
      (db.transaction as jest.Mock).mockImplementation(mockTransaction);

      (db.categories.get as jest.Mock).mockResolvedValue(mockCategory);
      (db.categories.update as jest.Mock).mockResolvedValue(1);
      (db.tasks.get as jest.Mock).mockResolvedValue(mockTask);
      (db.tasks.update as jest.Mock).mockResolvedValue(1);
      (settingsService.importSettings as jest.Mock).mockResolvedValue(mockSettings);
      (settingsService.updateLastBackupDate as jest.Mock).mockResolvedValue(undefined);

      const result = await exportImportService.importFromJSON(jsonData);

      expect(result.tasksImported).toBe(1);
      expect(result.categoriesImported).toBe(1);
      expect(db.categories.update).toHaveBeenCalled();
      expect(db.tasks.update).toHaveBeenCalled();
    });

    it('should collect errors for failed imports', async () => {
      const jsonData = JSON.stringify(mockExportData);

      const mockTransaction = jest.fn().mockImplementation(async (_mode, _tables, callback) => {
        await callback();
      });
      (db.transaction as jest.Mock).mockImplementation(mockTransaction);

      (db.categories.get as jest.Mock).mockResolvedValue(null);
      (db.categories.add as jest.Mock).mockRejectedValue(new Error('Category import failed'));
      (db.tasks.get as jest.Mock).mockResolvedValue(null);
      (settingsService.importSettings as jest.Mock).mockRejectedValue(
        new Error('Settings import failed')
      );
      (settingsService.updateLastBackupDate as jest.Mock).mockResolvedValue(undefined);

      const result = await exportImportService.importFromJSON(jsonData);

      expect(result.errors).toHaveLength(3);
      expect(result.errors[0]).toContain('Failed to import category');
      expect(result.errors[1]).toContain('Task "Test Task" references non-existent category');
      expect(result.errors[2]).toContain('Failed to import settings');
    });

    it('should throw error for invalid JSON', async () => {
      const invalidJson = '{ invalid json }';

      await expect(exportImportService.importFromJSON(invalidJson)).rejects.toThrow(
        'Invalid JSON format'
      );
    });

    it('should throw error for invalid export data structure', async () => {
      const invalidData = JSON.stringify({ invalid: 'data' });

      await expect(exportImportService.importFromJSON(invalidData)).rejects.toThrow(
        'Invalid export data format'
      );
    });
  });

  describe('createBackup', () => {
    it('should create backup with timestamp filename', async () => {
      (taskService.getAllTasks as jest.Mock).mockResolvedValue([mockTask]);
      (categoryService.getAllCategories as jest.Mock).mockResolvedValue([mockCategory]);
      (settingsService.getSettings as jest.Mock).mockResolvedValue(mockSettings);
      (settingsService.updateLastBackupDate as jest.Mock).mockResolvedValue(undefined);

      const result = await exportImportService.createBackup();

      expect(result.filename).toMatch(
        /^how-long-since-backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.json$/
      );
      expect(result.data).toBeTruthy();
      expect(settingsService.updateLastBackupDate).toHaveBeenCalled();
    });

    it('should throw error when backup creation fails', async () => {
      (taskService.getAllTasks as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(exportImportService.createBackup()).rejects.toThrow('Failed to create backup');
    });
  });

  describe('getBackupStats', () => {
    it('should return backup statistics', async () => {
      (taskService.getAllTasks as jest.Mock).mockResolvedValue([mockTask, mockTask]);
      (categoryService.getAllCategories as jest.Mock).mockResolvedValue([mockCategory]);
      (settingsService.getLastBackupDate as jest.Mock).mockResolvedValue(new Date('2024-01-01'));
      (settingsService.shouldShowBackupReminder as jest.Mock).mockResolvedValue(false);

      const result = await exportImportService.getBackupStats();

      expect(result).toEqual({
        totalTasks: 2,
        totalCategories: 1,
        lastBackupDate: new Date('2024-01-01'),
        shouldShowReminder: false,
      });
    });

    it('should throw error when stats retrieval fails', async () => {
      (taskService.getAllTasks as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(exportImportService.getBackupStats()).rejects.toThrow(
        'Failed to get backup stats'
      );
    });
  });
});
