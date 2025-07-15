import { useState } from 'react';
import {
  ActionIcon,
  Group,
  TextInput,
  SimpleGrid,
  Text,
  ScrollArea,
  Tooltip,
  Button,
} from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import * as TablerIcons from '@tabler/icons-react';
import { CATEGORY_ICONS } from '@/lib/constants/categories';

interface CategoryIconSelectorProps {
  value?: string;
  onChange: (icon?: string) => void;
  disabled?: boolean;
}

export function CategoryIconSelector({
  value,
  onChange,
  disabled = false,
}: CategoryIconSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter icons based on search query
  const filteredIcons = CATEGORY_ICONS.filter((iconName) =>
    iconName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get the icon component dynamically
  const getIconComponent = (iconName: string) => {
    const IconComponent = (TablerIcons as any)[
      `Icon${iconName
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')}`
    ];
    return IconComponent;
  };

  const handleIconSelect = (iconName: string) => {
    onChange(value === iconName ? undefined : iconName);
  };

  const clearSelection = () => {
    onChange(undefined);
  };

  return (
    <div>
      <Group mb="sm">
        <TextInput
          placeholder="Search icons..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          disabled={disabled}
          style={{ flex: 1 }}
        />
        {value && (
          <Button
            variant="subtle"
            size="xs"
            onClick={clearSelection}
            disabled={disabled}
            leftSection={<IconX size={14} />}
          >
            Clear
          </Button>
        )}
      </Group>

      <ScrollArea h={200} type="auto">
        <SimpleGrid cols={8} spacing="xs">
          {filteredIcons.map((iconName) => {
            const IconComponent = getIconComponent(iconName);
            const isSelected = value === iconName;

            if (!IconComponent) {
              return null;
            }

            return (
              <Tooltip
                key={iconName}
                label={iconName.replace(/-/g, ' ')}
                position="top"
                withArrow
              >
                <ActionIcon
                  variant={isSelected ? 'filled' : 'subtle'}
                  size="lg"
                  radius="md"
                  disabled={disabled}
                  onClick={() => handleIconSelect(iconName)}
                  aria-label={`Select ${iconName} icon`}
                  aria-pressed={isSelected}
                  color={isSelected ? 'blue' : 'gray'}
                >
                  <IconComponent size={18} />
                </ActionIcon>
              </Tooltip>
            );
          })}
        </SimpleGrid>
      </ScrollArea>

      {filteredIcons.length === 0 && searchQuery && (
        <Text size="sm" c="dimmed" ta="center" mt="md">
          No icons found for "{searchQuery}"
        </Text>
      )}

      {value && (
        <Group mt="sm" gap="xs">
          <Text size="sm" c="dimmed">
            Selected:
          </Text>
          <Group gap="xs">
            {(() => {
              const IconComponent = getIconComponent(value);
              return IconComponent ? (
                <Group gap="xs">
                  <IconComponent size={16} />
                  <Text size="sm">{value.replace(/-/g, ' ')}</Text>
                </Group>
              ) : null;
            })()}
          </Group>
        </Group>
      )}
    </div>
  );
}