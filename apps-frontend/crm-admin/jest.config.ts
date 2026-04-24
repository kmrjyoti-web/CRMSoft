import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  displayName: 'crm-admin',
  testEnvironment: '<rootDir>/jest.environment.js',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  moduleNameMapper: {
    // MSW v2 ships as ESM (.mjs) for the node export — force CJS for jest
    '^msw/node$': '<rootDir>/node_modules/msw/lib/node/index.js',
    '^@/components/ui$': '<rootDir>/src/components/ui/index.ts',
    '^@/components/ui/(.*)$': '<rootDir>/src/components/ui/$1',
    '^@/components/common/(.*)$': '<rootDir>/src/components/common/$1',
    '^@/features/(.*)$': '<rootDir>/src/features/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/stores/(.*)$': '<rootDir>/src/stores/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/config/(.*)$': '<rootDir>/src/config/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/providers/(.*)$': '<rootDir>/src/providers/$1',
    '^@/styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@coreui/ui-react$': '<rootDir>/lib/coreui/packages/ui-react/src',
    '^@coreui/ui$': '<rootDir>/lib/coreui/packages/ui/src',
    '^@coreui/theme$': '<rootDir>/lib/coreui/packages/theme/src',
    '^@coreui/layout$': '<rootDir>/lib/coreui/packages/layout/src',
  },

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/app/**/layout.tsx',
    '!src/app/**/page.tsx',
    '!src/**/*.types.ts',
    '!src/middleware.ts',
  ],

  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 60,
      statements: 60,
    },
    './src/components/ui/': {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
  },

  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/lib/coreui/',
    '<rootDir>/e2e/',
  ],
  // transformIgnorePatterns is managed by nextJest via next.config.js transpilePackages.
  // MSW deps (msw, @mswjs/interceptors, until-async, rettime) are listed there.
};

export default createJestConfig(config);
