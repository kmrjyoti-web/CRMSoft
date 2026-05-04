import { OrganizationEntity } from '../../domain/entities/organization.entity';

describe('OrganizationEntity', () => {
  const validProps = {
    name: 'TechCorp India',
    email: 'contact@techcorp.in',
    phone: '+91-22-12345678',
    gstNumber: '27AABCT1234E1Z5',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    industry: 'IT / Software',
    createdById: 'user-1',
  };

  describe('create()', () => {
    it('should create with valid props', () => {
      const org = OrganizationEntity.create('org-1', validProps);
      expect(org.id).toBe('org-1');
      expect(org.name).toBe('TechCorp India');
      expect(org.email).toBe('contact@techcorp.in');
      expect(org.gstNumber).toBe('27AABCT1234E1Z5');
      expect(org.isActive).toBe(true);
    });

    it('should trim all string fields', () => {
      const org = OrganizationEntity.create('org-1', {
        ...validProps, name: '  TechCorp  ', city: '  Mumbai  ',
      });
      expect(org.name).toBe('TechCorp');
      expect(org.city).toBe('Mumbai');
    });

    it('should lowercase email', () => {
      const org = OrganizationEntity.create('org-1', {
        ...validProps, email: 'ADMIN@TechCorp.IN',
      });
      expect(org.email).toBe('admin@techcorp.in');
    });

    it('should uppercase GST number', () => {
      const org = OrganizationEntity.create('org-1', {
        ...validProps, gstNumber: '27aabct1234e1z5',
      });
      expect(org.gstNumber).toBe('27AABCT1234E1Z5');
    });

    it('should emit OrganizationCreatedEvent', () => {
      const org = OrganizationEntity.create('org-1', validProps);
      const events = org.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('OrganizationCreated');
    });

    it('should throw when name too short', () => {
      expect(() => OrganizationEntity.create('org-1', { ...validProps, name: 'A' }))
        .toThrow('Organization name must be at least 2 characters');
    });

    it('should throw when name empty', () => {
      expect(() => OrganizationEntity.create('org-1', { ...validProps, name: '' }))
        .toThrow('Organization name must be at least 2 characters');
    });

    it('should throw when name only whitespace', () => {
      expect(() => OrganizationEntity.create('org-1', { ...validProps, name: '   ' }))
        .toThrow('Organization name must be at least 2 characters');
    });

    it('should throw when email invalid', () => {
      expect(() => OrganizationEntity.create('org-1', { ...validProps, email: 'bad-email' }))
        .toThrow('Invalid email format');
    });

    it('should allow creation without optional fields', () => {
      const org = OrganizationEntity.create('org-1', {
        name: 'MinimalOrg', createdById: 'user-1',
      });
      expect(org.name).toBe('MinimalOrg');
      expect(org.email).toBeUndefined();
      expect(org.phone).toBeUndefined();
      expect(org.city).toBeUndefined();
    });
  });

  describe('updateDetails()', () => {
    it('should update name', () => {
      const org = OrganizationEntity.create('org-1', validProps);
      org.updateDetails({ name: 'New TechCorp' });
      expect(org.name).toBe('New TechCorp');
    });

    it('should update email', () => {
      const org = OrganizationEntity.create('org-1', validProps);
      org.updateDetails({ email: 'new@techcorp.in' });
      expect(org.email).toBe('new@techcorp.in');
    });

    it('should emit OrganizationUpdatedEvent', () => {
      const org = OrganizationEntity.create('org-1', validProps);
      org.clearDomainEvents();
      org.updateDetails({ name: 'Updated' });
      const events = org.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('OrganizationUpdated');
    });

    it('should throw when name too short', () => {
      const org = OrganizationEntity.create('org-1', validProps);
      expect(() => org.updateDetails({ name: 'X' })).toThrow('at least 2 characters');
    });

    it('should throw when email invalid', () => {
      const org = OrganizationEntity.create('org-1', validProps);
      expect(() => org.updateDetails({ email: 'invalid' })).toThrow('Invalid email');
    });

    it('should throw when deactivated', () => {
      const org = OrganizationEntity.create('org-1', validProps);
      org.deactivate();
      expect(() => org.updateDetails({ name: 'Test' }))
        .toThrow('Cannot update deactivated organization');
    });

    it('should update multiple fields at once', () => {
      const org = OrganizationEntity.create('org-1', validProps);
      org.updateDetails({ city: 'Delhi', industry: 'Finance', phone: '+91-11-999' });
      expect(org.city).toBe('Delhi');
      expect(org.industry).toBe('Finance');
      expect(org.phone).toBe('+91-11-999');
    });
  });

  describe('deactivate()', () => {
    it('should deactivate active org', () => {
      const org = OrganizationEntity.create('org-1', validProps);
      org.deactivate();
      expect(org.isActive).toBe(false);
    });

    it('should emit OrganizationDeactivatedEvent', () => {
      const org = OrganizationEntity.create('org-1', validProps);
      org.clearDomainEvents();
      org.deactivate();
      const events = org.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('OrganizationDeactivated');
    });

    it('should throw when already deactivated', () => {
      const org = OrganizationEntity.create('org-1', validProps);
      org.deactivate();
      expect(() => org.deactivate()).toThrow('already deactivated');
    });
  });

  describe('reactivate()', () => {
    it('should reactivate deactivated org', () => {
      const org = OrganizationEntity.create('org-1', validProps);
      org.deactivate();
      org.reactivate();
      expect(org.isActive).toBe(true);
    });

    it('should throw when already active', () => {
      const org = OrganizationEntity.create('org-1', validProps);
      expect(() => org.reactivate()).toThrow('already active');
    });
  });

  describe('fromPersistence()', () => {
    it('should reconstitute from DB data', () => {
      const org = OrganizationEntity.fromPersistence({
        id: 'org-1', name: 'DB Org', email: 'db@org.com', phone: '+91-123',
        website: 'https://db.com', gstNumber: 'GST123', address: 'Addr',
        city: 'City', state: 'State', country: 'Country', pincode: '12345',
        industry: 'IT', notes: 'Notes', isActive: true,
        createdById: 'user-1', createdAt: new Date(), updatedAt: new Date(),
      });
      expect(org.id).toBe('org-1');
      expect(org.name).toBe('DB Org');
      expect(org.isActive).toBe(true);
    });

    it('should handle null optional fields', () => {
      const org = OrganizationEntity.fromPersistence({
        id: 'org-1', name: 'MinOrg', email: null, phone: null,
        website: null, gstNumber: null, address: null, city: null,
        state: null, country: null, pincode: null, industry: null,
        notes: null, isActive: false, createdById: 'u-1',
        createdAt: new Date(), updatedAt: new Date(),
      });
      expect(org.email).toBeUndefined();
      expect(org.phone).toBeUndefined();
      expect(org.isActive).toBe(false);
    });
  });
});
