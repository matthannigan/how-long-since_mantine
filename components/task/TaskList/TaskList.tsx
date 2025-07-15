'use client';

import React, { useMemo } from 'react';
import {
  IconAlertCircle,
  IconCategory,
  IconChevronDown,
  IconChevronRight,
  IconClock,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Center,
  Collapse,
  Divider,
  Group,
  Loader,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { getTimeCommitmentInfo, TIME_COMMITMENT_ORDER } from '@/lib/constants/timeCommitments';
import type { Category, Task, TimeCommitment } from '@/types';
import { TaskCard } from '../TaskCard/TaskCard';

export type TaskListViewMode = 'category' | 'time';

interface TaskListProps {
  /** Array of tasks to display */
  tasks: Task[];
  /** Array of categories for task organization */
  categories: Category[];
  /** Current view mode */
  viewMode: TaskListViewMode;
  /** Handler for task completion */
  onTaskComplete: (taskId: string) => void | Promise<void>;
  /** Handler for undo task completion */
  onTaskUndoComplete?: (taskId: string) => void | Promise<void>;
  /** Handler for task editing */
  onTaskEdit?: (taskId: string) => void;
  /** Handler for task archiving */
  onTaskArchive?: (taskId: string) => void;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string;
  /** Empty state content */
  emptyState?: React.ReactNode;
  /** Show category badges on task cards */
  showCategoryBadges?: boolean;
  /** Compact task card layout */
  compactCards?: boolean;
  /** Filter function for tasks */
  taskFilter?: (task: Task) => boolean;
  /** Sort function for tasks within groups */
  taskSort?: (a: Task, b: Task) => number;
}

interface TaskGroupProps {
  title: string;
  tasks: Task[];
  categories: Category[];
  color?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  onTaskComplete: (taskId: string) => void | Promise<void>;
  onTaskUndoComplete?: (taskId: string) => void | Promise<void>;
  onTaskEdit?: (taskId: string) => void;
  onTaskArchive?: (taskId: string) => void;
  showCategoryBadges?: boolean;
  compactCards?: boolean;
  emptyMessage?: string;
}

function TaskGroup({
  title,
  tasks,
  categories,
  color,
  icon,
  badge,
  defaultOpen = true,
  onTaskComplete,
  onTaskUndoComplete,
  onTaskEdit,
  onTaskArchive,
  showCategoryBadges = true,
  compactCards = false,
  emptyMessage = 'No tasks in this group',
}: TaskGroupProps) {
  const [opened, { toggle }] = useDisclosure(defaultOpen);

  // Create category lookup for performance
  const categoryMap = useMemo(() => {
    return categories.reduce(
      (map, category) => {
        map[category.id] = category;
        return map;
      },
      {} as Record<string, Category>
    );
  }, [categories]);

  const overdueTasks = tasks.filter((task) => {
    if (!task.expectedFrequency || !task.lastCompletedAt) {
      return false;
    }

    const { value, unit } = task.expectedFrequency;
    const lastCompleted = new Date(task.lastCompletedAt);
    const now = new Date();
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
  });

  return (
    <Box>
      {/* Group Header */}
      <Group
        justify="space-between"
        align="center"
        p="sm"
        style={{
          cursor: 'pointer',
          borderRadius: 'var(--mantine-radius-md)',
          backgroundColor: opened ? 'var(--mantine-color-gray-0)' : 'transparent',
          border: opened ? '1px solid var(--mantine-color-gray-3)' : '1px solid transparent',
        }}
        onClick={toggle}
        role="button"
        tabIndex={0}
        aria-expanded={opened}
        aria-controls={`task-group-${title.replace(/\s+/g, '-').toLowerCase()}`}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle();
          }
        }}
      >
        <Group gap="sm" align="center">
          <ActionIcon
            variant="subtle"
            size="sm"
            color="gray"
            aria-label={opened ? 'Collapse group' : 'Expand group'}
          >
            {opened ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
          </ActionIcon>

          {icon && <Box style={{ color: color || 'var(--mantine-color-gray-6)' }}>{icon}</Box>}

          <Text size="lg" fw={500} style={{ color }}>
            {title}
          </Text>

          {badge}
        </Group>

        <Group gap="xs" align="center">
          {overdueTasks.length > 0 && (
            <Badge
              variant="filled"
              color="red"
              size="sm"
              leftSection={<IconAlertCircle size={12} />}
            >
              {overdueTasks.length} overdue
            </Badge>
          )}

          <Badge variant="light" color="gray" size="sm">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </Badge>
        </Group>
      </Group>

      {/* Group Content */}
      <Collapse in={opened}>
        <Box id={`task-group-${title.replace(/\s+/g, '-').toLowerCase()}`} pt="sm" pb="md" px="sm">
          {tasks.length === 0 ? (
            <Center py="xl">
              <Text c="dimmed" size="sm" ta="center">
                {emptyMessage}
              </Text>
            </Center>
          ) : (
            <Stack gap="sm">
              {tasks.map((task) => {
                const category = categoryMap[task.categoryId];
                if (!category) {
                  // Skip tasks with missing categories - this should be handled by data validation
                  return null;
                }

                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    category={category}
                    onComplete={onTaskComplete}
                    onUndoComplete={onTaskUndoComplete}
                    onEdit={onTaskEdit}
                    onArchive={onTaskArchive}
                    showCategory={showCategoryBadges}
                    compact={compactCards}
                  />
                );
              })}
            </Stack>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

export function TaskList({
  tasks,
  categories,
  viewMode,
  onTaskComplete,
  onTaskUndoComplete,
  onTaskEdit,
  onTaskArchive,
  loading = false,
  error,
  emptyState,
  showCategoryBadges = true,
  compactCards = false,
  taskFilter,
  taskSort,
}: TaskListProps) {
  // Filter tasks if filter function provided
  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    if (taskFilter) {
      filtered = tasks.filter(taskFilter);
    }
    return filtered;
  }, [tasks, taskFilter]);

  // Group tasks based on view mode
  const groupedTasks = useMemo(() => {
    if (viewMode === 'category') {
      // Group by category
      const categoryMap = new Map<string, Task[]>();

      // Initialize all categories with empty arrays
      categories.forEach((category) => {
        categoryMap.set(category.id, []);
      });

      // Distribute tasks into categories
      filteredTasks.forEach((task) => {
        const categoryTasks = categoryMap.get(task.categoryId) || [];
        categoryTasks.push(task);
        categoryMap.set(task.categoryId, categoryTasks);
      });

      // Sort tasks within each category
      if (taskSort) {
        categoryMap.forEach((tasks, categoryId) => {
          categoryMap.set(categoryId, tasks.sort(taskSort));
        });
      }

      return Array.from(categoryMap.entries()).map(([categoryId, tasks]) => {
        const category = categories.find((c) => c.id === categoryId);
        return {
          id: categoryId,
          title: category?.name || 'Unknown Category',
          tasks,
          color: category?.color,
          icon: <IconCategory size={16} />,
        };
      });
    }
    // Group by time commitment
    const timeGroups = new Map<string, Task[]>();

    // Initialize all time commitment groups
    TIME_COMMITMENT_ORDER.forEach((commitment) => {
      timeGroups.set(commitment, []);
    });
    timeGroups.set('unknown', []);

    // Distribute tasks into time commitment groups
    filteredTasks.forEach((task) => {
      const commitment = task.timeCommitment || 'unknown';
      const groupTasks = timeGroups.get(commitment) || [];
      groupTasks.push(task);
      timeGroups.set(commitment, groupTasks);
    });

    // Sort tasks within each group
    if (taskSort) {
      timeGroups.forEach((tasks, commitment) => {
        timeGroups.set(commitment, tasks.sort(taskSort));
      });
    }

    return Array.from(timeGroups.entries()).map(([commitment, tasks]) => {
      if (commitment === 'unknown') {
        return {
          id: 'unknown',
          title: 'Time Unknown',
          tasks,
          color: 'var(--mantine-color-gray-6)',
          icon: <IconClock size={16} />,
        };
      }

      const info = getTimeCommitmentInfo(commitment as TimeCommitment);
      return {
        id: commitment,
        title: info.label,
        tasks,
        color: 'var(--mantine-color-blue-6)',
        icon: <IconClock size={16} />,
      };
    });
  }, [filteredTasks, categories, viewMode, taskSort]);

  // Loading state
  if (loading) {
    return (
      <Center py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Loading tasks...</Text>
        </Stack>
      </Center>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Error loading tasks"
        color="red"
        variant="light"
      >
        {error}
      </Alert>
    );
  }

  // Empty state
  if (filteredTasks.length === 0) {
    if (emptyState) {
      return <>{emptyState}</>;
    }

    return (
      <Center py="xl">
        <Stack align="center" gap="md" ta="center">
          <IconCategory size={48} style={{ opacity: 0.3 }} />
          <div>
            <Text size="lg" fw={500} c="dimmed">
              No tasks found
            </Text>
            <Text size="sm" c="dimmed" mt="xs">
              {viewMode === 'category'
                ? 'Create your first task to get started organizing by category'
                : 'Create tasks with time commitments to see them organized by duration'}
            </Text>
          </div>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="md" role="region" aria-label={`Tasks organized by ${viewMode}`}>
      {groupedTasks.map((group, index) => (
        <React.Fragment key={group.id}>
          <TaskGroup
            title={group.title}
            tasks={group.tasks}
            categories={categories}
            color={group.color}
            icon={group.icon}
            onTaskComplete={onTaskComplete}
            onTaskUndoComplete={onTaskUndoComplete}
            onTaskEdit={onTaskEdit}
            onTaskArchive={onTaskArchive}
            showCategoryBadges={viewMode === 'time' ? showCategoryBadges : false}
            compactCards={compactCards}
            emptyMessage={
              viewMode === 'category'
                ? `No tasks in ${group.title}`
                : `No tasks with ${group.title.toLowerCase()} time commitment`
            }
          />

          {/* Add divider between groups except for the last one */}
          {index < groupedTasks.length - 1 && <Divider variant="dashed" opacity={0.3} />}
        </React.Fragment>
      ))}
    </Stack>
  );
}
