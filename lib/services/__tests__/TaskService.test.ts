// TaskService unit tests
import { db } from '@/lib/db';
import type { Task, TaskFormData } from '@/types';
import { TaskService } from '../TaskService';

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    tasks: {
      orderBy: jest.fn(),
      where: jest.fn(),
      get: jest.fn(),
      add: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      toArray: jest.fn(),
    },
  },
}));

describe('TaskService', () => {
  let taskService: TaskService;
  let mockTask: Task;
  let mockTaskFormData: TaskFormData;

  beforeEach(() => {
    taskService = new TaskService();

    mockTask = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Test Task',
      description: 'Test Description',
      categoryId: '550e8400-e29b-41d4-a716-446655440001',
      createdAt: new Date('2024-01-01'),
      lastCompletedAt: null,
      expectedFrequency: { value: 7, unit: 'day' },
      timeCommitment: '1hr',
      isArchived: false,
      notes: 'Test notes',
    };

    mockTaskFormData = {
      name: 'Test Task',
      description: 'Test Description',
      categoryId: '550e8400-e29b-41d4-a716-446655440001',
      expectedFrequency: { value: 7, unit: 'day' },
      timeCommitment: '1hr',
      notes: 'Test notes',
    };

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getAllTasks', () => {
    it('should return all non-archived tasks by default', async () => {
      const mockTasks = [mockTask];
      const mockWhere = {
        equals: jest.fn().mockReturnValue({
          reverse: jest.fn().mockReturnValue({
            sortBy: jest.fn().mockResolvedValue(mockTasks),
          }),
        }),
      };

      (db.tasks.where as jest.Mock).mockReturnValue(mockWhere);

      const result = await taskService.getAllTasks();

      expect(db.tasks.where).toHaveBeenCalledWith('isArchived');
      expect(mockWhere.equals).toHaveBeenCalledWith(false);
      expect(result).toEqual(mockTasks);
    });

    it('should return all tasks including archived when requested', async () => {
      const mockTasks = [mockTask];
      const mockOrderBy = {
        reverse: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockTasks),
        }),
      };

      (db.tasks.orderBy as jest.Mock).mockReturnValue(mockOrderBy);

      const result = await taskService.getAllTasks(true);

      expect(db.tasks.orderBy).toHaveBeenCalledWith('createdAt');
      expect(result).toEqual(mockTasks);
    });

    it('should throw error when database operation fails', async () => {
      (db.tasks.where as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(taskService.getAllTasks()).rejects.toThrow(
        'Failed to fetch tasks: Error: Database error'
      );
    });
  });

  describe('getTaskById', () => {
    it('should return task when found', async () => {
      (db.tasks.get as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskService.getTaskById('test-task-id');

      expect(db.tasks.get).toHaveBeenCalledWith('test-task-id');
      expect(result).toEqual(mockTask);
    });

    it('should return null when task not found', async () => {
      (db.tasks.get as jest.Mock).mockResolvedValue(undefined);

      const result = await taskService.getTaskById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should throw error when database operation fails', async () => {
      (db.tasks.get as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(taskService.getTaskById('test-task-id')).rejects.toThrow(
        'Failed to fetch task: Error: Database error'
      );
    });
  });

  describe('createTask', () => {
    it('should create task successfully with valid data', async () => {
      (db.tasks.add as jest.Mock).mockResolvedValue('test-task-id');

      // Mock crypto.randomUUID
      const mockUUID = '550e8400-e29b-41d4-a716-446655440002';
      const mockCrypto = {
        randomUUID: jest.fn().mockReturnValue(mockUUID),
      };
      Object.defineProperty(global, 'crypto', {
        value: mockCrypto,
        writable: true,
      });

      const result = await taskService.createTask(mockTaskFormData);

      expect(db.tasks.add).toHaveBeenCalled();
      expect(result.id).toBe(mockUUID);
      expect(result.name).toBe(mockTaskFormData.name);
      expect(result.isArchived).toBe(false);
      expect(result.lastCompletedAt).toBeNull();
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should throw error with invalid task data', async () => {
      const invalidData = { ...mockTaskFormData, name: '' }; // Empty name

      await expect(taskService.createTask(invalidData)).rejects.toThrow('Invalid task data');
    });

    it('should throw error when database operation fails', async () => {
      (db.tasks.add as jest.Mock).mockRejectedValue(new Error('Database error'));
      global.crypto = { randomUUID: jest.fn().mockReturnValue('test-uuid') } as any;

      await expect(taskService.createTask(mockTaskFormData)).rejects.toThrow(
        'Failed to create task'
      );
    });
  });

  describe('updateTask', () => {
    it('should update task successfully', async () => {
      const updates = { name: 'Updated Task Name' };
      const updatedTask = { ...mockTask, ...updates };

      (db.tasks.get as jest.Mock)
        .mockResolvedValueOnce(mockTask) // First call for existence check
        .mockResolvedValueOnce(updatedTask); // Second call for return value
      (db.tasks.update as jest.Mock).mockResolvedValue(1);

      const result = await taskService.updateTask('test-task-id', updates);

      expect(db.tasks.update).toHaveBeenCalledWith('test-task-id', updates);
      expect(result.name).toBe('Updated Task Name');
    });

    it('should throw error when task not found', async () => {
      (db.tasks.get as jest.Mock).mockResolvedValue(null);

      await expect(taskService.updateTask('non-existent-id', { name: 'Updated' })).rejects.toThrow(
        'Task not found'
      );
    });

    it('should throw error with invalid update data', async () => {
      (db.tasks.get as jest.Mock).mockResolvedValue(mockTask);
      const invalidUpdates = { name: '' }; // Empty name

      await expect(taskService.updateTask('test-task-id', invalidUpdates)).rejects.toThrow(
        'Task validation failed'
      );
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      (db.tasks.get as jest.Mock).mockResolvedValue(mockTask);
      (db.tasks.delete as jest.Mock).mockResolvedValue(1);

      await taskService.deleteTask('test-task-id');

      expect(db.tasks.delete).toHaveBeenCalledWith('test-task-id');
    });

    it('should throw error when task not found', async () => {
      (db.tasks.get as jest.Mock).mockResolvedValue(null);

      await expect(taskService.deleteTask('non-existent-id')).rejects.toThrow('Task not found');
    });
  });

  describe('archiveTask', () => {
    it('should archive task successfully', async () => {
      (db.tasks.get as jest.Mock).mockResolvedValue(mockTask);
      (db.tasks.update as jest.Mock).mockResolvedValue(1);

      const result = await taskService.archiveTask('test-task-id');

      expect(db.tasks.update).toHaveBeenCalledWith('test-task-id', { isArchived: true });
      expect(result.isArchived).toBe(true);
    });

    it('should throw error when task not found', async () => {
      (db.tasks.get as jest.Mock).mockResolvedValue(null);

      await expect(taskService.archiveTask('non-existent-id')).rejects.toThrow('Task not found');
    });
  });

  describe('completeTask', () => {
    it('should mark task as completed', async () => {
      (db.tasks.get as jest.Mock).mockResolvedValue(mockTask);
      (db.tasks.update as jest.Mock).mockResolvedValue(1);

      const result = await taskService.completeTask('test-task-id');

      expect(db.tasks.update).toHaveBeenCalledWith(
        'test-task-id',
        expect.objectContaining({
          lastCompletedAt: expect.any(Date),
        })
      );
      expect(result.lastCompletedAt).toBeInstanceOf(Date);
    });

    it('should throw error when task not found', async () => {
      (db.tasks.get as jest.Mock).mockResolvedValue(null);

      await expect(taskService.completeTask('non-existent-id')).rejects.toThrow('Task not found');
    });
  });

  describe('isTaskOverdue', () => {
    it('should return false for task without expected frequency', () => {
      const taskWithoutFrequency = { ...mockTask, expectedFrequency: undefined };

      const result = taskService.isTaskOverdue(taskWithoutFrequency);

      expect(result).toBe(false);
    });

    it('should return false for task never completed', () => {
      const taskNeverCompleted = { ...mockTask, lastCompletedAt: null };

      const result = taskService.isTaskOverdue(taskNeverCompleted);

      expect(result).toBe(false);
    });

    it('should return true for overdue daily task', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 2); // 2 days ago

      const overdueTask = {
        ...mockTask,
        lastCompletedAt: yesterday,
        expectedFrequency: { value: 1, unit: 'day' as const },
      };

      const result = taskService.isTaskOverdue(overdueTask);

      expect(result).toBe(true);
    });

    it('should return false for task completed recently', () => {
      const today = new Date();

      const recentTask = {
        ...mockTask,
        lastCompletedAt: today,
        expectedFrequency: { value: 7, unit: 'day' as const },
      };

      const result = taskService.isTaskOverdue(recentTask);

      expect(result).toBe(false);
    });

    it('should handle weekly frequency correctly', () => {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const overdueWeeklyTask = {
        ...mockTask,
        lastCompletedAt: twoWeeksAgo,
        expectedFrequency: { value: 1, unit: 'week' as const },
      };

      const result = taskService.isTaskOverdue(overdueWeeklyTask);

      expect(result).toBe(true);
    });

    it('should handle monthly frequency correctly', () => {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      const overdueMonthlyTask = {
        ...mockTask,
        lastCompletedAt: twoMonthsAgo,
        expectedFrequency: { value: 1, unit: 'month' as const },
      };

      const result = taskService.isTaskOverdue(overdueMonthlyTask);

      expect(result).toBe(true);
    });

    it('should handle yearly frequency correctly', () => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      const overdueYearlyTask = {
        ...mockTask,
        lastCompletedAt: twoYearsAgo,
        expectedFrequency: { value: 1, unit: 'year' as const },
      };

      const result = taskService.isTaskOverdue(overdueYearlyTask);

      expect(result).toBe(true);
    });
  });

  describe('getOverdueTasks', () => {
    it('should return only overdue tasks', async () => {
      const recentTask = {
        ...mockTask,
        id: 'recent-task',
        lastCompletedAt: new Date(),
        expectedFrequency: { value: 7, unit: 'day' as const },
      };

      const overdueTask = {
        ...mockTask,
        id: 'overdue-task',
        lastCompletedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        expectedFrequency: { value: 7, unit: 'day' as const },
      };

      const mockWhere = {
        equals: jest.fn().mockReturnValue({
          reverse: jest.fn().mockReturnValue({
            sortBy: jest.fn().mockResolvedValue([recentTask, overdueTask]),
          }),
        }),
      };

      (db.tasks.where as jest.Mock).mockReturnValue(mockWhere);

      const result = await taskService.getOverdueTasks();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('overdue-task');
    });
  });

  describe('searchTasks', () => {
    it('should return tasks matching search query in name', async () => {
      const matchingTask = { ...mockTask, name: 'Clean Kitchen' };
      const nonMatchingTask = { ...mockTask, id: 'task-2', name: 'Walk Dog' };

      const mockWhere = {
        equals: jest.fn().mockReturnValue({
          reverse: jest.fn().mockReturnValue({
            sortBy: jest.fn().mockResolvedValue([matchingTask, nonMatchingTask]),
          }),
        }),
      };

      (db.tasks.where as jest.Mock).mockReturnValue(mockWhere);

      const result = await taskService.searchTasks('kitchen');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Clean Kitchen');
    });

    it('should return all tasks when search query is empty', async () => {
      const allTasks = [mockTask];

      const mockWhere = {
        equals: jest.fn().mockReturnValue({
          reverse: jest.fn().mockReturnValue({
            sortBy: jest.fn().mockResolvedValue(allTasks),
          }),
        }),
      };

      (db.tasks.where as jest.Mock).mockReturnValue(mockWhere);

      const result = await taskService.searchTasks('');

      expect(result).toEqual(allTasks);
    });
  });
});
