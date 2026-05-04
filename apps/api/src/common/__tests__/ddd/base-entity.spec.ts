import { BaseEntity } from '../../ddd/base-entity';

interface TestProps {
  name: string;
  status: string;
}

class TestEntity extends BaseEntity<TestProps> {
  static create(id: string, tenantId: string, props: TestProps): TestEntity {
    return new TestEntity(id, tenantId, props);
  }

  get name(): string { return this.props.name; }
  get status(): string { return this.props.status; }

  rename(name: string): void {
    this.props = { ...this.props, name };
    this.touch();
  }
}

describe('BaseEntity', () => {
  it('should create entity with id and tenantId', () => {
    const entity = TestEntity.create('id-1', 'tenant-1', { name: 'Test', status: 'ACTIVE' });
    expect(entity.id).toBe('id-1');
    expect(entity.tenantId).toBe('tenant-1');
    expect(entity.name).toBe('Test');
  });

  it('should set createdAt and updatedAt on creation', () => {
    const entity = TestEntity.create('id-1', 'tenant-1', { name: 'Test', status: 'ACTIVE' });
    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(entity.updatedAt).toBeInstanceOf(Date);
  });

  it('should update updatedAt on touch()', () => {
    const entity = TestEntity.create('id-1', 'tenant-1', { name: 'Test', status: 'ACTIVE' });
    const before = entity.updatedAt;
    entity.rename('Updated');
    expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('should return true for equals with same id + tenantId', () => {
    const a = TestEntity.create('id-1', 'tenant-1', { name: 'A', status: 'ACTIVE' });
    const b = TestEntity.create('id-1', 'tenant-1', { name: 'B', status: 'INACTIVE' });
    expect(a.equals(b)).toBe(true);
  });

  it('should return false for equals with different id', () => {
    const a = TestEntity.create('id-1', 'tenant-1', { name: 'A', status: 'ACTIVE' });
    const b = TestEntity.create('id-2', 'tenant-1', { name: 'A', status: 'ACTIVE' });
    expect(a.equals(b)).toBe(false);
  });

  describe('edge cases', () => {
    it('should return false for equals with same id but different tenantId', () => {
      const a = TestEntity.create('id-1', 'tenant-1', { name: 'A', status: 'ACTIVE' });
      const b = TestEntity.create('id-1', 'tenant-2', { name: 'A', status: 'ACTIVE' });
      expect(a.equals(b)).toBe(false);
    });

    it('should preserve id and tenantId after mutation', () => {
      const entity = TestEntity.create('id-1', 'tenant-1', { name: 'Before', status: 'ACTIVE' });
      entity.rename('After');
      expect(entity.id).toBe('id-1');
      expect(entity.tenantId).toBe('tenant-1');
    });

    it('should handle empty string name without throwing', () => {
      const entity = TestEntity.create('id-1', 'tenant-1', { name: 'Test', status: 'ACTIVE' });
      entity.rename('');
      expect(entity.name).toBe('');
    });
  });
});
