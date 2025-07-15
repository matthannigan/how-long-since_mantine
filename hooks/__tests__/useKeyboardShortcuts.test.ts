import { act, renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  let mockAddEventListener: jest.SpyInstance;
  let mockRemoveEventListener: jest.SpyInstance;

  beforeEach(() => {
    mockAddEventListener = jest.spyOn(document, 'addEventListener');
    mockRemoveEventListener = jest.spyOn(document, 'removeEventListener');
  });

  afterEach(() => {
    mockAddEventListener.mockRestore();
    mockRemoveEventListener.mockRestore();
  });

  it('should register keyboard event listeners', () => {
    const shortcuts = [
      {
        key: 'n',
        ctrlKey: true,
        action: jest.fn(),
        description: 'New task',
      },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should remove event listeners on unmount', () => {
    const shortcuts = [
      {
        key: 'n',
        ctrlKey: true,
        action: jest.fn(),
        description: 'New task',
      },
    ];

    const { unmount } = renderHook(() => useKeyboardShortcuts({ shortcuts }));

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should trigger action when matching shortcut is pressed', () => {
    const mockAction = jest.fn();
    const shortcuts = [
      {
        key: 'n',
        ctrlKey: true,
        action: mockAction,
        description: 'New task',
      },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    // Get the registered event handler
    const eventHandler = mockAddEventListener.mock.calls[0][1];

    // Simulate Ctrl+N keypress
    const mockEvent = {
      key: 'n',
      ctrlKey: true,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      target: document.body,
      preventDefault: jest.fn(),
    };

    act(() => {
      eventHandler(mockEvent);
    });

    expect(mockAction).toHaveBeenCalled();
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('should not trigger action when shortcut does not match', () => {
    const mockAction = jest.fn();
    const shortcuts = [
      {
        key: 'n',
        ctrlKey: true,
        action: mockAction,
        description: 'New task',
      },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    const eventHandler = mockAddEventListener.mock.calls[0][1];

    // Simulate just 'n' keypress (without Ctrl)
    const mockEvent = {
      key: 'n',
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      target: document.body,
      preventDefault: jest.fn(),
    };

    act(() => {
      eventHandler(mockEvent);
    });

    expect(mockAction).not.toHaveBeenCalled();
    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('should not trigger shortcuts when typing in input fields', () => {
    const mockAction = jest.fn();
    const shortcuts = [
      {
        key: 'n',
        ctrlKey: true,
        action: mockAction,
        description: 'New task',
      },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    const eventHandler = mockAddEventListener.mock.calls[0][1];

    // Simulate keypress in input field
    const mockEvent = {
      key: 'n',
      ctrlKey: true,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      target: { tagName: 'INPUT' },
      preventDefault: jest.fn(),
    };

    act(() => {
      eventHandler(mockEvent);
    });

    expect(mockAction).not.toHaveBeenCalled();
  });

  it('should not trigger shortcuts when typing in textarea', () => {
    const mockAction = jest.fn();
    const shortcuts = [
      {
        key: 'n',
        ctrlKey: true,
        action: mockAction,
        description: 'New task',
      },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    const eventHandler = mockAddEventListener.mock.calls[0][1];

    const mockEvent = {
      key: 'n',
      ctrlKey: true,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      target: { tagName: 'TEXTAREA' },
      preventDefault: jest.fn(),
    };

    act(() => {
      eventHandler(mockEvent);
    });

    expect(mockAction).not.toHaveBeenCalled();
  });

  it('should not trigger shortcuts when editing contentEditable', () => {
    const mockAction = jest.fn();
    const shortcuts = [
      {
        key: 'n',
        ctrlKey: true,
        action: mockAction,
        description: 'New task',
      },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    const eventHandler = mockAddEventListener.mock.calls[0][1];

    const mockEvent = {
      key: 'n',
      ctrlKey: true,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      target: { contentEditable: 'true' },
      preventDefault: jest.fn(),
    };

    act(() => {
      eventHandler(mockEvent);
    });

    expect(mockAction).not.toHaveBeenCalled();
  });

  it('should handle multiple modifier keys', () => {
    const mockAction = jest.fn();
    const shortcuts = [
      {
        key: 'k',
        ctrlKey: true,
        shiftKey: true,
        action: mockAction,
        description: 'Advanced search',
      },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    const eventHandler = mockAddEventListener.mock.calls[0][1];

    const mockEvent = {
      key: 'k',
      ctrlKey: true,
      altKey: false,
      shiftKey: true,
      metaKey: false,
      target: document.body,
      preventDefault: jest.fn(),
    };

    act(() => {
      eventHandler(mockEvent);
    });

    expect(mockAction).toHaveBeenCalled();
  });

  it('should respect preventDefault option', () => {
    const mockAction = jest.fn();
    const shortcuts = [
      {
        key: 'n',
        ctrlKey: true,
        action: mockAction,
        description: 'New task',
        preventDefault: false,
      },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    const eventHandler = mockAddEventListener.mock.calls[0][1];

    const mockEvent = {
      key: 'n',
      ctrlKey: true,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      target: document.body,
      preventDefault: jest.fn(),
    };

    act(() => {
      eventHandler(mockEvent);
    });

    expect(mockAction).toHaveBeenCalled();
    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('should not register listeners when disabled', () => {
    const shortcuts = [
      {
        key: 'n',
        ctrlKey: true,
        action: jest.fn(),
        description: 'New task',
      },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: false }));

    expect(mockAddEventListener).not.toHaveBeenCalled();
  });

  it('should format shortcut display correctly', () => {
    const shortcuts = [
      {
        key: 'n',
        ctrlKey: true,
        action: jest.fn(),
        description: 'New task',
      },
      {
        key: 'k',
        metaKey: true,
        shiftKey: true,
        action: jest.fn(),
        description: 'Search',
      },
    ];

    const { result } = renderHook(() => useKeyboardShortcuts({ shortcuts }));

    expect(result.current.shortcuts[0].displayKey).toBe('Ctrl + N');
    expect(result.current.shortcuts[1].displayKey).toBe('⌘ + Shift + K');
  });
});
