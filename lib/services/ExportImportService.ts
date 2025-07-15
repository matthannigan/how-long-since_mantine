// Export/Import service for data backup and restore functionality
import { db } from '@/lib/db';
import { validateImportData } from '@/lib/validation/schemas';
import type { ExportData, Task } from '@/types';
import { categoryService } from './CategoryService';
import { settingsService } from './SettingsService';
import { taskService } from './TaskService';

export class ExportImportService {
  private readonly APP_VERSION = '1.0.0';

  /**
   * Export all data to JSON format
   */
  async exportToJSON(): Promise<string> {
    try {
      const exportData = await this.prepareExportData();
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      throw new Error(`Failed to export data to JSON: ${error}`);
    }
  }

  /**
   * Export tasks to CSV format
   */
  async exportTasksToCSV(): Promise<string> {
    try {
      const tasks = await taskService.getAllTasks(true); // Include archived
      const categories = await categoryService.getAllCategories();

      // Create category lookup map
      const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));

      // CSV headers
      const headers = [
        'ID',
        'Name',
        'Description',
        'Category',
        'Created At',
        'Last Completed At',
        'Expected Frequency Value',
        'Expected Frequency Unit',
        'Time Commitment',
        'Is Archived',
        'Notes',
      ];

      // Convert tasks to CSV rows
      const rows = tasks.map((task) => [
        task.id,
        this.escapeCsvValue(task.name),
        this.escapeCsvValue(task.description),
        this.escapeCsvValue(categoryMap.get(task.categoryId) || 'Unknown'),
        task.createdAt.toISOString(),
        task.lastCompletedAt?.toISOString() || '',
        task.expectedFrequency?.value?.toString() || '',
        task.expectedFrequency?.unit || '',
        task.timeCommitment || '',
        task.isArchived.toString(),
        this.escapeCsvValue(task.notes),
      ]);

      // Combine headers and rows
      const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');

