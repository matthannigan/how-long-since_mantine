'use client';

import { createTheme, MantineColorsTuple } from '@mantine/core';

// Custom color palettes based on branding guidelines
const primary: MantineColorsTuple = [
  '#eff6ff', // 50
  '#dbeafe', // 100
  '#bfdbfe', // 200
  '#93c5fd', // 300
  '#60a5fa', // 400
  '#3b82f6', // 500 - Primary Blue
  '#2563eb', // 600 - Primary Blue (main)
  '#1d4ed8', // 700
  '#1e40af', // 800
  '#1e3a8a', // 900
];

const success: MantineColorsTuple = [
  '#f0fdf4', // 50
  '#dcfce7', // 100
  '#bbf7d0', // 200
  '#86efac', // 300
  '#4ade80', // 400
  '#22c55e', // 500
  '#10b981', // 600 - Success Green
  '#15803d', // 700
  '#166534', // 800
  '#14532d', // 900
];

const warning: MantineColorsTuple = [
  '#fffbeb', // 50
  '#fef3c7', // 100
  '#fde68a', // 200
  '#fcd34d', // 300
  '#fbbf24', // 400
  '#f59e0b', // 500 - Warning Amber
  '#d97706', // 600
  '#b45309', // 700
  '#92400e', // 800
  '#78350f', // 900
];

const danger: MantineColorsTuple = [
  '#fef2f2', // 50
  '#fecaca', // 100
  '#fca5a5', // 200
  '#f87171', // 300
  '#ef4444', // 400
  '#dc2626', // 500 - Overdue Red
  '#b91c1c', // 600
  '#991b1b', // 700
  '#7f1d1d', // 800
  '#6b1d1d', // 900
];

const gray: MantineColorsTuple = [
  '#f9fafb', // 50
  '#f3f4f6', // 100
  '#e5e7eb', // 200
  '#d1d5db', // 300
  '#9ca3af', // 400
  '#6b7280', // 500 - Neutral Gray
  '#4b5563', // 600
  '#374151', // 700
  '#1f2937', // 800 - Dark Gray
  '#111827', // 900
];

export const theme = createTheme({
  // Color scheme
  colors: {
    primary,
    success,
    warning,
    danger,
    gray,
  },

  // Set primary color
  primaryColor: 'primary',

  // Typography
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
  fontFamilyMonospace:
    'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',

  headings: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    sizes: {
      h1: { fontSize: '24px', lineHeight: '1.2', fontWeight: '700' }, // Display
      h2: { fontSize: '20px', lineHeight: '1.3', fontWeight: '600' }, // Heading 1
      h3: { fontSize: '18px', lineHeight: '1.4', fontWeight: '600' }, // Heading 2
      h4: { fontSize: '16px', lineHeight: '1.5', fontWeight: '500' }, // Body Large
      h5: { fontSize: '14px', lineHeight: '1.5', fontWeight: '500' }, // Body
      h6: { fontSize: '12px', lineHeight: '1.5', fontWeight: '500' }, // Small
    },
  },

  // Font sizes
  fontSizes: {
    xs: '12px', // Small
    sm: '14px', // Body (Default)
    md: '16px', // Body Large
    lg: '18px', // Heading 2
    xl: '20px', // Heading 1
  },

  // Spacing scale (4px base unit)
  spacing: {
    xs: '4px', // 1 unit
    sm: '8px', // 2 units
    md: '16px', // 4 units
    lg: '24px', // 6 units
    xl: '32px', // 8 units
  },

  // Border radius
  radius: {
    xs: '2px',
    sm: '4px',
    md: '8px', // Standard border radius
    lg: '12px',
    xl: '16px',
  },

  // Shadows
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)', // Task card shadow
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  },

  // Component-specific overrides
  components: {
    Button: {
      styles: {
        root: {
          height: '48px', // Mobile-friendly tap target
          fontSize: '14px',
          fontWeight: 500,
        },
      },
    },

    TextInput: {
      styles: {
        input: {
          height: '48px',
          fontSize: '16px', // Prevents zoom on iOS
          padding: '12px 16px',
        },
      },
    },

    Textarea: {
      styles: {
        input: {
          fontSize: '16px',
          padding: '12px 16px',
        },
      },
    },

    Select: {
      styles: {
        input: {
          height: '48px',
          fontSize: '16px',
          padding: '12px 16px',
        },
      },
    },

    Checkbox: {
      styles: {
        input: {
          width: '24px',
          height: '24px',
        },
      },
    },

    Card: {
      styles: {
        root: {
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        },
      },
    },

    ActionIcon: {
      styles: {
        root: {
          minWidth: '44px',
          minHeight: '44px',
        },
      },
    },
  },

  // Breakpoints for responsive design
  breakpoints: {
    xs: '30em', // 480px
    sm: '40em', // 640px - Mobile/Tablet breakpoint
    md: '64em', // 1024px - Tablet/Desktop breakpoint
    lg: '80em', // 1280px
    xl: '90em', // 1440px
  },

  // Other theme properties
  defaultRadius: 'md',
  focusRing: 'auto',
  cursorType: 'pointer',
});
