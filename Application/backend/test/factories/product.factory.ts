/**
 * Factory for test product objects.
 */

let counter = 0;

export interface TestProduct {
  id: string;
  tenantId: string;
  name: string;
  sku: string;
  description: string | null;
  mrp: number;
  hsnCode: string | null;
  gstRate: number;
  unit: string;
  categoryId: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export function createTestProduct(overrides: Partial<TestProduct> = {}): TestProduct {
  counter++;
  return {
    id: `test-product-${counter}`,
    tenantId: 'test-tenant-1',
    name: `Test Product ${counter}`,
    sku: `SKU-${String(counter).padStart(4, '0')}`,
    description: null,
    mrp: 10000,
    hsnCode: '8471',
    gstRate: 18,
    unit: 'PCS',
    categoryId: null,
    isActive: true,
    isDeleted: false,
    createdById: 'test-user-1',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

export function resetProductCounter(): void {
  counter = 0;
}
