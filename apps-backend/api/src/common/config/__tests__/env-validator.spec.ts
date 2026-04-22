import { validateEnv } from '../env-validator';

const REQUIRED_KEYS = [
  'DATABASE_URL',
  'IDENTITY_DATABASE_URL',
  'PLATFORM_DATABASE_URL',
  'GLOBAL_WORKING_DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

describe('validateEnv', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original env
    for (const key of REQUIRED_KEYS) {
      if (originalEnv[key] !== undefined) {
        process.env[key] = originalEnv[key];
      } else {
        delete process.env[key];
      }
    }
  });

  it('passes when all required env vars are set', () => {
    for (const key of REQUIRED_KEYS) {
      process.env[key] = 'test-value';
    }
    expect(() => validateEnv()).not.toThrow();
  });

  it('throws when a required env var is missing', () => {
    for (const key of REQUIRED_KEYS) {
      process.env[key] = 'test-value';
    }
    delete process.env['JWT_SECRET'];
    expect(() => validateEnv()).toThrow(/Missing required environment variables/);
  });

  it('throws listing all missing vars', () => {
    for (const key of REQUIRED_KEYS) {
      delete process.env[key];
    }
    expect(() => validateEnv()).toThrow(/JWT_SECRET/);
  });
});
