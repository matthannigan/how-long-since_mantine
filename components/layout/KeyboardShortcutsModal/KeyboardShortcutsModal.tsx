'use client';

import React from 'react';
import { IconKeyboard } from '@tabler/icons-react';
import { Divider, Group, Kbd, Modal, ScrollArea, Stack, Text, Title } from '@mantine/core';
import type { KeyboardShortcut } from '../../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  opened: boolean;
  onClose: () => void;
  shortcuts: (KeyboardShortcut & { displayKey: string })[];
}

export function KeyboardShortcutsModal({
  opened,
  onClose,
  shortcuts,
}: KeyboardShortcutsModalProps) {
  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      // Group shortcuts by category (could be enhanced later)
      const category = 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(shortcut);
      return acc;
    },
    {} as Record<string, typeof shortcuts>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconKeyboard size={20} />
          <Title order={3}>Keyboard Shortcuts</Title>
        </Group>
      }
      size="md"
      centered
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack gap="lg">
        <Text size="sm" c="dimmed">
          Use these keyboard shortcuts to navigate and interact with the app more efficiently.
        </Text>

        {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
          <div key={category}>
            <Title order={4} size="sm" mb="sm">
              {category}
            </Title>
            <Stack gap="xs">
              {categoryShortcuts.map((shortcut, index) => (
                <Group key={index} justify="space-between" align="center">
                  <Text size="sm">{shortcut.description}</Text>
                  <Kbd size="sm">{shortcut.displayKey}</Kbd>
                </Group>
              ))}
            </Stack>
            {category !==
              Object.keys(groupedShortcuts)[Object.keys(groupedShortcuts).length - 1] && (
              <Divider my="md" />
            )}
          </div>
        ))}

        <Text size="xs" c="dimmed" ta="center">
          Press <Kbd size="xs">Escape</Kbd> to close this dialog
        </Text>
      </Stack>
    </Modal>
  );
}
