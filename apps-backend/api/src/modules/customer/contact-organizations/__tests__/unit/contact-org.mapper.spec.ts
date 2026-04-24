import { ContactOrgMapper } from '../../infrastructure/mappers/contact-org.mapper';
import { ContactOrganizationEntity } from '../../domain/entities/contact-organization.entity';

describe('ContactOrgMapper', () => {
  describe('toDomain()', () => {
    it('should convert to domain entity', () => {
      const entity = ContactOrgMapper.toDomain({
        id: 'm-1', contactId: 'c-1', organizationId: 'org-1',
        relationType: 'EMPLOYEE', isPrimary: false,
        designation: 'CTO', department: 'Eng',
        startDate: new Date(), endDate: null,
        isActive: true, notes: null,
        createdAt: new Date(), updatedAt: new Date(),
      });
      expect(entity).toBeInstanceOf(ContactOrganizationEntity);
      expect(entity.id).toBe('m-1');
      expect(entity.relationType.value).toBe('EMPLOYEE');
    });

    it('should handle null fields', () => {
      const entity = ContactOrgMapper.toDomain({
        id: 'm-1', contactId: 'c-1', organizationId: 'org-1',
        relationType: 'DIRECTOR', isPrimary: true,
        designation: null, department: null,
        startDate: null, endDate: null,
        isActive: true, notes: null,
        createdAt: new Date(), updatedAt: new Date(),
      });
      expect(entity.designation).toBeUndefined();
      expect(entity.isPrimary).toBe(true);
    });
  });

  describe('toPersistence()', () => {
    it('should convert to persistence format', () => {
      const entity = ContactOrganizationEntity.create('m-1', {
        contactId: 'c-1', organizationId: 'org-1',
        relationType: 'FOUNDER', designation: 'CEO',
      });
      const data = ContactOrgMapper.toPersistence(entity);
      expect(data.id).toBe('m-1');
      expect(data.relationType).toBe('FOUNDER');
      expect(data.designation).toBe('CEO');
    });

    it('should set null for missing fields', () => {
      const entity = ContactOrganizationEntity.create('m-1', {
        contactId: 'c-1', organizationId: 'org-1',
      });
      const data = ContactOrgMapper.toPersistence(entity);
      expect(data.designation).toBeNull();
      expect(data.department).toBeNull();
      expect(data.endDate).toBeNull();
    });
  });
});
