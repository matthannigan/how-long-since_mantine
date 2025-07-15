'use client';

import React, { useCallback } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { ActionIcon, Tooltip, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import classes from './FloatingActionButton.module.css';

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export function FloatingActionButton({
  onClick,
  label = 'Add Task',
  disabled = false,
  'aria-label': ariaLabel,
}: FloatingActionButtonProps) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  // Haptic feedback helper
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  const handleClick = () => {
    if (!disabled) {
      triggerHapticFeedback('medium');
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
      event.preventDefault();
      onClick();
    }
  };

  const button = (
    <ActionIcon
      size={isMobile ? 56 : 48}
      radius="xl"
      variant="filled"
      color="primary"
      className={classes.fab}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={ariaLabel || label}
      data-testid="floating-action-button"
    >
      <IconPlus size={isMobile ? 24 : 20} stroke={2} />
    </ActionIcon>
  );

  // Only show tooltip on desktop
  if (!isMobile) {
    return (
      <Tooltip label={label} position="left" withArrow>
        {button}
      </Tooltip>
    );
  }

  return button;
}
