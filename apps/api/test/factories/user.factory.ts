/**
 * Factory for test user objects.
 */

let counter = 0;

export interface TestUser {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleId: string | null;
  departmentId: string | null;
  designationId: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  counter++;
  return {
    id: `test-user-${counter}`,
    tenantId: 'test-tenant-1',
    email: `user${counter}@test.com`,
    firstName: `Test`,
    lastName: `User ${counter}`,
    password: '$2b$10$hashedpassword',
    roleId: null,
    departmentId: null,
    designationId: null,
    isActive: true,
    isDeleted: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

export function resetUserCounter(): void {
  counter = 0;
}
