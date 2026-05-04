import { RawContactMapper } from '../../infrastructure/mappers/raw-contact.mapper';
import { RawContactEntity } from '../../domain/entities/raw-contact.entity';

describe('RawContactMapper', () => {
  const mockPrisma = {
    id: 'rc-1', firstName: 'Test', lastName: 'User',
    status: 'RAW', source: 'MANUAL', companyName: 'TechCorp',
    designation: 'CTO', department: 'Eng', notes: 'Note',
    verifiedAt: null, verifiedById: null, contactId: null,
    createdById: 'user-1', createdAt: new Date(), updatedAt: new Date(),
  };

  describe('toDomain()', () => {
    it('should convert to domain entity', () => {
      const entity = RawContactMapper.toDomain(mockPrisma);
      expect(entity).toBeInstanceOf(RawContactEntity);
      expect(entity.id).toBe('rc-1');
      expect(entity.status.value).toBe('RAW');
      expect(entity.companyName).toBe('TechCorp');
    });

    it('should handle null optional fields', () => {
      const entity = RawContactMapper.toDomain({ ...mockPrisma, companyName: null });
      expect(entity.companyName).toBeUndefined();
    });
  });

  describe('toPersistence()', () => {
    it('should convert to persistence format', () => {
      const entity = RawContactEntity.create('rc-1', {
        firstName: 'Test', lastName: 'User', companyName: 'Corp', createdById: 'u-1',
      });
      const data = RawContactMapper.toPersistence(entity);
      expect(data.id).toBe('rc-1');
      expect(data.status).toBe('RAW');
      expect(data.companyName).toBe('Corp');
    });

    it('should set null for missing optional fields', () => {
      const entity = RawContactEntity.create('rc-1', {
        firstName: 'Test', lastName: 'User', createdById: 'u-1',
      });
      const data = RawContactMapper.toPersistence(entity);
      expect(data.companyName).toBeNull();
      expect(data.verifiedAt).toBeNull();
      expect(data.contactId).toBeNull();
    });
  });
});
