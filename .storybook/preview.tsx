import '@mantine/core/styles.css';

import React from 'react';
import { MantineProvider } from '@mantine/core';
import { theme } from '../theme';

export const parameters = {
  layout: 'fullscreen',
  options: {
    showPanel: false,
    storySort: (a, b) => {
      return a.title.localeCompare(b.title, undefined, { numeric: true });
    },
  },
  backgrounds: {
    disable: true,
  },
  globals: {
    colorScheme: 'light',
  },
  globalTypes: {
    colorScheme: {
      description: 'Color scheme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Color Scheme',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export const decorators = [
  (renderStory: any, context: any) => {
    const colorScheme = context.globals.colorScheme || 'light';
    
    return (
      <MantineProvider theme={theme} forceColorScheme={colorScheme}>
        {renderStory()}
      </MantineProvider>
    );
  },
];
