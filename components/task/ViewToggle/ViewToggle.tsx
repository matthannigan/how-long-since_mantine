'use client';

import React from 'react';
import { IconCategory, IconClock } from '@tabler/icons-react';
import { ActionIcon, Box, Group, SegmentedControl, Text, Tooltip, Transition } from '@mantine/core';
import type { TaskListViewMode } from '../TaskList/TaskList';

interface ViewToggleProps {
  /** Current view mode */
  currentView: TaskListViewMode;
  /** Handler for view change */
  onViewChange: (view: TaskListViewMode) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Compact layout */
  compact?: boolean;
  /** Show labels alongside icons */
  showLabels?: boolean;
  /** Loading state during view transition */
  loading?: boolean;
}

export function ViewToggle({
  currentView,
  onViewChange,
  disabled = false,
  compact = false,
  showLabels = true,
  loading = false,
}: ViewToggleProps) {
  const viewOptions = [
    {
      value: 'category' as const,
      label: 'Categories',
      icon: IconCategory,
      description: 'Group tasks by category',
    },
    {
      value: 'time' as const,
      label: 'Time',
      icon: IconClock,
      description: 'Group tasks by time commitment',
    },
  ];

  if (compact) {
    return (
      <Group gap="xs" align="center">
        {viewOptions.map((option) => {
          const Icon = option.icon;
          const isActive = currentView === option.value;

          return (
            <Tooltip
              key={option.value}
              label={`Switch to ${option.label.toLowerCase()} view - ${option.description}`}
              position="bottom"
            >
              <ActionIcon
                variant={isActive ? 'filled' : 'light'}
                color={isActive ? 'blue' : 'gray'}
                size={compact ? 'sm' : 'md'}
                onClick={() => onViewChange(option.value)}
                disabled={disabled || loading}
                aria-label={`Switch to ${option.label.toLowerCase()} view`}
                aria-pressed={isActive}
                data-testid={`view-toggle-${option.value}`}
                style={{
                  transition: 'all 200ms ease',
                  transform: loading ? 'scale(0.95)' : 'scale(1)',
                }}
              >
                <Icon size={16} />
              </ActionIcon>
            </Tooltip>
          );
        })}

        {/* Loading indicator */}
        {loading && (
          <Box
            style={{
              opacity: 0.6,
              fontSize: '12px',
              color: 'var(--mantine-color-dimmed)',
            }}
          >
            Switching...
          </Box>
        )}
      </Group>
    );
  }

  return (
    <Box>
      <SegmentedControl
        value={currentView}
        onChange={(value) => onViewChange(value as TaskListViewMode)}
        disabled={disabled || loading}
        data={viewOptions.map((option) => {
          const Icon = option.icon;
          return {
            value: option.value,
            label: (
              <Group gap="xs" align="center" wrap="nowrap">
                <Icon size={16} />
                {showLabels && (
                  <Text size="sm" fw={500}>
                    {option.label}
                  </Text>
                )}
              </Group>
            ),
          };
        })}
        size={compact ? 'sm' : 'md'}
        radius="md"
        style={{
          transition: 'all 200ms ease',
          opacity: loading ? 0.7 : 1,
        }}
        aria-label="View mode selection"
        data-testid="view-toggle-segmented"
      />

      {/* Loading overlay */}
      <Transition mounted={loading} transition="fade" duration={200} timingFunction="ease">
        {(styles) => (
          <Box
            style={{
              ...styles,
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              fontSize: '12px',
              color: 'var(--mantine-color-blue-6)',
              fontWeight: 500,
            }}
          >
            Switching views...
          </Box>
        )}
      </Transition>
    </Box>
  );
}

interface ViewToggleWithStatsProps extends ViewToggleProps {
  /** Task counts by view */
  viewStats?: {
    category: {
      totalCategories: number;
      categoriesWithTasks: number;
    };
    time: {
      totalCommitments: number;
      commitmentsWithTasks: number;
    };
  };
}

export function ViewToggleWithStats({ viewStats, ...props }: ViewToggleWithStatsProps) {
  const { currentView } = props;

  return (
    <Group justify="space-between" align="center" wrap="nowrap">
      <ViewToggle {...props} />

      {/* View statistics */}
      {viewStats && (
        <Group gap="xs" align="center">
          <Text size="xs" c="dimmed">
            {currentView === 'category' ? (
              <>
                {viewStats.category.categoriesWithTasks} of {viewStats.category.totalCategories}{' '}
                categories have tasks
              </>
            ) : (
              <>
                {viewStats.time.commitmentsWithTasks} of {viewStats.time.totalCommitments} time
                slots have tasks
              </>
            )}
          </Text>
        </Group>
      )}
    </Group>
  );
}

// Hook for managing view state with persistence
export function useViewToggle(
  initialView: TaskListViewMode = 'category',
  storageKey = 'task-list-view'
) {
  const [currentView, setCurrentView] = React.useState<TaskListViewMode>(initialView);
  const [isLoading, setIsLoading] = React.useState(false);

  // Load saved view preference on mount
  React.useEffect(() => {
    try {
      const savedView = localStorage.getItem(storageKey);
      if (savedView && (savedView === 'category' || savedView === 'time')) {
        setCurrentView(savedView);
      }
    } catch (error) {
      // Silently handle localStorage errors
    }
  }, [storageKey]);

  // Handle view change with loading state and persistence
  const handleViewChange = React.useCallback(
    async (newView: TaskListViewMode) => {
      if (newView === currentView) {
        return;
      }

      setIsLoading(true);

      try {
        // Save to localStorage
        localStorage.setItem(storageKey, newView);

        // Add a small delay for smooth transition
        await new Promise((resolve) => setTimeout(resolve, 150));

        setCurrentView(newView);

        // Announce view change to screen readers
        const announcement = `Switched to ${newView} view`;
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.textContent = announcement;
        document.body.appendChild(announcer);

        setTimeout(() => {
          document.body.removeChild(announcer);
        }, 1000);
      } catch (error) {
        // Silently handle localStorage errors
        // Still update the view even if saving fails
        setCurrentView(newView);
      } finally {
        setIsLoading(false);
      }
    },
    [currentView, storageKey]
  );

  // Focus management for accessibility
  const handleViewChangeWithFocus = React.useCallback(
    (newView: TaskListViewMode, focusTarget?: string) => {
      handleViewChange(newView).then(() => {
        if (focusTarget) {
          const element = document.getElementById(focusTarget);
          if (element) {
            element.focus();
          }
        }
      });
    },
    [handleViewChange]
  );

  return {
    currentView,
    isLoading,
    handleViewChange,
    handleViewChangeWithFocus,
  };
}
