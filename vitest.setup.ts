// Vitest global setup for Happy-Birthday-Website
import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// Mock Next.js Image to plain <img> using React.createElement to avoid JSX in .ts file
vi.mock('next/image', () => {
  return {
    __esModule: true,
    default: (props: any) => React.createElement('img', props),
  };
});
