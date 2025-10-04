import type { Meta } from '@storybook/react';
import SessionStartCard from '../SessionStartCard';

const meta: Meta<typeof SessionStartCard> = {
  title: 'Practice/SessionStartCard',
  component: SessionStartCard,
};

export default meta;

export const Default = () => {
  return (
    <SessionStartCard
      totalQuestions={12}
      onStart={() => console.log('Start practice!')}
    />
  );
};

Default.storyName = 'Full modal (Ready to practice?)';
