import HomePage from './HomePage';
import React from 'react';

const dummyUsers = {
  user1: { words: {}, sessions: {}, settings: { languages: ['english'] } },
};

const twelve = Array.from({ length: 12 }).map((_, i) => ({ id: String(i+1), label: `w${i+1}`, progress: (i*8)%101 }));

export default {
  title: 'App/HomePage 12 Bubbles',
  component: HomePage,
};

const baseProps = {
  users: dummyUsers,
  currentUserId: 'user1',
  onCreateUser: () => {},
  onSwitchUser: () => {},
  onSetMode: () => {},
  mode: 'english',
  mainWord: 'cat',
  choices: twelve,
  onCorrect: () => {},
  onWrong: () => {},
};

export const TopBar_12 = { args: { ...baseProps, layout: 'topbar' } };
export const Sidebar_12 = { args: { ...baseProps, layout: 'sidebar' } };
export const Center_12 = { args: { ...baseProps, layout: 'center' } };
