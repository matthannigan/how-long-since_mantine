import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import { KeyboardNavigationProvider, useKeyboardNavigation } from './KeyboardNavigationProvider';

// Test component that uses the keyboard navigation context
const TestComponent = () => {
  const { showShortcutsModal, registerShortcut, unregisterShortcut } = useKeyboardNavigation();

  const handleRegisterShortcut = () => {
    registerShortcut({
      key: 't',
      ctrlKey: true,
      action: () => {
        // Test shortcut action
      },
      description: 'Test shortcut',
    });
  };

  const handleUnregisterShortcut = () => {
    unregisterShortcut('t');
  };

  return (
    <div>
      <button type="button" onClick={showShortcutsModal}>
        Show Shortcuts
      </button>
      <button type="button" onClick={handleRegisterShortcut}>
        Register Shortcut
      </button>
      <button type="button" onClick={handleUnregisterShortcut}>
        Unregister Shortcut
      </button>
    </div>
  );
};

describe('KeyboardNavigationProvider', () => {
  const mockOnAddTask = jest.fn();
  const mockOnToggleView = jest.fn();
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <KeyboardNavigationProvider>
        <div>Test Content</div>
      </KeyboardNavigationProvider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('provides keyboard navigation context', () => {
    render(
      <KeyboardNavigationProvider>
        <TestComponent />
      </KeyboardNavigationProvider>
    );

    expect(screen.getByText('Show Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Register Shortcut')).toBeInTheDocument();
    expect(screen.getByText('Unregister Shortcut')).toBeInTheDocument();
  });

  it('triggers add task callback on Ctrl+N', () => {
    render(
      <KeyboardNavigationProvider onAddTask={mockOnAddTask}>
        <TestComponent />
      </KeyboardNavigationProvider>
    );

    fireEvent.keyDown(document, {
      key: 'n',
      ctrlKey: true,
      target: document.body,
    });

    expect(mockOnAddTask).toHaveBeenCalled();
  });

  it('triggers toggle view callback on Ctrl+V', () => {
    render(
      <KeyboardNavigationProvider onToggleView={mockOnToggleView}>
        <TestComponent />
      </KeyboardNavigationProvider>
    );

    fireEvent.keyDown(document, {
      key: 'v',
      ctrlKey: true,
      target: document.body,
    });

    expect(mockOnToggleView).toHaveBeenCalled();
  });

  it('triggers search callback on Ctrl+K', () => {
    render(
      <KeyboardNavigationProvider onSearch={mockOnSearch}>
        <TestComponent />
      </KeyboardNavigationProvider>
    );

    fireEvent.keyDown(document, {
      key: 'k',
      ctrlKey: true,
      target: document.body,
    });

    expect(mockOnSearch).toHaveBeenCalled();
  });

  it('allows registering custom shortcuts', () => {
    const mockAction = jest.fn();

    // Override the test component to use our mock action
    const TestComponentWithMock = () => {
      const { showShortcutsModal, registerShortcut, unregisterShortcut } = useKeyboardNavigation();

      const handleRegisterShortcut = () => {
        registerShortcut({
          key: 't',
          ctrlKey: true,
          action: mockAction,
          description: 'Test shortcut',
        });
      };

      const handleUnregisterShortcut = () => {
        unregisterShortcut('t');
      };

      return (
        <div>
          <button type="button" onClick={showShortcutsModal}>
            Show Shortcuts
          </button>
          <button type="button" onClick={handleRegisterShortcut}>
            Register Shortcut
          </button>
          <button type="button" onClick={handleUnregisterShortcut}>
            Unregister Shortcut
          </button>
        </div>
      );
    };

    render(
      <KeyboardNavigationProvider>
        <TestComponentWithMock />
      </KeyboardNavigationProvider>
    );

    // Register a custom shortcut
    const registerButton = screen.getByText('Register Shortcut');
    fireEvent.click(registerButton);

    // Trigger the custom shortcut
    fireEvent.keyDown(document, {
      key: 't',
      ctrlKey: true,
      target: document.body,
    });

    expect(mockAction).toHaveBeenCalled();
  });

  it('allows unregistering custom shortcuts', () => {
    const mockAction = jest.fn();

    // Override the test component to use our mock action
    const TestComponentWithMock = () => {
      const { showShortcutsModal, registerShortcut, unregisterShortcut } = useKeyboardNavigation();

      const handleRegisterShortcut = () => {
        registerShortcut({
          key: 't',
          ctrlKey: true,
          action: mockAction,
          description: 'Test shortcut',
        });
      };

      const handleUnregisterShortcut = () => {
        unregisterShortcut('t');
      };

      return (
        <div>
          <button type="button" onClick={showShortcutsModal}>
            Show Shortcuts
          </button>
          <button type="button" onClick={handleRegisterShortcut}>
            Register Shortcut
          </button>
          <button type="button" onClick={handleUnregisterShortcut}>
            Unregister Shortcut
          </button>
        </div>
      );
    };

    render(
      <KeyboardNavigationProvider>
        <TestComponentWithMock />
      </KeyboardNavigationProvider>
    );

    // Register a custom shortcut
    const registerButton = screen.getByText('Register Shortcut');
    fireEvent.click(registerButton);

    // Unregister the shortcut
    const unregisterButton = screen.getByText('Unregister Shortcut');
    fireEvent.click(unregisterButton);

    // Try to trigger the unregistered shortcut
    fireEvent.keyDown(document, {
      key: 't',
      ctrlKey: true,
      target: document.body,
    });

    expect(mockAction).not.toHaveBeenCalled();
  });

  it('throws error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useKeyboardNavigation must be used within KeyboardNavigationProvider');

    consoleSpy.mockRestore();
  });

  it('does not trigger shortcuts when callbacks are not provided', () => {
    render(
      <KeyboardNavigationProvider>
        <TestComponent />
      </KeyboardNavigationProvider>
    );

    // These should not throw errors even without callbacks
    fireEvent.keyDown(document, {
      key: 'n',
      ctrlKey: true,
      target: document.body,
    });

    fireEvent.keyDown(document, {
      key: 'v',
      ctrlKey: true,
      target: document.body,
    });

    fireEvent.keyDown(document, {
      key: 'k',
      ctrlKey: true,
      target: document.body,
    });

    // No assertions needed - just ensuring no errors are thrown
  });
});