      return csvContent;
    } catch (error) {
      throw new Error(`Failed to export tasks to CSV: ${error}`);
    }
  }

  /**
   * Import data from JSON format
   */
  async importFromJSON(jsonData: string): Promise<{
    tasksImported: number;
    categoriesImported: number;
    settingsImported: boolean;
    errors: string[];
  }> {
    try {
      // Parse JSON
      let parsedData: any;
      try {
        parsedData = JSON.parse(jsonData);
      } catch (parseError) {
        throw new Error('Invalid JSON format');
      }

      // Validate import data structure (handles date string conversion)
      const validation = validateImportData(parsedData);
      if (!validation.success) {
        throw new Error(`Invalid export data format: ${JSON.stringify(validation.error.issues)}`);
      }

      const exportData = validation.data;
      const errors: string[] = [];
      let tasksImported = 0;
      let categoriesImported = 0;
      let settingsImported = false;

      // Import in transaction to ensure data consistency
      await db.transaction('rw', [db.tasks, db.categories, db.settings], async () => {
        // Import categories first (tasks depend on categories)
        for (const category of exportData.categories) {
          try {
            // Check if category already exists
            const existingCategory = await db.categories.get(category.id);
            if (existingCategory) {
              // Update existing category
              await db.categories.update(category.id, category);
            } else {
              // Add new category
              await db.categories.add(category);
            }
            categoriesImported++;
          } catch (error) {
            errors.push(`Failed to import category "${category.name}": ${error}`);
          }
        }

        // Import tasks
        for (const task of exportData.tasks) {
          try {
            // Verify category exists
            const categoryExists = await db.categories.get(task.categoryId);
            if (!categoryExists) {
              errors.push(`Task "${task.name}" references non-existent category`);
              continue;
            }

            // Check if task already exists
            const existingTask = await db.tasks.get(task.id);
            if (existingTask) {
              // Update existing task
              await db.tasks.update(task.id, task);
            } else {
              // Add new task
              await db.tasks.add(task);
            }
            tasksImported++;
          } catch (error) {
            errors.push(`Failed to import task "${task.name}": ${error}`);
          }
        }

        // Import settings
        try {
          await settingsService.importSettings(exportData.settings);
          settingsImported = true;
        } catch (error) {
          errors.push(`Failed to import settings: ${error}`);
        }
      });

      // Update last backup date
      await settingsService.updateLastBackupDate();

      return {
        tasksImported,
        categoriesImported,
        settingsImported,
        errors,
      };
    } catch (error) {
      throw new Error(`Failed to import data from JSON: ${error}`);
    }
  }

  /**
   * Import tasks from CSV format
   */
  async importTasksFromCSV(csvData: string): Promise<{
    tasksImported: number;
    errors: string[];
  }> {
    try {
      const lines = csvData.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      // Parse header
      const headers = this.parseCsvRow(lines[0]);
      const expectedHeaders = [
        'ID',
        'Name',
        'Description',
        'Category',
        'Created At',
        'Last Completed At',
        'Expected Frequency Value',
        'Expected Frequency Unit',
        'Time Commitment',
        'Is Archived',
        'Notes',
      ];

      // Validate headers
      const missingHeaders = expectedHeaders.filter((h) => !headers.includes(h));
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
      }

      // Get categories for lookup
      const categories = await categoryService.getAllCategories();
      const categoryNameMap = new Map(categories.map((cat) => [cat.name.toLowerCase(), cat.id]));

      const errors: string[] = [];
      let tasksImported = 0;

      // Process data rows
      for (let i = 1; i < lines.length; i++) {
        try {
          const row = this.parseCsvRow(lines[i]);
          if (row.length !== headers.length) {
            errors.push(`Row ${i + 1}: Column count mismatch`);
            continue;
          }

          // Create row object
          const rowData: Record<string, string> = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index];
          });

          // Validate and convert task data
          const task = await this.convertCsvRowToTask(rowData, categoryNameMap, i + 1);
          if (!task) {
            continue; // Error already added to errors array
          }

          // Import task
          const existingTask = await db.tasks.get(task.id);
          if (existingTask) {
            await db.tasks.update(task.id, task);
          } else {
            await db.tasks.add(task);
          }

          tasksImported++;
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error}`);
        }
      }

      return {
        tasksImported,
        errors,
      };
    } catch (error) {
      throw new Error(`Failed to import tasks from CSV: ${error}`);
    }
  }

  /**
   * Create a backup file with current timestamp
   */
  async createBackup(): Promise<{ filename: string; data: string }> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `how-long-since-backup-${timestamp}.json`;
      const data = await this.exportToJSON();

      // Update last backup date
      await settingsService.updateLastBackupDate();

      return { filename, data };
    } catch (error) {
      throw new Error(`Failed to create backup: ${error}`);
    }
  }

  /**
   * Get backup statistics
   */
  async getBackupStats(): Promise<{
    totalTasks: number;
    totalCategories: number;
    lastBackupDate: Date | null;
    shouldShowReminder: boolean;
  }> {
    try {
      const tasks = await taskService.getAllTasks(true);
      const categories = await categoryService.getAllCategories();
      const lastBackupDate = await settingsService.getLastBackupDate();
      const shouldShowReminder = await settingsService.shouldShowBackupReminder();

      return {
        totalTasks: tasks.length,
        totalCategories: categories.length,
        lastBackupDate,
        shouldShowReminder,
      };
    } catch (error) {
      throw new Error(`Failed to get backup stats: ${error}`);
    }
  }

  /**
   * Prepare export data structure
   */
  private async prepareExportData(): Promise<ExportData> {
    try {
      const tasks = await taskService.getAllTasks(true); // Include archived
      const categories = await categoryService.getAllCategories();
      const settings = await settingsService.getSettings();

      return {
        version: this.APP_VERSION,
        exportDate: new Date(),
        tasks,
        categories,
        settings,
      };
    } catch (error) {
      throw new Error(`Failed to prepare export data: ${error}`);
    }
  }

  /**
   * Escape CSV values to handle commas, quotes, and newlines
   */
  private escapeCsvValue(value: string): string {
    if (!value) {
      return '';
    }

    // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }

    return value;
  }

  /**
   * Parse CSV row handling quoted values
   */
  private parseCsvRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < row.length) {
      const char = row[i];

      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current);
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

    // Add last field
    result.push(current);

    return result;
  }

  /**
   * Convert CSV row data to Task object
   */
  private async convertCsvRowToTask(
    rowData: Record<string, string>,
    categoryNameMap: Map<string, string>,
    rowNumber: number
  ): Promise<Task | null> {
    try {
      // Find category ID
      const categoryName = rowData.Category?.toLowerCase();
      const categoryId = categoryNameMap.get(categoryName);
      if (!categoryId) {
        throw new Error(`Unknown category: ${rowData.Category}`);
      }

      // Parse dates
      const createdAt = new Date(rowData['Created At']);
      if (isNaN(createdAt.getTime())) {
        throw new Error('Invalid Created At date');
      }

      let lastCompletedAt: Date | null = null;
      if (rowData['Last Completed At']) {
        lastCompletedAt = new Date(rowData['Last Completed At']);
        if (isNaN(lastCompletedAt.getTime())) {
          throw new Error('Invalid Last Completed At date');
        }
      }

      // Parse expected frequency
      let expectedFrequency;
      if (rowData['Expected Frequency Value'] && rowData['Expected Frequency Unit']) {
        const value = parseInt(rowData['Expected Frequency Value'], 10);
        const unit = rowData['Expected Frequency Unit'] as any;

        if (isNaN(value) || !['day', 'week', 'month', 'year'].includes(unit)) {
          throw new Error('Invalid expected frequency');
        }

        expectedFrequency = { value, unit };
      }

      // Parse time commitment
      let timeCommitment;
      if (rowData['Time Commitment']) {
        const validCommitments = ['15min', '30min', '1hr', '2hrs', '4hrs', '5hrs+'];
        if (validCommitments.includes(rowData['Time Commitment'])) {
          timeCommitment = rowData['Time Commitment'] as any;
        }
      }

      // Parse boolean
      const isArchived = rowData['Is Archived']?.toLowerCase() === 'true';

      const task: Task = {
        id: rowData.ID || crypto.randomUUID(),
        name: rowData.Name || '',
        description: rowData.Description || '',
        categoryId,
        createdAt,
        lastCompletedAt,
        expectedFrequency,
        timeCommitment,
        isArchived,
        notes: rowData.Notes || '',
      };

      return task;
    } catch (error) {
      throw new Error(`Row ${rowNumber}: ${error}`);
    }
  }
}

// Export singleton instance
export const exportImportService = new ExportImportService();
