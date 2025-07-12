import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
  testMatch: ['**/tests/**/*.test.ts'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  collectCoverage: true,
  coveragePathIgnorePatterns: ['<rootDir>/src/index.ts', '<rootDir>/src/helpers/bootstrap', '<rootDir>/src/config/clients', '<rootDir>/src/config/express.ts'],
  collectCoverageFrom: [
    'src/**/*.{js,ts}', // Include JavaScript and TypeScript files in src/
    '!./tests/**', // Exclude test files
    '!./**/*.test.{js,ts}', // Exclude test files
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default config;
