import { ContactMapper } from '../../infrastructure/mappers/contact.mapper';
import { ContactEntity } from '../../domain/entities/contact.entity';

describe('ContactMapper', () => {
  describe('toDomain()', () => {
    it('should convert to domain entity', () => {
      const entity = ContactMapper.toDomain({
        id: 'c-1', firstName: 'Vikram', lastName: 'Sharma',
        designation: 'CTO', department: 'Eng', notes: 'N',
        isActive: true, createdById: 'u-1',
        createdAt: new Date(), updatedAt: new Date(),
      });
      expect(entity).toBeInstanceOf(ContactEntity);
      expect(entity.id).toBe('c-1');
      expect(entity.firstName).toBe('Vikram');
    });

    it('should handle null optional fields', () => {
      const entity = ContactMapper.toDomain({
        id: 'c-1', firstName: 'Min', lastName: 'User',
        designation: null, department: null, notes: null,
        isActive: true, createdById: 'u-1',
        createdAt: new Date(), updatedAt: new Date(),
      });
      expect(entity.designation).toBeUndefined();
    });
  });

  describe('toPersistence()', () => {
    it('should convert to persistence format', () => {
      const entity = ContactEntity.create('c-1', {
        firstName: 'Test', lastName: 'User', designation: 'PM', createdById: 'u-1',
      });
      const data = ContactMapper.toPersistence(entity);
      expect(data.id).toBe('c-1');
      expect(data.firstName).toBe('Test');
      expect(data.designation).toBe('PM');
    });

    it('should set null for missing optional fields', () => {
      const entity = ContactEntity.create('c-1', {
        firstName: 'Min', lastName: 'User', createdById: 'u-1',
      });
      const data = ContactMapper.toPersistence(entity);
      expect(data.designation).toBeNull();
      expect(data.department).toBeNull();
    });
  });
});
