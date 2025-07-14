// Task service for managing task-related operations
import { db } from '@/lib/db';
import { validateTask, validateTaskFormData } from '@/lib/validation/schemas';
import type { Task, TaskFormData, TaskStats } from '@/types';

export class TaskService {
  /**
   * Get all tasks (excluding archived by default)
   */
  async getAllTasks(includeArchived = false): Promise<Task[]> {
    try {
      if (includeArchived) {
        return await db.tasks.orderBy('createdAt').reverse().toArray();
      }
      return await db.tasks.where('isArchived').equals(false).reverse().sortBy('createdAt');
    } catch (error) {
      throw new Error(`Failed to fetch tasks: ${error}`);
    }
  }

  /**
   * Get task by ID
   */
  async getTaskById(id: string): Promise<Task | null> {
    try {
      const task = await db.tasks.get(id);
      return task || null;
    } catch (error) {
      throw new Error(`Failed to fetch task: ${error}`);
    }
  }

  /**
   * Create a new task
   */
  async createTask(taskData: TaskFormData): Promise<Task> {
    try {
      // Validate form data
      const formValidation = validateTaskFormData(taskData);
      if (!formValidation.success) {
        throw new Error(`Invalid task data: ${formValidation.error.message}`);
      }

      // Create task object with required fields
      const task: Task = {
        id: crypto.randomUUID(),
        ...taskData,
        createdAt: new Date(),
        lastCompletedAt: null,
        isArchived: false,
      };

      // Validate complete task object
      const taskValidation = validateTask(task);
      if (!taskValidation.success) {
        throw new Error(`Task validation failed: ${taskValidation.error.message}`);
      }

      // Save to database
      await db.tasks.add(task);
      return task;
    } catch (error) {
      throw new Error(`Failed to create task: ${error}`);
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(id: string, updates: Partial<TaskFormData>): Promise<Task> {
    try {
      const existingTask = await this.getTaskById(id);
      if (!existingTask) {
        throw new Error('Task not found');
      }

      // Merge updates with existing task
      const updatedTask: Task = {
        ...existingTask,
        ...updates,
      };

      // Validate updated task
      const validation = validateTask(updatedTask);
      if (!validation.success) {
        throw new Error(`Task validation failed: ${validation.error.message}`);
      }

      // Update in database
      await db.tasks.update(id, updates);

      // Return updated task
      const result = await this.getTaskById(id);
      if (!result) {
        throw new Error('Failed to retrieve updated task');
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to update task: ${error}`);
    }
  }

  /**
   * Delete a task permanently
   */
  async deleteTask(id: string): Promise<void> {
    try {
      const task = await this.getTaskById(id);
      if (!task) {
        throw new Error('Task not found');
      }

      await db.tasks.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete task: ${error}`);
    }
  }

  /**
   * Archive a task (soft delete)
   */
  async archiveTask(id: string): Promise<Task> {
    try {
      const task = await this.getTaskById(id);
      if (!task) {
        throw new Error('Task not found');
      }

      const updatedTask = { ...task, isArchived: true };
      await db.tasks.update(id, { isArchived: true });

      return updatedTask;
    } catch (error) {
      throw new Error(`Failed to archive task: ${error}`);
    }
  }

  /**
   * Restore an archived task
   */
  async restoreTask(id: string): Promise<Task> {
    try {
      const task = await this.getTaskById(id);
      if (!task) {
        throw new Error('Task not found');
      }

      const updatedTask = { ...task, isArchived: false };
      await db.tasks.update(id, { isArchived: false });

      return updatedTask;
    } catch (error) {
      throw new Error(`Failed to restore task: ${error}`);
    }
  }

  /**
   * Mark a task as completed
   */
  async completeTask(id: string): Promise<Task> {
    try {
      const task = await this.getTaskById(id);
      if (!task) {
        throw new Error('Task not found');
      }

      const now = new Date();
      await db.tasks.update(id, { lastCompletedAt: now });

      const updatedTask = { ...task, lastCompletedAt: now };
      return updatedTask;
    } catch (error) {
      throw new Error(`Failed to complete task: ${error}`);
    }
  }

  /**
   * Undo task completion (set lastCompletedAt to null)
   */
  async undoTaskCompletion(id: string): Promise<Task> {
    try {
      const task = await this.getTaskById(id);
      if (!task) {
        throw new Error('Task not found');
      }

      await db.tasks.update(id, { lastCompletedAt: null });

      const updatedTask = { ...task, lastCompletedAt: null };
      return updatedTask;
    } catch (error) {
      throw new Error(`Failed to undo task completion: ${error}`);
    }
  }

  /**
   * Get tasks by category
   */
  async getTasksByCategory(categoryId: string, includeArchived = false): Promise<Task[]> {
    try {
      let query = db.tasks.where('categoryId').equals(categoryId);

      if (!includeArchived) {
        query = query.and((task) => !task.isArchived);
      }

      return await query.reverse().sortBy('createdAt');
    } catch (error) {
      throw new Error(`Failed to fetch tasks by category: ${error}`);
    }
  }

  /**
   * Get overdue tasks based on expected frequency
   */
  async getOverdueTasks(): Promise<Task[]> {
    try {
      const tasks = await this.getAllTasks();
      const now = new Date();

      return tasks.filter((task) => {
        if (!task.expectedFrequency || !task.lastCompletedAt) {
          return false;
        }

        return this.isTaskOverdue(task, now);
      });
    } catch (error) {
      throw new Error(`Failed to fetch overdue tasks: ${error}`);
    }
  }

  /**
   * Check if a task is overdue
   */
  isTaskOverdue(task: Task, currentDate = new Date()): boolean {
    if (!task.expectedFrequency || !task.lastCompletedAt) {
      return false;
    }

    const { value, unit } = task.expectedFrequency;
    const lastCompleted = new Date(task.lastCompletedAt);

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

    return currentDate > nextDueDate;
  }

  /**
   * Get tasks by time commitment
   */
  async getTasksByTimeCommitment(includeArchived = false): Promise<Record<string, Task[]>> {
    try {
      const tasks = await this.getAllTasks(includeArchived);

      const grouped: Record<string, Task[]> = {
        '15min': [],
        '30min': [],
        '1hr': [],
        '2hrs': [],
        '4hrs': [],
        '5hrs+': [],
        unknown: [],
      };

      tasks.forEach((task) => {
        const commitment = task.timeCommitment || 'unknown';
        grouped[commitment].push(task);
      });

      return grouped;
    } catch (error) {
      throw new Error(`Failed to group tasks by time commitment: ${error}`);
    }
  }

  /**
   * Get task statistics
   */
  async getTaskStats(): Promise<TaskStats> {
    try {
      const tasks = await this.getAllTasks();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const completedToday = tasks.filter(
        (task) =>
          task.lastCompletedAt && task.lastCompletedAt >= today && task.lastCompletedAt < tomorrow
      ).length;

      const overdueTasks = await this.getOverdueTasks();

      // Calculate average completion time (days between creation and last completion)
      const completedTasks = tasks.filter((task) => task.lastCompletedAt);
      const totalCompletionTime = completedTasks.reduce((sum, task) => {
        if (!task.lastCompletedAt) {
          return sum;
        }
        const daysDiff = Math.floor(
          (task.lastCompletedAt.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + daysDiff;
      }, 0);

      const averageCompletionTime =
        completedTasks.length > 0 ? totalCompletionTime / completedTasks.length : 0;

      return {
        totalTasks: tasks.length,
        completedToday,
        overdueTasks: overdueTasks.length,
        averageCompletionTime: Math.round(averageCompletionTime * 100) / 100,
      };
    } catch (error) {
      throw new Error(`Failed to calculate task stats: ${error}`);
    }
  }

  /**
   * Search tasks by name or description
   */
  async searchTasks(query: string, includeArchived = false): Promise<Task[]> {
    try {
      const tasks = await this.getAllTasks(includeArchived);
      const searchTerm = query.toLowerCase().trim();

      if (!searchTerm) {
        return tasks;
      }

      return tasks.filter(
        (task) =>
          task.name.toLowerCase().includes(searchTerm) ||
          task.description.toLowerCase().includes(searchTerm) ||
          task.notes.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      throw new Error(`Failed to search tasks: ${error}`);
    }
  }
}

// Export singleton instance
export const taskService = new TaskService();
