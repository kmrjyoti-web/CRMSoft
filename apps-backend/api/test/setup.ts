/**
 * Global test setup — loaded before all E2E tests.
 * Referenced in test/jest-e2e.json via setupFilesAfterFramework.
 */

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-key-for-unit-tests';
  process.env.PLATFORM_DATABASE_URL =
    process.env.PLATFORM_DATABASE_URL ?? 'postgresql://localhost:5432/crmsoft_test_platform';
  process.env.IDENTITY_DATABASE_URL =
    process.env.IDENTITY_DATABASE_URL ?? 'postgresql://localhost:5432/crmsoft_test_identity';
  process.env.GLOBAL_WORKING_DATABASE_URL =
    process.env.GLOBAL_WORKING_DATABASE_URL ?? 'postgresql://localhost:5432/crmsoft_test_working';
});
