import { RawContactEntity } from '../../domain/entities/raw-contact.entity';

describe('RawContactEntity', () => {
  const base = { firstName: 'Vikram', lastName: 'Sharma', createdById: 'user-1' };

  describe('create()', () => {
    it('should create with RAW status', () => {
      const rc = RawContactEntity.create('rc-1', base);
      expect(rc.status.value).toBe('RAW');
      expect(rc.firstName).toBe('Vikram');
      expect(rc.lastName).toBe('Sharma');
    });

    it('should default source to MANUAL', () => {
      expect(RawContactEntity.create('rc-1', base).source).toBe('MANUAL');
    });

    it('should accept explicit source', () => {
      expect(RawContactEntity.create('rc-1', { ...base, source: 'WEB_FORM' }).source).toBe('WEB_FORM');
    });

    it('should emit RawContactCreatedEvent', () => {
      const rc = RawContactEntity.create('rc-1', base);
      expect(rc.getDomainEvents()).toHaveLength(1);
      expect(rc.getDomainEvents()[0].eventName).toBe('RawContactCreated');
    });

    it('should throw on empty firstName', () => {
      expect(() => RawContactEntity.create('rc-1', { ...base, firstName: '' }))
        .toThrow('First name is required');
    });

    it('should throw on empty lastName', () => {
      expect(() => RawContactEntity.create('rc-1', { ...base, lastName: '  ' }))
        .toThrow('Last name is required');
    });

    it('should trim names', () => {
      const rc = RawContactEntity.create('rc-1', { ...base, firstName: '  Vikram  ' });
      expect(rc.firstName).toBe('Vikram');
    });

    it('should set companyName', () => {
      const rc = RawContactEntity.create('rc-1', { ...base, companyName: 'TechCorp' });
      expect(rc.companyName).toBe('TechCorp');
    });
  });

  describe('verify()', () => {
    it('should transition RAW → VERIFIED', () => {
      const rc = RawContactEntity.create('rc-1', base);
      rc.verify('contact-1', 'verifier-1');
      expect(rc.status.value).toBe('VERIFIED');
      expect(rc.contactId).toBe('contact-1');
      expect(rc.verifiedById).toBe('verifier-1');
      expect(rc.verifiedAt).toBeInstanceOf(Date);
    });

    it('should emit RawContactVerifiedEvent', () => {
      const rc = RawContactEntity.create('rc-1', base);
      rc.clearDomainEvents();
      rc.verify('contact-1', 'verifier-1');
      const events = rc.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('RawContactVerified');
    });

    it('should throw when already VERIFIED', () => {
      const rc = RawContactEntity.fromPersistence({
        ...base, id: 'rc-1', status: 'VERIFIED', source: 'MANUAL',
        contactId: 'c-1', verifiedById: 'v-1', verifiedAt: new Date(),
        createdAt: new Date(), updatedAt: new Date(),
      });
      expect(() => rc.verify('c-2', 'v-2')).toThrow('Cannot verify');
    });

    it('should throw without contactId', () => {
      const rc = RawContactEntity.create('rc-1', base);
      expect(() => rc.verify('', 'v-1')).toThrow('Contact ID is required');
    });

    it('should throw without verifiedById', () => {
      const rc = RawContactEntity.create('rc-1', base);
      expect(() => rc.verify('c-1', '')).toThrow('Verified by user ID is required');
    });
  });

  describe('reject()', () => {
    it('RAW → REJECTED', () => {
      const rc = RawContactEntity.create('rc-1', base);
      rc.reject('Bad data');
      expect(rc.status.value).toBe('REJECTED');
      expect(rc.notes).toBe('Bad data');
    });

    it('should throw when VERIFIED (terminal)', () => {
      const rc = RawContactEntity.fromPersistence({
        ...base, id: 'rc-1', status: 'VERIFIED', source: 'MANUAL',
        createdAt: new Date(), updatedAt: new Date(),
      });
      expect(() => rc.reject()).toThrow('Cannot reject');
    });
  });

  describe('markDuplicate()', () => {
    it('RAW → DUPLICATE', () => {
      const rc = RawContactEntity.create('rc-1', base);
      rc.markDuplicate();
      expect(rc.status.value).toBe('DUPLICATE');
    });
  });

  describe('reopen()', () => {
    it('REJECTED → RAW', () => {
      const rc = RawContactEntity.create('rc-1', base);
      rc.reject();
      rc.reopen();
      expect(rc.status.value).toBe('RAW');
    });

    it('should throw from VERIFIED (terminal)', () => {
      const rc = RawContactEntity.fromPersistence({
        ...base, id: 'rc-1', status: 'VERIFIED', source: 'MANUAL',
        createdAt: new Date(), updatedAt: new Date(),
      });
      expect(() => rc.reopen()).toThrow('Cannot reopen');
    });
  });

  describe('updateDetails()', () => {
    it('should update in RAW status', () => {
      const rc = RawContactEntity.create('rc-1', base);
      rc.updateDetails({ firstName: 'Rohit', companyName: 'NewCorp' });
      expect(rc.firstName).toBe('Rohit');
      expect(rc.companyName).toBe('NewCorp');
    });

    it('should throw in VERIFIED status (terminal)', () => {
      const rc = RawContactEntity.fromPersistence({
        ...base, id: 'rc-1', status: 'VERIFIED', source: 'MANUAL',
        createdAt: new Date(), updatedAt: new Date(),
      });
      expect(() => rc.updateDetails({ firstName: 'X' }))
        .toThrow('Cannot update raw contact in terminal status');
    });
  });

  describe('fromPersistence()', () => {
    it('should reconstitute without events', () => {
      const rc = RawContactEntity.fromPersistence({
        id: 'rc-1', firstName: 'Test', lastName: 'User',
        status: 'RAW', source: 'MANUAL', createdById: 'u-1',
        createdAt: new Date(), updatedAt: new Date(),
      });
      expect(rc.getDomainEvents()).toHaveLength(0);
    });
  });
});
