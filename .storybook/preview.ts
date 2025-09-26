import React from 'react';
import type { Preview } from '@storybook/react-vite';
import { Provider } from 'react-redux';
import { store } from '../src/app/store';

// Use React.createElement to avoid needing a .tsx file
const withProvider = (Story: any) => React.createElement(Provider, { store, children: React.createElement(Story) });

const preview: Preview = {
	decorators: [withProvider as any],
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
			test: 'todo',
		},
	},
};

export default preview;
