import { CommunicationEntity } from '../../domain/entities/communication.entity';

describe('CommunicationEntity', () => {
  describe('create()', () => {
    it('should create PHONE communication', () => {
      const c = CommunicationEntity.create('cm-1', {
        type: 'PHONE', value: '+91-9876543210', rawContactId: 'rc-1',
      });
      expect(c.type.value).toBe('PHONE');
      expect(c.value).toBe('+91-9876543210');
      expect(c.rawContactId).toBe('rc-1');
      expect(c.contactId).toBeUndefined();
    });

    it('should create EMAIL communication', () => {
      const c = CommunicationEntity.create('cm-1', {
        type: 'EMAIL', value: 'test@example.com', rawContactId: 'rc-1',
      });
      expect(c.type.value).toBe('EMAIL');
    });

    it('should default priorityType to PRIMARY', () => {
      const c = CommunicationEntity.create('cm-1', {
        type: 'PHONE', value: '+91-9876543210', rawContactId: 'rc-1',
      });
      expect(c.priorityType.value).toBe('PRIMARY');
    });

    it('should accept WORK priority', () => {
      const c = CommunicationEntity.create('cm-1', {
        type: 'PHONE', value: '+91-9876543210', rawContactId: 'rc-1',
        priorityType: 'WORK',
      });
      expect(c.priorityType.value).toBe('WORK');
    });

    it('should accept HOME priority', () => {
      const c = CommunicationEntity.create('cm-1', {
        type: 'PHONE', value: '+91-9876543210', rawContactId: 'rc-1',
        priorityType: 'HOME',
      });
      expect(c.priorityType.value).toBe('HOME');
    });

    it('should throw on invalid email', () => {
      expect(() => CommunicationEntity.create('cm-1', {
        type: 'EMAIL', value: 'bad-email', rawContactId: 'rc-1',
      })).toThrow('Invalid email');
    });

    it('should throw on invalid phone', () => {
      expect(() => CommunicationEntity.create('cm-1', {
        type: 'PHONE', value: '12', rawContactId: 'rc-1',
      })).toThrow('Invalid phone');
    });

    it('should throw on empty value', () => {
      expect(() => CommunicationEntity.create('cm-1', {
        type: 'ADDRESS', value: '', rawContactId: 'rc-1',
      })).toThrow('Communication value is required');
    });

    it('should throw without any entity link', () => {
      expect(() => CommunicationEntity.create('cm-1', {
        type: 'PHONE', value: '+91-9876543210',
      })).toThrow('At least one entity link is required');
    });

    it('should allow organization link only', () => {
      const c = CommunicationEntity.create('cm-1', {
        type: 'PHONE', value: '+91-9876543210', organizationId: 'org-1',
      });
      expect(c.organizationId).toBe('org-1');
      expect(c.rawContactId).toBeUndefined();
    });
  });

  describe('linkToContact()', () => {
    it('should set contactId', () => {
      const c = CommunicationEntity.create('cm-1', {
        type: 'PHONE', value: '+91-9876543210', rawContactId: 'rc-1',
      });
      c.linkToContact('contact-1');
      expect(c.contactId).toBe('contact-1');
    });

    it('should throw on empty contactId', () => {
      const c = CommunicationEntity.create('cm-1', {
        type: 'PHONE', value: '+91-9876543210', rawContactId: 'rc-1',
      });
      expect(() => c.linkToContact('')).toThrow('Contact ID is required');
    });
  });

  describe('linkToOrganization()', () => {
    it('should set organizationId', () => {
      const c = CommunicationEntity.create('cm-1', {
        type: 'PHONE', value: '+91-9876543210', rawContactId: 'rc-1',
      });
      c.linkToOrganization('org-1');
      expect(c.organizationId).toBe('org-1');
    });
  });

  describe('linkToLead()', () => {
    it('should set leadId', () => {
      const c = CommunicationEntity.create('cm-1', {
        type: 'PHONE', value: '+91-9876543210', contactId: 'c-1',
      });
      c.linkToLead('lead-1');
      expect(c.leadId).toBe('lead-1');
    });
  });

  describe('markVerified()', () => {
    it('should set isVerified to true', () => {
      const c = CommunicationEntity.create('cm-1', {
        type: 'EMAIL', value: 'test@example.com', rawContactId: 'rc-1',
      });
      expect(c.isVerified).toBe(false);
      c.markVerified();
      expect(c.isVerified).toBe(true);
    });
  });

  describe('changePriority()', () => {
    it('PRIMARY → WORK', () => {
      const c = CommunicationEntity.create('cm-1', {
        type: 'PHONE', value: '+91-9876543210', rawContactId: 'rc-1',
      });
      c.changePriority('WORK');
      expect(c.priorityType.value).toBe('WORK');
    });

    it('should throw on invalid priority', () => {
      const c = CommunicationEntity.create('cm-1', {
        type: 'PHONE', value: '+91-9876543210', rawContactId: 'rc-1',
      });
      expect(() => c.changePriority('INVALID')).toThrow('Invalid priority type');
    });
  });

  describe('setAsPrimary()', () => {
    it('should set isPrimary', () => {
      const c = CommunicationEntity.create('cm-1', {
        type: 'PHONE', value: '+91-9876543210', rawContactId: 'rc-1',
      });
      expect(c.isPrimary).toBe(false);
      c.setAsPrimary();
      expect(c.isPrimary).toBe(true);
    });
  });
});
