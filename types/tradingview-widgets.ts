import type React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'tv-mini-chart': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        symbol?: string;
      };
    }
  }
}

export {};


