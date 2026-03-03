import { ContactEntity } from '../../domain/entities/contact.entity';

describe('ContactEntity', () => {
  const validProps = {
    firstName: 'Vikram',
    lastName: 'Sharma',
    designation: 'CTO',
    department: 'Engineering',
    notes: 'Key decision maker',
    createdById: 'user-1',
  };

  describe('create()', () => {
    it('should create with valid props', () => {
      const c = ContactEntity.create('c-1', validProps);
      expect(c.id).toBe('c-1');
      expect(c.firstName).toBe('Vikram');
      expect(c.lastName).toBe('Sharma');
      expect(c.designation).toBe('CTO');
      expect(c.isActive).toBe(true);
    });

    it('should trim all string fields', () => {
      const c = ContactEntity.create('c-1', {
        ...validProps, firstName: '  Vikram  ', lastName: '  Sharma  ',
      });
      expect(c.firstName).toBe('Vikram');
      expect(c.lastName).toBe('Sharma');
    });

    it('should emit ContactCreatedEvent', () => {
      const c = ContactEntity.create('c-1', validProps);
      const events = c.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('ContactCreated');
    });

    it('should throw when firstName empty', () => {
      expect(() => ContactEntity.create('c-1', { ...validProps, firstName: '' }))
        .toThrow('First name is required');
    });

    it('should throw when firstName whitespace only', () => {
      expect(() => ContactEntity.create('c-1', { ...validProps, firstName: '   ' }))
        .toThrow('First name is required');
    });

    it('should throw when lastName empty', () => {
      expect(() => ContactEntity.create('c-1', { ...validProps, lastName: '' }))
        .toThrow('Last name is required');
    });

    it('should allow creation without optional fields', () => {
      const c = ContactEntity.create('c-1', {
        firstName: 'Test', lastName: 'User', createdById: 'u-1',
      });
      expect(c.designation).toBeUndefined();
      expect(c.department).toBeUndefined();
      expect(c.notes).toBeUndefined();
    });

    it('should set empty string optionals to undefined', () => {
      const c = ContactEntity.create('c-1', {
        ...validProps, designation: '', department: '  ',
      });
      expect(c.designation).toBeUndefined();
      expect(c.department).toBeUndefined();
    });
  });

  describe('updateDetails()', () => {
    it('should update firstName', () => {
      const c = ContactEntity.create('c-1', validProps);
      c.updateDetails({ firstName: 'Rahul' }, 'u-2');
      expect(c.firstName).toBe('Rahul');
    });

    it('should update multiple fields', () => {
      const c = ContactEntity.create('c-1', validProps);
      c.updateDetails({ designation: 'CEO', department: 'Management' }, 'u-2');
      expect(c.designation).toBe('CEO');
      expect(c.department).toBe('Management');
    });

    it('should emit ContactUpdatedEvent', () => {
      const c = ContactEntity.create('c-1', validProps);
      c.clearDomainEvents();
      c.updateDetails({ firstName: 'New' }, 'u-2');
      const events = c.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('ContactUpdated');
    });

    it('should throw when firstName empty', () => {
      const c = ContactEntity.create('c-1', validProps);
      expect(() => c.updateDetails({ firstName: '' }, 'u-2'))
        .toThrow('First name cannot be empty');
    });

    it('should throw when lastName empty', () => {
      const c = ContactEntity.create('c-1', validProps);
      expect(() => c.updateDetails({ lastName: '  ' }, 'u-2'))
        .toThrow('Last name cannot be empty');
    });

    it('should throw when no fields provided', () => {
      const c = ContactEntity.create('c-1', validProps);
      expect(() => c.updateDetails({}, 'u-2'))
        .toThrow('No fields provided to update');
    });

    it('should throw when deactivated', () => {
      const c = ContactEntity.create('c-1', validProps);
      c.deactivate();
      expect(() => c.updateDetails({ firstName: 'X' }, 'u-2'))
        .toThrow('Cannot update deactivated contact');
    });
  });

  describe('deactivate()', () => {
    it('should deactivate active contact', () => {
      const c = ContactEntity.create('c-1', validProps);
      c.deactivate();
      expect(c.isActive).toBe(false);
    });

    it('should emit ContactDeactivatedEvent', () => {
      const c = ContactEntity.create('c-1', validProps);
      c.clearDomainEvents();
      c.deactivate();
      expect(c.getDomainEvents()).toHaveLength(1);
      expect(c.getDomainEvents()[0].eventName).toBe('ContactDeactivated');
    });

    it('should throw when already deactivated', () => {
      const c = ContactEntity.create('c-1', validProps);
      c.deactivate();
      expect(() => c.deactivate()).toThrow('already deactivated');
    });
  });

  describe('reactivate()', () => {
    it('should reactivate deactivated contact', () => {
      const c = ContactEntity.create('c-1', validProps);
      c.deactivate();
      c.reactivate();
      expect(c.isActive).toBe(true);
    });

    it('should throw when already active', () => {
      const c = ContactEntity.create('c-1', validProps);
      expect(() => c.reactivate()).toThrow('already active');
    });
  });

  describe('fromPersistence()', () => {
    it('should reconstitute from DB data', () => {
      const c = ContactEntity.fromPersistence({
        id: 'c-1', firstName: 'DB', lastName: 'User',
        designation: 'CTO', department: 'Eng', notes: 'N',
        isActive: true, createdById: 'u-1',
        createdAt: new Date(), updatedAt: new Date(),
      });
      expect(c.id).toBe('c-1');
      expect(c.firstName).toBe('DB');
      expect(c.isActive).toBe(true);
    });

    it('should handle null optional fields', () => {
      const c = ContactEntity.fromPersistence({
        id: 'c-1', firstName: 'Min', lastName: 'User',
        designation: null, department: null, notes: null,
        isActive: false, createdById: 'u-1',
        createdAt: new Date(), updatedAt: new Date(),
      });
      expect(c.designation).toBeUndefined();
      expect(c.isActive).toBe(false);
    });
  });
});
