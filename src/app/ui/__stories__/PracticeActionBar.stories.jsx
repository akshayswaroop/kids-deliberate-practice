import React from 'react';
import PracticeActionBar from '../PracticeActionBar.jsx';
import PracticeActionButton from '../PracticeActionButton.jsx';
// Removed CSS import - new components are self-contained

export default {
  title: 'Practice/PracticeActionBar',
  component: PracticeActionBar,
};

const Template = (args) => (
  <div
    style={{
      background: '#f8fafc',
      minHeight: 200,
      padding: 24,
      width: '100vw',
      maxWidth: '100%',
      boxSizing: 'border-box',
    }}
  >
    <PracticeActionBar {...args}>
      <PracticeActionButton variant="reveal">
        <span role="img" aria-label="coach">🙈</span> Hide coach hint
      </PracticeActionButton>
      <PracticeActionButton variant="primary">
        <span role="img" aria-label="got it">👍</span> Kid got it
      </PracticeActionButton>
      <PracticeActionButton variant="secondary">
        <span role="img" aria-label="try again">↺</span> Needs another try
      </PracticeActionButton>
    </PracticeActionBar>
  </div>
);

export const Default = Template.bind({});
Default.args = {};


export const SmallScreen = Template.bind({});
SmallScreen.args = {};
SmallScreen.parameters = {
  viewport: {
    defaultViewport: 'mobile1',
  },
};


export const LargeScreen = Template.bind({});
LargeScreen.args = {};
LargeScreen.parameters = {
  viewport: {
    defaultViewport: 'desktop',
  },
};

export const InApp = (args) => (
  <div style={{ minHeight: 360, background: '#f3f4f6' }}>
    <div className="practice-action-bar-wrapper">
      <PracticeActionBar {...args}>
        <PracticeActionButton variant="reveal">
          <span role="img" aria-label="coach">🙈</span> Hide coach hint
        </PracticeActionButton>
        <PracticeActionButton variant="primary">
          <span role="img" aria-label="got it">👍</span> Kid got it
        </PracticeActionButton>
        <PracticeActionButton variant="secondary">
          <span role="img" aria-label="try again">↺</span> Needs another try
        </PracticeActionButton>
      </PracticeActionBar>
    </div>
  </div>
);
InApp.parameters = { viewport: { defaultViewport: 'desktop' } };
