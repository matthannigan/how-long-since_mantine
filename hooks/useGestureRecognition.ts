'use client';

import { useCallback, useRef, useState } from 'react';

export interface GestureConfig {
  swipeThreshold?: number;
  velocityThreshold?: number;
  timeThreshold?: number;
  preventScroll?: boolean;
}

export interface GestureCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  onPinch?: (scale: number) => void;
}

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export function useGestureRecognition(
  config: GestureConfig = {},
  callbacks: GestureCallbacks = {}
) {
  const {
    swipeThreshold = 50,
    velocityThreshold = 0.3,
    timeThreshold = 300,
    preventScroll = false,
  } = config;

  const startPoint = useRef<TouchPoint | null>(null);
  const currentPoint = useRef<TouchPoint | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isGesturing, setIsGesturing] = useState(false);

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

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchStart = useCallback(
    (event: TouchEvent | React.TouchEvent) => {
      const touch = 'touches' in event ? event.touches[0] : event;
      if (!touch) return;

      const point: TouchPoint = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      };

      startPoint.current = point;
      currentPoint.current = point;
      setIsGesturing(true);

      // Start long press timer
      longPressTimer.current = setTimeout(() => {
        if (callbacks.onLongPress && startPoint.current) {
          triggerHapticFeedback('heavy');
          callbacks.onLongPress();
        }
      }, 500);

      if (preventScroll) {
        event.preventDefault();
      }
    },
    [callbacks.onLongPress, preventScroll, triggerHapticFeedback]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent | React.TouchEvent) => {
      const touch = 'touches' in event ? event.touches[0] : event;
      if (!touch || !startPoint.current) return;

      currentPoint.current = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      };

      // Clear long press timer on movement
      clearLongPressTimer();

      if (preventScroll) {
        event.preventDefault();
      }
    },
    [clearLongPressTimer, preventScroll]
  );

  const handleTouchEnd = useCallback(
    (event: TouchEvent | React.TouchEvent) => {
      if (!startPoint.current || !currentPoint.current) {
        setIsGesturing(false);
        return;
      }

      clearLongPressTimer();

      const deltaX = currentPoint.current.x - startPoint.current.x;
      const deltaY = currentPoint.current.y - startPoint.current.y;
      const deltaTime = currentPoint.current.timestamp - startPoint.current.timestamp;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / deltaTime;

      // Determine gesture type
      if (distance < 10 && deltaTime < 200) {
        // Tap gesture
        if (callbacks.onTap) {
          triggerHapticFeedback('light');
          callbacks.onTap();
        }
      } else if (distance > swipeThreshold || velocity > velocityThreshold) {
        // Swipe gesture
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX > absY) {
          // Horizontal swipe
          if (deltaX > 0 && callbacks.onSwipeRight) {
            triggerHapticFeedback('medium');
            callbacks.onSwipeRight();
          } else if (deltaX < 0 && callbacks.onSwipeLeft) {
            triggerHapticFeedback('medium');
            callbacks.onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && callbacks.onSwipeDown) {
            triggerHapticFeedback('medium');
            callbacks.onSwipeDown();
          } else if (deltaY < 0 && callbacks.onSwipeUp) {
            triggerHapticFeedback('medium');
            callbacks.onSwipeUp();
          }
        }
      }

      startPoint.current = null;
      currentPoint.current = null;
      setIsGesturing(false);

      if (preventScroll) {
        event.preventDefault();
      }
    },
    [
      callbacks.onTap,
      callbacks.onSwipeRight,
      callbacks.onSwipeLeft,
      callbacks.onSwipeDown,
      callbacks.onSwipeUp,
      clearLongPressTimer,
      swipeThreshold,
      velocityThreshold,
      preventScroll,
      triggerHapticFeedback,
    ]
  );

  // React event handlers
  const gestureHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  // Native event handlers (for use with useEffect)
  const nativeHandlers = {
    touchstart: handleTouchStart,
    touchmove: handleTouchMove,
    touchend: handleTouchEnd,
  };

  return {
    gestureHandlers,
    nativeHandlers,
    isGesturing,
  };
}
