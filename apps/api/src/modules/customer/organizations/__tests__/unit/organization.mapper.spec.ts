import { OrganizationMapper } from '../../infrastructure/mappers/organization.mapper';
import { OrganizationEntity } from '../../domain/entities/organization.entity';

describe('OrganizationMapper', () => {
  const mockPrisma = {
    id: 'org-1', name: 'TechCorp', email: 'tech@corp.in', phone: '+91-123',
    website: 'https://techcorp.in', gstNumber: 'GST123', address: 'Addr',
    city: 'Mumbai', state: 'MH', country: 'India', pincode: '400001',
    industry: 'IT', notes: 'Note', isActive: true,
    createdById: 'user-1', createdAt: new Date(), updatedAt: new Date(),
  };

  describe('toDomain()', () => {
    it('should convert to domain entity', () => {
      const entity = OrganizationMapper.toDomain(mockPrisma);
      expect(entity).toBeInstanceOf(OrganizationEntity);
      expect(entity.id).toBe('org-1');
      expect(entity.name).toBe('TechCorp');
      expect(entity.isActive).toBe(true);
    });

    it('should handle null optional fields', () => {
      const entity = OrganizationMapper.toDomain({ ...mockPrisma, email: null, phone: null });
      expect(entity.email).toBeUndefined();
      expect(entity.phone).toBeUndefined();
    });
  });

  describe('toPersistence()', () => {
    it('should convert to persistence format', () => {
      const entity = OrganizationEntity.create('org-1', {
        name: 'Corp', email: 'a@b.com', city: 'Mumbai', createdById: 'u-1',
      });
      const data = OrganizationMapper.toPersistence(entity);
      expect(data.id).toBe('org-1');
      expect(data.name).toBe('Corp');
      expect(data.email).toBe('a@b.com');
      expect(data.isActive).toBe(true);
    });

    it('should set null for missing optional fields', () => {
      const entity = OrganizationEntity.create('org-1', {
        name: 'MinOrg', createdById: 'u-1',
      });
      const data = OrganizationMapper.toPersistence(entity);
      expect(data.email).toBeNull();
      expect(data.phone).toBeNull();
      expect(data.gstNumber).toBeNull();
    });
  });
});
