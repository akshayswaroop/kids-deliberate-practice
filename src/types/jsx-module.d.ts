import type { ComponentType } from 'react';

declare module '*.jsx' {
  const component: ComponentType<any>;
  export default component;
}
