import { ContactOrganizationEntity } from '../../domain/entities/contact-organization.entity';

describe('ContactOrganizationEntity', () => {
  const base = { contactId: 'c-1', organizationId: 'org-1' };

  describe('create()', () => {
    it('should create with default EMPLOYEE type', () => {
      const co = ContactOrganizationEntity.create('co-1', base);
      expect(co.relationType.value).toBe('EMPLOYEE');
      expect(co.isActive).toBe(true);
      expect(co.isPrimary).toBe(false);
    });

    it('should accept PRIMARY_CONTACT type', () => {
      const co = ContactOrganizationEntity.create('co-1', {
        ...base, relationType: 'PRIMARY_CONTACT', isPrimary: true,
      });
      expect(co.relationType.value).toBe('PRIMARY_CONTACT');
      expect(co.isPrimary).toBe(true);
    });

    it('should accept DIRECTOR type', () => {
      const co = ContactOrganizationEntity.create('co-1', {
        ...base, relationType: 'DIRECTOR',
      });
      expect(co.relationType.value).toBe('DIRECTOR');
    });

    it('should throw without contactId', () => {
      expect(() => ContactOrganizationEntity.create('co-1', {
        ...base, contactId: '',
      })).toThrow('Contact ID is required');
    });

    it('should throw without organizationId', () => {
      expect(() => ContactOrganizationEntity.create('co-1', {
        ...base, organizationId: '',
      })).toThrow('Organization ID is required');
    });

    it('should throw on invalid relation type', () => {
      expect(() => ContactOrganizationEntity.create('co-1', {
        ...base, relationType: 'INVALID',
      })).toThrow('Invalid relation type');
    });
  });

  describe('setAsPrimary()', () => {
    it('should set isPrimary to true', () => {
      const co = ContactOrganizationEntity.create('co-1', base);
      co.setAsPrimary();
      expect(co.isPrimary).toBe(true);
    });
  });

  describe('deactivate()', () => {
    it('should set isActive false and endDate', () => {
      const co = ContactOrganizationEntity.create('co-1', base);
      co.deactivate();
      expect(co.isActive).toBe(false);
      expect(co.endDate).toBeInstanceOf(Date);
    });
  });

  describe('reactivate()', () => {
    it('should set isActive true and clear endDate', () => {
      const co = ContactOrganizationEntity.create('co-1', base);
      co.deactivate();
      co.reactivate();
      expect(co.isActive).toBe(true);
      expect(co.endDate).toBeUndefined();
    });
  });

  describe('changeRelationType()', () => {
    it('EMPLOYEE → DIRECTOR', () => {
      const co = ContactOrganizationEntity.create('co-1', base);
      co.changeRelationType('DIRECTOR');
      expect(co.relationType.value).toBe('DIRECTOR');
    });
  });
});
