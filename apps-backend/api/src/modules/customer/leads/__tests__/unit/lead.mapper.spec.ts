import { LeadMapper } from '../../infrastructure/mappers/lead.mapper';
import { LeadEntity } from '../../domain/entities/lead.entity';

describe('LeadMapper', () => {
  describe('toDomain()', () => {
    it('should convert to domain entity', () => {
      const entity = LeadMapper.toDomain({
        id: 'lead-1', leadNumber: 'LD-00001', contactId: 'c-1',
        organizationId: 'org-1', status: 'ALLOCATED', priority: 'HIGH',
        expectedValue: '50000.00', expectedCloseDate: new Date('2026-06-30'),
        allocatedToId: 'sales-1', allocatedAt: new Date(),
        lostReason: null, notes: 'Important', createdById: 'u-1',
        createdAt: new Date(), updatedAt: new Date(),
      });
      expect(entity).toBeInstanceOf(LeadEntity);
      expect(entity.id).toBe('lead-1');
      expect(entity.status.value).toBe('ALLOCATED');
      expect(entity.expectedValue).toBe(50000);
    });

    it('should handle null optional fields', () => {
      const entity = LeadMapper.toDomain({
        id: 'lead-1', leadNumber: 'LD-00001', contactId: 'c-1',
        organizationId: null, status: 'NEW', priority: 'MEDIUM',
        expectedValue: null, expectedCloseDate: null,
        allocatedToId: null, allocatedAt: null,
        lostReason: null, notes: null, createdById: 'u-1',
        createdAt: new Date(), updatedAt: new Date(),
      });
      expect(entity.organizationId).toBeUndefined();
      expect(entity.expectedValue).toBeUndefined();
      expect(entity.allocatedToId).toBeUndefined();
    });
  });

  describe('toPersistence()', () => {
    it('should convert to persistence format', () => {
      const entity = LeadEntity.create('lead-1', {
        leadNumber: 'LD-00001', contactId: 'c-1', organizationId: 'org-1',
        priority: 'HIGH', expectedValue: 50000, createdById: 'u-1',
      });
      const data = LeadMapper.toPersistence(entity);
      expect(data.id).toBe('lead-1');
      expect(data.status).toBe('NEW');
      expect(data.expectedValue).toBe(50000);
    });

    it('should set null for missing optional fields', () => {
      const entity = LeadEntity.create('lead-1', {
        leadNumber: 'LD-00001', contactId: 'c-1', priority: 'MEDIUM', createdById: 'u-1',
      });
      const data = LeadMapper.toPersistence(entity);
      expect(data.organizationId).toBeNull();
      expect(data.expectedValue).toBeNull();
      expect(data.allocatedToId).toBeNull();
      expect(data.lostReason).toBeNull();
    });
  });
});
