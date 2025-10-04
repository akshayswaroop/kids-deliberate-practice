import React from 'react';
import type { Preview } from '@storybook/react-vite'
import { Provider } from 'react-redux';
import { createAppStore } from '../src/infrastructure/store';

// Create a non-persistent store for Storybook stories to avoid touching localStorage
const storybookStore = createAppStore({ persist: false });

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },

  // Wrap all stories in Provider so components using react-redux hooks work in Storybook
  decorators: [
    (Story) => React.createElement(Provider as any, { store: storybookStore }, React.createElement(Story as any)),
  ],
};

export default preview;