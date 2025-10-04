import PracticeIntro from '../PracticeIntro';

export default {
  title: 'UI/PracticeIntro (Tour)',
  component: PracticeIntro,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'iphonex',
    },
  },
};

export const Default = {
  render: () => <PracticeIntro onDismiss={() => console.log('Tour dismissed')} />,
};
