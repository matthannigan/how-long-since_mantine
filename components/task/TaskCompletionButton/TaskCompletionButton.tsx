'use client';

import React, { useState } from 'react';
import { IconCheck, IconRotateClockwise } from '@tabler/icons-react';
import { ActionIcon, Button, Group, Text, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { Task } from '@/types';

interface TaskCompletionButtonProps {
  /** The task to mark as complete */
  task: Task;
  /** Handler for task completion */
  onComplete: (taskId: string) => void | Promise<void>;
  /** Handler for undo completion */
  onUndoComplete?: (taskId: string) => void | Promise<void>;
  /** Button variant */
  variant?: 'icon' | 'button';
  /** Size of the button */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Loading state */
  loading?: boolean;
  /** Show undo option after completion */
  showUndo?: boolean;
  /** Undo timeout in milliseconds */
  undoTimeout?: number;
}

export function TaskCompletionButton({
  task,
  onComplete,
  onUndoComplete,
  variant = 'icon',
  size = 'md',
  loading = false,
  showUndo = true,
  undoTimeout = 5000,
}: TaskCompletionButtonProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [, setShowUndoNotification] = useState(false);
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null);

  const handleComplete = async () => {
    if (isCompleting || loading) {
      return;
    }

    setIsCompleting(true);

    try {
      await onComplete(task.id);

      if (showUndo && onUndoComplete) {
        setShowUndoNotification(true);

        // Show success notification with undo option
        const notificationId = notifications.show({
          title: 'Task Completed! 🎉',
          message: (
            <Group gap="sm" align="center">
              <Text size="sm">Great job completing "{task.name}"!</Text>
              <Button
                size="xs"
                variant="subtle"
                leftSection={<IconRotateClockwise size={14} />}
                onClick={handleUndo}
                data-testid="undo-button"
              >
                Undo
              </Button>
            </Group>
          ),
          color: 'green',
          autoClose: undoTimeout,
          onClose: () => setShowUndoNotification(false),
        });

        // Set timer to hide undo option
        const timer = setTimeout(() => {
          setShowUndoNotification(false);
          notifications.hide(notificationId);
        }, undoTimeout);

        setUndoTimer(timer);
      } else {
        // Simple success notification without undo
        notifications.show({
          title: 'Task Completed! 🎉',
          message: `Great job completing "${task.name}"!`,
          color: 'green',
          autoClose: 3000,
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to complete task. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
      // Error logged for debugging purposes
      // eslint-disable-next-line no-console
      console.error('Failed to complete task:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleUndo = async () => {
    if (!onUndoComplete) {
      return;
    }

    try {
      await onUndoComplete(task.id);

      // Clear the undo timer
      if (undoTimer) {
        clearTimeout(undoTimer);
        setUndoTimer(null);
      }

      setShowUndoNotification(false);

      notifications.show({
        title: 'Task Completion Undone',
        message: `"${task.name}" has been marked as not completed.`,
        color: 'blue',
        autoClose: 3000,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to undo task completion. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
      // Error logged for debugging purposes
      // eslint-disable-next-line no-console
      console.error('Failed to undo task completion:', error);
    }
  };

  const isCompleted = task.lastCompletedAt !== null;
  const buttonLabel = isCompleted ? 'Mark as not done' : 'Just Done';
  const tooltipLabel = isCompleted
    ? `Mark "${task.name}" as not completed`
    : `Mark "${task.name}" as completed`;

  if (variant === 'button') {
    return (
      <Button
        variant={isCompleted ? 'subtle' : 'filled'}
        color={isCompleted ? 'gray' : 'green'}
        size={size}
        loading={isCompleting || loading}
        onClick={handleComplete}
        leftSection={<IconCheck size={16} />}
        data-testid="task-completion-button"
        aria-label={tooltipLabel}
      >
        {buttonLabel}
      </Button>
    );
  }

  return (
    <Tooltip label={tooltipLabel} position="top">
      <ActionIcon
        variant={isCompleted ? 'subtle' : 'filled'}
        color={isCompleted ? 'gray' : 'green'}
        size={size}
        loading={isCompleting || loading}
        onClick={handleComplete}
        data-testid="task-completion-button"
        aria-label={tooltipLabel}
        style={{
          minWidth: size === 'xs' ? '24px' : size === 'sm' ? '32px' : '44px',
          minHeight: size === 'xs' ? '24px' : size === 'sm' ? '32px' : '44px',
        }}
      >
        <IconCheck size={size === 'xs' ? 14 : size === 'sm' ? 16 : 20} />
      </ActionIcon>
    </Tooltip>
  );
}
