'use client';

import React, { useCallback, useRef, useState } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { ActionIcon, Box, Group, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import classes from './SwipeableTaskCard.module.css';

interface SwipeableTaskCardProps {
  children: React.ReactNode;
  onSwipeComplete?: () => void;
  onSwipeCancel?: () => void;
  disabled?: boolean;
  swipeThreshold?: number;
  className?: string;
}

export function SwipeableTaskCard({
  children,
  onSwipeComplete,
  onSwipeCancel,
  disabled = false,
  swipeThreshold = 100,
  className,
}: SwipeableTaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const isMobile = useMediaQuery('(max-width: 768px)');
  const supportsTouch = typeof window !== 'undefined' && 'ontouchstart' in window;

  // Haptic feedback helper
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  const handleStart = useCallback(
    (clientX: number) => {
      if (disabled || !isMobile || !supportsTouch) {
        return;
      }

      setIsDragging(true);
      startX.current = clientX;
      currentX.current = clientX;

      // Light haptic feedback on start
      triggerHapticFeedback('light');
    },
    [disabled, isMobile, supportsTouch, triggerHapticFeedback]
  );

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging || disabled) {
        return;
      }

      currentX.current = clientX;
      const offset = currentX.current - startX.current;

      // Only allow right swipe (positive offset)
      if (offset > 0) {
        const newOffset = Math.min(offset, swipeThreshold * 1.5);

        // Trigger haptic feedback when reaching threshold
        if (offset >= swipeThreshold && dragOffset < swipeThreshold) {
          triggerHapticFeedback('medium');
        }

        setDragOffset(newOffset);
      }
    },
    [isDragging, disabled, swipeThreshold, dragOffset, triggerHapticFeedback]
  );

  const handleEnd = useCallback(() => {
    if (!isDragging || disabled) {
      return;
    }

    const offset = currentX.current - startX.current;

    if (offset > swipeThreshold) {
      // Complete the swipe
      setIsCompleted(true);
      setDragOffset(swipeThreshold * 1.5);

      // Strong haptic feedback for completion
      triggerHapticFeedback('heavy');

      // Trigger completion after animation
      setTimeout(() => {
        onSwipeComplete?.();
        setIsCompleted(false);
        setDragOffset(0);
      }, 300);
    } else {
      // Cancel the swipe
      setDragOffset(0);
      onSwipeCancel?.();

      // Light haptic feedback for cancel
      if (offset > 20) {
        triggerHapticFeedback('light');
      }
    }

    setIsDragging(false);
  }, [isDragging, disabled, swipeThreshold, onSwipeComplete, onSwipeCancel, triggerHapticFeedback]);

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse event handlers (for testing)
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleCompleteClick = () => {
    if (!disabled) {
      onSwipeComplete?.();
    }
  };

  const swipeProgress = Math.min(dragOffset / swipeThreshold, 1);
  const showActions = dragOffset > 20;

  return (
    <Box
      ref={cardRef}
      className={`${classes.swipeableCard} ${className || ''}`}
      data-swiping={isDragging || undefined}
      data-completed={isCompleted || undefined}
      style={{
        transform: `translateX(${dragOffset}px)`,
        transition: isDragging ? 'none' : 'transform 300ms ease',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={isDragging ? handleMouseMove : undefined}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background actions */}
      {isMobile && supportsTouch && (
        <Box
          className={classes.swipeActions}
          style={{
            opacity: showActions ? swipeProgress : 0,
            transform: `translateX(-${Math.max(0, swipeThreshold - dragOffset)}px)`,
          }}
        >
          <Group gap="md" h="100%" align="center" pl="md">
            <ActionIcon
              size="lg"
              variant="filled"
              color="green"
              radius="xl"
              style={{
                transform: `scale(${0.8 + swipeProgress * 0.2})`,
              }}
            >
              <IconCheck size={20} />
            </ActionIcon>
            <Text size="sm" fw={500} c="green.7">
              Mark Complete
            </Text>
          </Group>
        </Box>
      )}

      {/* Main content */}
      <Box className={classes.cardContent}>
        {children}

        {/* Fallback button for accessibility */}
        {isMobile && (
          <ActionIcon
            size="lg"
            variant="light"
            color="green"
            onClick={handleCompleteClick}
            disabled={disabled}
            className={classes.fallbackButton}
            aria-label="Mark task as complete"
          >
            <IconCheck size={18} />
          </ActionIcon>
        )}
      </Box>

      {/* Swipe hint for first-time users */}
      {isMobile && supportsTouch && !isDragging && dragOffset === 0 && (
        <Box className={classes.swipeHint}>
          <Text size="xs" c="dimmed">
            Swipe right to complete →
          </Text>
        </Box>
      )}
    </Box>
  );
}
