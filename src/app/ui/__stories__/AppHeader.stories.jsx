import React from 'react';
import AppHeader from '../AppHeader.jsx';
import '../../../index.css'; // Import CSS variables for --gradient-rainbow, --text-inverse etc

const meta = {
  title: 'Practice/AppHeader',
  component: AppHeader,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

const Template = (args) => (
  // Match the app background exactly - no card wrapper, just page background
  <div style={{ minHeight: '220px', background: 'var(--bg-primary)' }}>
    <AppHeader {...args} />
    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
      App content would go here...
    </div>
  </div>
);

// Mock mode options
const mockModeOptions = [
  { value: 'hanuman-chalisa', label: 'Hanuman Chalisa', description: 'Learn Hindi verses' },
  { value: 'math-tables', label: 'Math Tables', description: 'Multiplication practice' },
  { value: 'english-questions', label: 'English Questions', description: 'Language practice' },
  { value: 'geography', label: 'Geography', description: 'World knowledge' },
];

export const Default = Template.bind({});
Default.args = {
  mode: 'hanuman-chalisa',
  modeOptions: mockModeOptions,
  currentUserId: 'test-user-1',
  showRevisionButton: false,
  onSetMode: (mode) => console.log('Set mode:', mode),
  onOpenSubjectPicker: () => console.log('Open subject picker'),
  onOpenSettings: () => console.log('Open settings'),
};

export const WithRevision = Template.bind({});
WithRevision.args = {
  ...Default.args,
  showRevisionButton: true,
  revisionButtonLabel: 'Review Words',
  onOpenRevision: () => console.log('Open revision'),
};

export const LongSubjectName = Template.bind({});
LongSubjectName.args = {
  ...Default.args,
  mode: 'very-long-subject-name-that-might-wrap',
  modeOptions: [
    ...mockModeOptions,
    { 
      value: 'very-long-subject-name-that-might-wrap', 
      label: 'Very Long Subject Name That Might Wrap', 
      description: 'Test long names' 
    },
  ],
};

export const MobileView = Template.bind({});
MobileView.args = {
  ...WithRevision.args,
};
MobileView.parameters = {
  viewport: {
    defaultViewport: 'mobile1',
  },
};

export const TabletView = Template.bind({});
TabletView.args = {
  ...WithRevision.args,
};
TabletView.parameters = {
  viewport: {
    defaultViewport: 'tablet',
  },
};


// --- Full Feature Story: All Badges and Controls ---
// ProgressStatsDisplay story removed - header will not render inline stats in stories

export const AllBadgesAndControls = Template.bind({});
AllBadgesAndControls.args = {
  ...WithRevision.args,
  statsSlot: null,
};
AllBadgesAndControls.parameters = {
  viewport: {
    defaultViewport: 'desktop',
  },
};