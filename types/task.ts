// Task-related type definitions

export type TimeCommitment = '15min' | '30min' | '1hr' | '2hrs' | '4hrs' | '5hrs+';

export type FrequencyUnit = 'day' | 'week' | 'month' | 'year';

export interface ExpectedFrequency {
  value: number;
  unit: FrequencyUnit;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  createdAt: Date;
  lastCompletedAt: Date | null;
  expectedFrequency?: ExpectedFrequency;
  timeCommitment?: TimeCommitment;
  isArchived: boolean;
  notes: string;
}

export interface TaskFormData {
  name: string;
  description: string;
  categoryId: string;
  expectedFrequency?: ExpectedFrequency;
  timeCommitment?: TimeCommitment;
  notes: string;
}

export interface TaskStats {
  totalTasks: number;
  completedToday: number;
  overdueTasks: number;
  averageCompletionTime: number;
}
