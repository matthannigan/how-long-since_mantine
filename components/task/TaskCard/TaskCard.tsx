'use client';

import React from 'react';
import {
  IconAlertTriangle,
  IconArchive,
  IconCheck,
  IconClock,
  IconEdit,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { formatTimeElapsed, getOverdueStatus } from '@/lib/utils/dateUtils';
import type { Category, Task } from '@/types';
import { TaskCompletionButton } from '../TaskCompletionButton/TaskCompletionButton';
import { TimeCommitmentBadge } from '../TimeCommitmentBadge/TimeCommitmentBadge';

interface TaskCardProps {
  /** Task data */
  task: Task;
  /** Category data */
  category: Category;
  /** Handler for task completion */
  onComplete: (taskId: string) => void | Promise<void>;
  /** Handler for undo completion */
  onUndoComplete?: (taskId: string) => void | Promise<void>;
  /** Handler for task editing */
  onEdit?: (taskId: string) => void;
  /** Handler for task archiving */
  onArchive?: (taskId: string) => void;
  /** Show category badge */
  showCategory?: boolean;
  /** Compact layout */
  compact?: boolean;
  /** Loading state */
  loading?: boolean;
}

export function TaskCard({
  task,
  category,
  onComplete,
  onUndoComplete,
  onEdit,
  onArchive,
  showCategory = true,
  compact = false,
  loading = false,
}: TaskCardProps) {
  const overdueStatus = getOverdueStatus(task);
  const timeElapsed = formatTimeElapsed(task.lastCompletedAt);
  const isCompleted = task.lastCompletedAt !== null;

  const cardStyles = {
    borderLeft: `4px solid ${category.color}`,
    ...(overdueStatus.isOverdue && {
      borderColor: 'var(--mantine-color-red-6)',
      backgroundColor: 'var(--mantine-color-red-0)',
    }),
    ...(isCompleted && {
      backgroundColor: 'var(--mantine-color-green-0)',
    }),
  };

  return (
    <Card
      shadow="sm"
      padding={compact ? 'sm' : 'md'}
      radius="md"
      withBorder
      style={cardStyles}
      data-testid="task-card"
      role="article"
      aria-labelledby={`task-title-${task.id}`}
      aria-describedby={`task-status-${task.id}`}
    >
      <Stack gap={compact ? 'xs' : 'sm'}>
        {/* Header with title and completion button */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Box flex={1} style={{ minWidth: 0 }}>
            <Group gap="xs" align="center" wrap="nowrap">
              <Text
                id={`task-title-${task.id}`}
                size={compact ? 'sm' : 'md'}
                fw={500}
                lineClamp={2}
                style={{
                  flex: 1,
                  ...(isCompleted && { textDecoration: 'line-through', opacity: 0.7 }),
                }}
              >
                {task.name}
              </Text>

              {/* Overdue indicator with multiple accessibility signals */}
              {overdueStatus.isOverdue && (
                <Tooltip label="This task is overdue" position="top">
                  <ThemeIcon
                    size="sm"
                    color="red"
                    variant="light"
                    aria-label="Overdue task"
                    data-testid="overdue-indicator"
                  >
                    <IconAlertTriangle size={14} />
                  </ThemeIcon>
                </Tooltip>
              )}

              {/* Completed indicator */}
              {isCompleted && (
                <Tooltip label="Task completed" position="top">
                  <ThemeIcon
                    size="sm"
                    color="green"
                    variant="light"
                    aria-label="Completed task"
                    data-testid="completed-indicator"
                  >
                    <IconCheck size={14} />
                  </ThemeIcon>
                </Tooltip>
              )}
            </Group>

            {/* Description */}
            {task.description && !compact && (
              <Text size="sm" c="dimmed" lineClamp={2} mt="xs">
                {task.description}
              </Text>
            )}
          </Box>

          {/* Completion button */}
          <TaskCompletionButton
            task={task}
            onComplete={onComplete}
            onUndoComplete={onUndoComplete}
            size={compact ? 'sm' : 'md'}
            loading={loading}
          />
        </Group>

        {/* Status and metadata */}
        <Group justify="space-between" align="center" wrap="wrap">
          <Group gap="sm" align="center" wrap="wrap">
            {/* Category badge */}
            {showCategory && (
              <Badge variant="dot" color={category.color} size="sm" data-testid="category-badge">
                {category.name}
              </Badge>
            )}

            {/* Time elapsed */}
            <Group gap="xs" align="center">
              <IconClock size={14} style={{ opacity: 0.6 }} aria-hidden="true" />
              <Text
                id={`task-status-${task.id}`}
                size="sm"
                c={overdueStatus.isOverdue ? 'red' : 'dimmed'}
                fw={overdueStatus.isOverdue ? 500 : 400}
                data-testid="time-elapsed"
              >
                {timeElapsed}
                {overdueStatus.isOverdue && overdueStatus.overdueBy && (
                  <span> (overdue by {overdueStatus.overdueBy})</span>
                )}
              </Text>
            </Group>

            {/* Time commitment badge */}
            {task.timeCommitment && (
              <TimeCommitmentBadge
                commitment={task.timeCommitment}
                size="xs"
                showCircles={!compact}
              />
            )}
          </Group>

          {/* Action buttons */}
          {(onEdit || onArchive) && (
            <Group gap="xs">
              {onEdit && (
                <Tooltip label="Edit task" position="top">
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={() => onEdit(task.id)}
                    aria-label={`Edit "${task.name}"`}
                    data-testid="edit-button"
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                </Tooltip>
              )}

              {onArchive && (
                <Tooltip label="Archive task" position="top">
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={() => onArchive(task.id)}
                    aria-label={`Archive "${task.name}"`}
                    data-testid="archive-button"
                  >
                    <IconArchive size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          )}
        </Group>

        {/* Notes (if present and not compact) */}
        {task.notes && !compact && (
          <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
            {task.notes}
          </Text>
        )}

        {/* Screen reader only overdue announcement */}
        {overdueStatus.isOverdue && (
          <div className="sr-only" aria-live="polite">
            Task "{task.name}" is overdue by {overdueStatus.overdueBy}
          </div>
        )}
      </Stack>
    </Card>
  );
}
