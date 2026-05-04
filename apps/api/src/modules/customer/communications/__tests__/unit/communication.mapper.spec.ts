import { CommunicationMapper } from '../../infrastructure/mappers/communication.mapper';
import { CommunicationEntity } from '../../domain/entities/communication.entity';

describe('CommunicationMapper', () => {
  describe('toDomain()', () => {
    it('should convert to domain entity', () => {
      const entity = CommunicationMapper.toDomain({
        id: 'comm-1', type: 'PHONE', value: '+91-9876543210',
        priorityType: 'PRIMARY', isPrimary: true, isVerified: false,
        label: 'Office', rawContactId: null, contactId: 'c-1',
        organizationId: null, leadId: null, notes: null,
        createdAt: new Date(), updatedAt: new Date(),
      });
      expect(entity).toBeInstanceOf(CommunicationEntity);
      expect(entity.id).toBe('comm-1');
      expect(entity.type.value).toBe('PHONE');
      expect(entity.isPrimary).toBe(true);
    });

    it('should handle null optional fields', () => {
      const entity = CommunicationMapper.toDomain({
        id: 'comm-1', type: 'EMAIL', value: 'a@b.com',
        priorityType: 'WORK', isPrimary: false, isVerified: true,
        label: null, rawContactId: 'rc-1', contactId: null,
        organizationId: null, leadId: null, notes: null,
        createdAt: new Date(), updatedAt: new Date(),
      });
      expect(entity.label).toBeUndefined();
      expect(entity.contactId).toBeUndefined();
    });
  });

  describe('toPersistence()', () => {
    it('should convert to persistence format', () => {
      const entity = CommunicationEntity.create('comm-1', {
        type: 'EMAIL', value: 'a@b.com', priorityType: 'WORK',
        label: 'Work', contactId: 'c-1',
      });
      const data = CommunicationMapper.toPersistence(entity);
      expect(data.id).toBe('comm-1');
      expect(data.type).toBe('EMAIL');
      expect(data.value).toBe('a@b.com');
      expect(data.contactId).toBe('c-1');
    });

    it('should set null for missing optional fields', () => {
      const entity = CommunicationEntity.create('comm-1', {
        type: 'PHONE', value: '+91-9876543210', rawContactId: 'rc-1',
      });
      const data = CommunicationMapper.toPersistence(entity);
      expect(data.contactId).toBeNull();
      expect(data.organizationId).toBeNull();
      expect(data.label).toBeNull();
    });
  });
});
