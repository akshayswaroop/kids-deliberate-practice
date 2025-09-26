import HomePage from './HomePage';
import React from 'react';

const dummyUsers = {
  alice: { words: {}, sessions: {}, settings: { languages: ['english'] } },
  bob: { words: {}, sessions: {}, settings: { languages: ['kannada'] } },
};

const dummyChoices = [
  { id: '1', label: 'cat', progress: 100 },
  { id: '2', label: 'dog', progress: 60 },
  { id: '3', label: 'sun', progress: 0 },
  { id: '4', label: 'run', progress: 80 },
];

export default {
  title: 'App/HomePage',
  component: HomePage,
  tags: ['autodocs'],
  argTypes: {
    layout: {
      control: 'radio',
      options: ['topbar', 'sidebar', 'center'],
    },
  },
};

const baseProps = {
  users: dummyUsers,
  currentUserId: 'alice',
  onCreateUser: () => {},
  onSwitchUser: () => {},
  onSetMode: () => {},
  mode: 'english',
  mainWord: 'cat',
  choices: dummyChoices,
  onCorrect: () => {},
  onWrong: () => {},
};

export const TopBar = {
  args: {
    ...baseProps,
    layout: 'topbar',
  },
};

