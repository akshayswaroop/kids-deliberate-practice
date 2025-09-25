import ProgressBubble from './ProgressBubble';

export default {
  title: 'UI/ProgressBubble',
  component: ProgressBubble,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Text to display in the center of the bubble',
    },
    progress: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress value from 0-100',
    },
    size: {
      control: { type: 'range', min: 24, max: 120, step: 4 },
      description: 'Size of the bubble in pixels',
    },
  },
};

// Story 1: No progress (gray background)
export const NoProgress = {
  args: {
    label: 'cat',
    progress: 0,
  },
};

// Story 2: Partial progress (partial rainbow)
export const PartialProgress = {
  args: {
    label: 'dog',
    progress: 40,
  },
};

// Story 3: Full progress (full rainbow glow)
export const FullProgress = {
  args: {
    label: 'sun',
    progress: 100,
  },
};

// Interactive playground
export const Playground = {
  args: {
    label: 'play',
    progress: 60,
    size: 56,
  },
};

// Size comparison
export const SizeVariations = () => (
  <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
    <div style={{ textAlign: 'center' }}>
      <ProgressBubble label="cat" progress={60} size={32} />
      <div style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>Small (32px)</div>
    </div>
    <div style={{ textAlign: 'center' }}>
      <ProgressBubble label="dog" progress={60} size={56} />
      <div style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>Default (56px)</div>
    </div>
    <div style={{ textAlign: 'center' }}>
      <ProgressBubble label="sun" progress={60} size={80} />
      <div style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>Large (80px)</div>
    </div>
  </div>
);

// Progress comparison
export const AllVariations = () => (
  <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
    <ProgressBubble label="cat" progress={0} />
    <ProgressBubble label="dog" progress={40} />
    <ProgressBubble label="sun" progress={100} />
  </div>
);