'use client';

import React from 'react';
import {
  Group,
  Button,
  Badge,
  Stack,
  Text,
  Box,
  Tooltip,
  ActionIcon,
} from '@mantine/core';
import { IconClock, IconX } from '@tabler/icons-react';
import { TIME_COMMITMENT_ORDER, getTimeCommitmentInfo } from '@/lib/constants/timeCommitments';
import type { TimeCommitment } from '@/types';

interface TimeCommitmentFilterProps {
  /** Currently selected time commitments */
  selectedCommitments: TimeCommitment[];
  /** Handler for time commitment selection */
  onCommitmentToggle: (commitment: TimeCommitment) => void;
  /** Handler for clearing all selections */
  onClearAll: () => void;
  /** Show task counts for each commitment */
  showCounts?: boolean;
  /** Task counts by commitment */
  commitmentCounts?: Record<TimeCommitment | 'unknown', number>;
  /** Compact layout */
  compact?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

export function TimeCommitmentFilter({
  selectedCommitments,
  onCommitmentToggle,
  onClearAll,
  showCounts = false,
  commitmentCounts,
  compact = false,
  disabled = false,
}: TimeCommitmentFilterProps) {
  const hasSelections = selectedCommitments.length > 0;

  return (
    <Stack gap={compact ? 'xs' : 'sm'}>
      {/* Header */}
      <Group justify="space-between" align="center">
        <Group gap="xs" align="center">
          <IconClock size={16} style={{ opacity: 0.7 }} />
          <Text size={compact ? 'sm' : 'md'} fw={500}>
            Filter by Time
          </Text>
        </Group>

        {hasSelections && (
          <Tooltip label="Clear all filters">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={onClearAll}
              disabled={disabled}
              aria-label="Clear all time commitment filters"
            >
              <IconX size={14} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>

      {/* Quick Selection Buttons */}
      <Group gap={compact ? 'xs' : 'sm'} wrap="wrap">
        {TIME_COMMITMENT_ORDER.map((commitment) => {
          const info = getTimeCommitmentInfo(commitment);
          const isSelected = selectedCommitments.includes(commitment);
          const count = commitmentCounts?.[commitment] || 0;

          return (
            <Button
              key={commitment}
              variant={isSelected ? 'filled' : 'light'}
              color={isSelected ? 'blue' : 'gray'}
              size={compact ? 'xs' : 'sm'}
              onClick={() => onCommitmentToggle(commitment)}
              disabled={disabled}
              leftSection={<IconClock size={12} />}
              rightSection={
                showCounts && count > 0 ? (
                  <Badge
                    variant="light"
                    color={isSelected ? 'white' : 'blue'}
                    size="xs"
                    style={{
                      color: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
                    }}
                  >
                    {count}
                  </Badge>
                ) : undefined
              }
              aria-pressed={isSelected}
              aria-label={`${isSelected ? 'Remove' : 'Add'} ${info.label} filter${
                showCounts && count > 0 ? ` (${count} tasks)` : ''
              }`}
              data-testid={`time-filter-${commitment}`}
            >
              {info.label}
            </Button>
          );
        })}

        {/* Unknown time commitment filter */}
        {commitmentCounts?.unknown && commitmentCounts.unknown > 0 && (
          <Button
            variant="light"
            color="gray"
            size={compact ? 'xs' : 'sm'}
            onClick={() => {
              // Handle unknown time commitment filtering
              // This would need to be implemented in the parent component
            }}
            disabled={disabled}
            leftSection={<IconClock size={12} />}
            rightSection={
              showCounts ? (
                <Badge variant="light" color="gray" size="xs">
                  {commitmentCounts.unknown}
                </Badge>
              ) : undefined
            }
            aria-label={`Filter tasks with unknown time commitment${
              showCounts ? ` (${commitmentCounts.unknown} tasks)` : ''
            }`}
            data-testid="time-filter-unknown"
          >
            Time Unknown
          </Button>
        )}
      </Group>

      {/* Active Filters Display */}
      {hasSelections && (
        <Box>
          <Text size="xs" c="dimmed" mb="xs">
            Active filters:
          </Text>
          <Group gap="xs">
            {selectedCommitments.map((commitment) => {
              const info = getTimeCommitmentInfo(commitment);
              const count = commitmentCounts?.[commitment] || 0;

              return (
                <Badge
                  key={commitment}
                  variant="light"
                  color="blue"
                  size="sm"
                  rightSection={
                    <ActionIcon
                      size="xs"
                      color="blue"
                      variant="transparent"
                      onClick={() => onCommitmentToggle(commitment)}
                      aria-label={`Remove ${info.label} filter`}
                    >
                      <IconX size={10} />
                    </ActionIcon>
                  }
                  style={{ paddingRight: 3 }}
                >
                  {info.label}
                  {showCounts && count > 0 && ` (${count})`}
                </Badge>
              );
            })}
          </Group>
        </Box>
      )}

      {/* Screen reader announcement for filter changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {hasSelections
          ? `Filtering by ${selectedCommitments.length} time commitment${
              selectedCommitments.length === 1 ? '' : 's'
            }: ${selectedCommitments
              .map((c) => getTimeCommitmentInfo(c).label)
              .join(', ')}`
          : 'No time commitment filters active'}
      </div>
    </Stack>
  );
}

// Quick selection presets
export const TIME_COMMITMENT_PRESETS = {
  quick: ['15min', '30min'] as TimeCommitment[],
  medium: ['1hr', '2hrs'] as TimeCommitment[],
  long: ['4hrs', '5hrs+'] as TimeCommitment[],
  short: ['15min'] as TimeCommitment[],
  extended: ['4hrs', '5hrs+'] as TimeCommitment[],
} as const;

interface TimeCommitmentPresetsProps {
  /** Handler for preset selection */
  onPresetSelect: (commitments: TimeCommitment[]) => void;
  /** Currently selected commitments */
  selectedCommitments: TimeCommitment[];
  /** Disabled state */
  disabled?: boolean;
  /** Compact layout */
  compact?: boolean;
}

export function TimeCommitmentPresets({
  onPresetSelect,
  selectedCommitments,
  disabled = false,
  compact = false,
}: TimeCommitmentPresetsProps) {
  const isPresetActive = (preset: TimeCommitment[]) => {
    return (
      preset.length === selectedCommitments.length &&
      preset.every((commitment) => selectedCommitments.includes(commitment))
    );
  };

  return (
    <Stack gap={compact ? 'xs' : 'sm'}>
      <Text size={compact ? 'sm' : 'md'} fw={500}>
        Quick Select
      </Text>

      <Group gap={compact ? 'xs' : 'sm'} wrap="wrap">
        <Button
          variant={isPresetActive(TIME_COMMITMENT_PRESETS.quick) ? 'filled' : 'light'}
          color="green"
          size={compact ? 'xs' : 'sm'}
          onClick={() => onPresetSelect(TIME_COMMITMENT_PRESETS.quick)}
          disabled={disabled}
          aria-pressed={isPresetActive(TIME_COMMITMENT_PRESETS.quick)}
          data-testid="preset-quick"
        >
          Quick Tasks (≤30min)
        </Button>

        <Button
          variant={isPresetActive(TIME_COMMITMENT_PRESETS.medium) ? 'filled' : 'light'}
          color="yellow"
          size={compact ? 'xs' : 'sm'}
          onClick={() => onPresetSelect(TIME_COMMITMENT_PRESETS.medium)}
          disabled={disabled}
          aria-pressed={isPresetActive(TIME_COMMITMENT_PRESETS.medium)}
          data-testid="preset-medium"
        >
          Medium Tasks (1-2hrs)
        </Button>

        <Button
          variant={isPresetActive(TIME_COMMITMENT_PRESETS.long) ? 'filled' : 'light'}
          color="orange"
          size={compact ? 'xs' : 'sm'}
          onClick={() => onPresetSelect(TIME_COMMITMENT_PRESETS.long)}
          disabled={disabled}
          aria-pressed={isPresetActive(TIME_COMMITMENT_PRESETS.long)}
          data-testid="preset-long"
        >
          Long Tasks (4hrs+)
        </Button>
      </Group>
    </Stack>
  );
}