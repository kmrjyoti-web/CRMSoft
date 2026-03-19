/**
 * Factory for test lead objects.
 */

let counter = 0;

export interface TestLead {
  id: string;
  tenantId: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  source: string | null;
  score: number;
  assignedToId: string | null;
  organizationId: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export function createTestLead(overrides: Partial<TestLead> = {}): TestLead {
  counter++;
  return {
    id: `test-lead-${counter}`,
    tenantId: 'test-tenant-1',
    name: `Test Lead ${counter}`,
    email: `lead${counter}@test.com`,
    phone: `9876543${String(counter).padStart(3, '0')}`,
    status: 'NEW',
    source: null,
    score: 0,
    assignedToId: null,
    organizationId: null,
    isActive: true,
    isDeleted: false,
    createdById: 'test-user-1',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

export function resetLeadCounter(): void {
  counter = 0;
}
