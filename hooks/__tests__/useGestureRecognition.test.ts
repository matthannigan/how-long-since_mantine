import { act, renderHook } from '@testing-library/react';
import { useGestureRecognition } from '../useGestureRecognition';

// Mock navigator.vibrate
const mockVibrate = jest.fn();
Object.defineProperty(navigator, 'vibrate', {
  value: mockVibrate,
  writable: true,
});

describe('useGestureRecognition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with default config', () => {
    const { result } = renderHook(() => useGestureRecognition());

    expect(result.current.isGesturing).toBe(false);
    expect(result.current.gestureHandlers).toBeDefined();
    expect(result.current.nativeHandlers).toBeDefined();
  });

  it('should detect tap gesture', () => {
    const onTap = jest.fn();
    const { result } = renderHook(() => useGestureRecognition({}, { onTap }));

    const mockTouchEvent = {
      touches: [
        {
          clientX: 100,
          clientY: 100,
        },
      ],
      preventDefault: jest.fn(),
    } as any;

    // Start touch
    act(() => {
      result.current.gestureHandlers.onTouchStart(mockTouchEvent);
    });

    expect(result.current.isGesturing).toBe(true);

    // End touch quickly at same position
    const endEvent = {
      touches: [],
      preventDefault: jest.fn(),
    } as any;

    act(() => {
      result.current.gestureHandlers.onTouchEnd(endEvent);
    });

    expect(onTap).toHaveBeenCalled();
    expect(mockVibrate).toHaveBeenCalledWith([10]); // Light haptic feedback
    expect(result.current.isGesturing).toBe(false);
  });

  it('should detect swipe right gesture', () => {
    const onSwipeRight = jest.fn();
    const { result } = renderHook(() =>
      useGestureRecognition({ swipeThreshold: 50 }, { onSwipeRight })
    );

    const startEvent = {
      touches: [
        {
          clientX: 100,
          clientY: 100,
        },
      ],
      preventDefault: jest.fn(),
    } as any;

    // Start touch
    act(() => {
      result.current.gestureHandlers.onTouchStart(startEvent);
    });

    // Move touch to the right
    const moveEvent = {
      touches: [
        {
          clientX: 200, // 100px to the right
          clientY: 100,
        },
      ],
      preventDefault: jest.fn(),
    } as any;

    act(() => {
      result.current.gestureHandlers.onTouchMove(moveEvent);
    });

    // End touch
    const endEvent = {
      touches: [],
      preventDefault: jest.fn(),
    } as any;

    act(() => {
      result.current.gestureHandlers.onTouchEnd(endEvent);
    });

    expect(onSwipeRight).toHaveBeenCalled();
    expect(mockVibrate).toHaveBeenCalledWith([20]); // Medium haptic feedback
  });

  it('should detect swipe left gesture', () => {
    const onSwipeLeft = jest.fn();
    const { result } = renderHook(() =>
      useGestureRecognition({ swipeThreshold: 50 }, { onSwipeLeft })
    );

    const startEvent = {
      touches: [
        {
          clientX: 200,
          clientY: 100,
        },
      ],
      preventDefault: jest.fn(),
    } as any;

    act(() => {
      result.current.gestureHandlers.onTouchStart(startEvent);
    });

    const moveEvent = {
      touches: [
        {
          clientX: 100, // 100px to the left
          clientY: 100,
        },
      ],
      preventDefault: jest.fn(),
    } as any;

    act(() => {
      result.current.gestureHandlers.onTouchMove(moveEvent);
    });

    const endEvent = {
      touches: [],
      preventDefault: jest.fn(),
    } as any;

    act(() => {
      result.current.gestureHandlers.onTouchEnd(endEvent);
    });

    expect(onSwipeLeft).toHaveBeenCalled();
    expect(mockVibrate).toHaveBeenCalledWith([20]);
  });

  it('should detect long press gesture', () => {
    const onLongPress = jest.fn();
    const { result } = renderHook(() => useGestureRecognition({}, { onLongPress }));

    const startEvent = {
      touches: [
        {
          clientX: 100,
          clientY: 100,
        },
      ],
      preventDefault: jest.fn(),
    } as any;

    act(() => {
      result.current.gestureHandlers.onTouchStart(startEvent);
    });

    // Fast-forward time to trigger long press
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(onLongPress).toHaveBeenCalled();
    expect(mockVibrate).toHaveBeenCalledWith([30]); // Heavy haptic feedback
  });

  it('should cancel long press on touch move', () => {
    const onLongPress = jest.fn();
    const { result } = renderHook(() => useGestureRecognition({}, { onLongPress }));

    const startEvent = {
      touches: [
        {
          clientX: 100,
          clientY: 100,
        },
      ],
      preventDefault: jest.fn(),
    } as any;

    act(() => {
      result.current.gestureHandlers.onTouchStart(startEvent);
    });

    // Move before long press timer
    const moveEvent = {
      touches: [
        {
          clientX: 110,
          clientY: 100,
        },
      ],
      preventDefault: jest.fn(),
    } as any;

    act(() => {
      result.current.gestureHandlers.onTouchMove(moveEvent);
    });

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('should prevent scroll when configured', () => {
    const { result } = renderHook(() => useGestureRecognition({ preventScroll: true }, {}));

    const mockEvent = {
      touches: [
        {
          clientX: 100,
          clientY: 100,
        },
      ],
      preventDefault: jest.fn(),
    } as any;

    act(() => {
      result.current.gestureHandlers.onTouchStart(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('should not prevent scroll when not configured', () => {
    const { result } = renderHook(() => useGestureRecognition({ preventScroll: false }, {}));

    const mockEvent = {
      touches: [
        {
          clientX: 100,
          clientY: 100,
        },
      ],
      preventDefault: jest.fn(),
    } as any;

    act(() => {
      result.current.gestureHandlers.onTouchStart(mockEvent);
    });

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('should handle missing touch data gracefully', () => {
    const onTap = jest.fn();
    const { result } = renderHook(() => useGestureRecognition({}, { onTap }));

    const mockEvent = {
      touches: [],
      preventDefault: jest.fn(),
    } as any;

    act(() => {
      result.current.gestureHandlers.onTouchStart(mockEvent);
    });

    expect(result.current.isGesturing).toBe(false);
    expect(onTap).not.toHaveBeenCalled();
  });
});
