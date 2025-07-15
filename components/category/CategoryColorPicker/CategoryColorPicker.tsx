import { ActionIcon, ColorSwatch, Group, Tooltip } from '@mantine/core';
import { AVAILABLE_COLORS } from '@/lib/constants/categories';

interface CategoryColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export function CategoryColorPicker({
  value,
  onChange,
  disabled = false,
}: CategoryColorPickerProps) {
  return (
    <Group gap="xs">
      {AVAILABLE_COLORS.map((color) => (
        <Tooltip key={color} label={`Select ${color}`} position="top" withArrow>
          <ActionIcon
            variant={value === color ? 'filled' : 'subtle'}
            size="lg"
            radius="md"
            disabled={disabled}
            onClick={() => onChange(color)}
            style={{
              backgroundColor: value === color ? color : 'transparent',
              border: `2px solid ${color}`,
              color: value === color ? 'white' : color,
            }}
            aria-label={`Select color ${color}`}
            aria-pressed={value === color}
          >
            <ColorSwatch
              color={color}
              size={16}
              style={{
                border: value === color ? '2px solid white' : 'none',
              }}
            />
          </ActionIcon>
        </Tooltip>
      ))}
    </Group>
  );
}
