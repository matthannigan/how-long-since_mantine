'use client';

import React from 'react';
import { Badge, Group, Text, Tooltip } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { getTimeCommitmentInfo } from '@/lib/constants/timeCommitments';
import type { TimeCommitment } from '@/types';

interface TimeCommitmentBadgeProps {
  /** Time commitment value */
  commitment: TimeCommitment;
  /** Badge size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Badge variant */
  variant?: 'filled' | 'light' | 'outline' | 'dot';
  /** Show visual circles indicator */
  showCircles?: boolean;
  /** Show icon */
  showIcon?: boolean;
}

export function TimeCommitmentBadge({
  commitment,
  size = 'sm',
  variant = 'light',
  showCircles = true,
  showIcon = true,
}: TimeCommitmentBadgeProps) {
  const info = getTimeCommitmentInfo(commitment);
  
  const circles = Array.from({ length: 6 }, (_, index) => (
    <div
      key={index}
      style={{
        width: size === 'xs' ? '4px' : size === 'sm' ? '5px' : '6px',
        height: size === 'xs' ? '4px' : size === 'sm' ? '5px' : '6px',
        borderRadius: '50%',
        backgroundColor: index < info.circles 
          ? 'var(--mantine-color-blue-6)' 
          : 'var(--mantine-color-gray-3)',
        transition: 'background-color 0.2s ease',
      }}
      aria-hidden="true"
    />
  ));

  const badgeContent = (
    <Group gap={size === 'xs' ? 4 : 6} align="center">
      {showIcon && (
        <IconClock 
          size={size === 'xs' ? 10 : size === 'sm' ? 12 : 14} 
          aria-hidden="true"
        />
      )}
      <Text 
        size={size === 'xs' ? 'xs' : size === 'sm' ? 'xs' : 'sm'}
        fw={500}
      >
        {info.label}
      </Text>
      {showCircles && (
        <Group gap={size === 'xs' ? 1 : 2} align="center">
          {circles}
        </Group>
      )}
    </Group>
  );

  return (
    <Tooltip
      label={`Estimated time: ${info.label} (${info.minutes} minutes)`}
      position="top"
      withArrow
    >
      <Badge
        variant={variant}
        size={size}
        color="blue"
        style={{
          cursor: 'help',
          padding: size === 'xs' ? '4px 8px' : '6px 12px',
        }}
        data-testid="time-commitment-badge"
        aria-label={`Time commitment: ${info.label}`}
      >
        {badgeContent}
      </Badge>
    </Tooltip>
  );
}