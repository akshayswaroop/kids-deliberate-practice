import React from 'react';
import type { Meta } from '@storybook/react';
import SubjectPickerModal from '../SubjectPickerModal';
import { SUBJECT_CONFIGS } from '../../../infrastructure/repositories/subjectLoader';

const meta: Meta<typeof SubjectPickerModal> = {
  title: 'Practice/SubjectPickerModal',
  component: SubjectPickerModal,
};

export default meta;

export const Open = () => {
  const [open, setOpen] = React.useState(true);
  return (
    <div style={{ height: '100vh' }}>
      <button onClick={() => setOpen(true)} style={{ position: 'absolute', top: 12, right: 12 }}>Open modal</button>
      <SubjectPickerModal
        open={open}
        selectedMode={SUBJECT_CONFIGS[0].name}
        onSelect={(mode) => { console.log('selected', mode); setOpen(false); }}
        onClose={() => setOpen(false)}
      />
    </div>
  );
};

Open.storyName = 'Open (desktop & mobile)';
