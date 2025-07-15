import * as TablerIcons from '@tabler/icons-react';
import { Badge } from '@mantine/core';
import type { Category } from '@/types';

interface CategoryBadgeProps {
  category: Category;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'filled' | 'outline' | 'dot';
  showIcon?: boolean;
}

export function CategoryBadge({
  category,
  size = 'sm',
  variant = 'light',
  showIcon = true,
}: CategoryBadgeProps) {
  // Get the icon component dynamically
  const getIconComponent = (iconName?: string) => {
    if (!iconName) {
      return null;
    }

    const IconComponent = (TablerIcons as any)[
      `Icon${iconName
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')}`
    ];
    return IconComponent;
  };

  const IconComponent = showIcon ? getIconComponent(category.icon) : null;

  return (
    <Badge
      size={size}
      variant={variant}
      color={category.color}
      leftSection={
        IconComponent ? (
          <IconComponent size={size === 'xs' ? 10 : size === 'sm' ? 12 : 14} />
        ) : undefined
      }
      style={{
        backgroundColor: variant === 'light' ? `${category.color}15` : category.color,
        color: variant === 'light' ? category.color : 'white',
        borderColor: category.color,
      }}
    >
      {category.name}
    </Badge>
  );
}
