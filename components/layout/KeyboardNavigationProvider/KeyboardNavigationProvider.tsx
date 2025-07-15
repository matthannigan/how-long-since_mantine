'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  APP_SHORTCUTS,
  useKeyboardShortcuts,
  type KeyboardShortcut,
} from '../../../hooks/useKeyboardShortcuts';
import { KeyboardShortcutsModal } from '../KeyboardShortcutsModal/KeyboardShortcutsModal';

interface KeyboardNavigationContextType {
  showShortcutsModal: () => void;
  hideShortcutsModal: () => void;
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (key: string) => void;
}

const KeyboardNavigationContext = createContext<KeyboardNavigationContextType | null>(null);

export function useKeyboardNavigation() {
  const context = useContext(KeyboardNavigationContext);
  if (!context) {
    throw new Error('useKeyboardNavigation must be used within KeyboardNavigationProvider');
  }
  return context;
}

interface KeyboardNavigationProviderProps {
  children: React.ReactNode;
  onAddTask?: () => void;
  onToggleView?: () => void;
  onSearch?: () => void;
}

export function KeyboardNavigationProvider({
  children,
  onAddTask,
  onToggleView,
  onSearch,
}: KeyboardNavigationProviderProps) {
  const [shortcutsModalOpened, setShortcutsModalOpened] = useState(false);
  const [customShortcuts, setCustomShortcuts] = useState<KeyboardShortcut[]>([]);

  const showShortcutsModal = useCallback(() => {
    setShortcutsModalOpened(true);
  }, []);

  const hideShortcutsModal = useCallback(() => {
    setShortcutsModalOpened(false);
  }, []);

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setCustomShortcuts((prev) => [...prev.filter((s) => s.key !== shortcut.key), shortcut]);
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    setCustomShortcuts((prev) => prev.filter((s) => s.key !== key));
  }, []);

  // Define core app shortcuts
  const coreShortcuts: KeyboardShortcut[] = [
    {
      ...APP_SHORTCUTS.ADD_TASK,
      action: () => onAddTask?.(),
    },
    {
      ...APP_SHORTCUTS.TOGGLE_VIEW,
      action: () => onToggleView?.(),
    },
    {
      ...APP_SHORTCUTS.SEARCH,
      action: () => onSearch?.(),
    },
    {
      ...APP_SHORTCUTS.HELP,
      action: showShortcutsModal,
    },
    {
      ...APP_SHORTCUTS.ESCAPE,
      action: () => {
        if (shortcutsModalOpened) {
          hideShortcutsModal();
        }
      },
    },
  ].filter((shortcut) => shortcut.action !== undefined);

  const allShortcuts = [...coreShortcuts, ...customShortcuts];

  const { shortcuts: formattedShortcuts } = useKeyboardShortcuts({
    shortcuts: allShortcuts,
    enabled: true,
  });

  const contextValue: KeyboardNavigationContextType = {
    showShortcutsModal,
    hideShortcutsModal,
    registerShortcut,
    unregisterShortcut,
  };

  return (
    <KeyboardNavigationContext.Provider value={contextValue}>
      {children}
      <KeyboardShortcutsModal
        opened={shortcutsModalOpened}
        onClose={hideShortcutsModal}
        shortcuts={formattedShortcuts}
      />
    </KeyboardNavigationContext.Provider>
  );
}
