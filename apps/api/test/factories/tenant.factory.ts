/**
 * Factory for test tenant objects.
 */

let counter = 0;

export interface TestTenant {
  id: string;
  name: string;
  slug: string;
  gstin: string;
  stateCode: string;
  isActive: boolean;
  isDeleted: boolean;
  hasDedicatedDb: boolean;
  databaseUrl: string | null;
  packageId: string | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export function createTestTenant(overrides: Partial<TestTenant> = {}): TestTenant {
  counter++;
  return {
    id: `test-tenant-${counter}`,
    name: `Test Company ${counter}`,
    slug: `test-company-${counter}`,
    gstin: '27AAPFU0939F1ZV',
    stateCode: '27',
    isActive: true,
    isDeleted: false,
    hasDedicatedDb: false,
    databaseUrl: null,
    packageId: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

/** Reset counter (call in beforeEach if deterministic IDs are required) */
export function resetTenantCounter(): void {
  counter = 0;
}
