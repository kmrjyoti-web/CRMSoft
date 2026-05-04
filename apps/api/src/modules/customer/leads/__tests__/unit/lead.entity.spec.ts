import { LeadEntity } from '../../domain/entities/lead.entity';

describe('LeadEntity', () => {
  const props = {
    leadNumber: 'L-2026-00001',
    contactId: 'contact-1',
    priority: 'HIGH',
    expectedValue: 50000,
    createdById: 'user-1',
  };

  describe('create()', () => {
    it('should create lead with NEW status', () => {
      const lead = LeadEntity.create('lead-1', props);
      expect(lead.id).toBe('lead-1');
      expect(lead.status.value).toBe('NEW');
      expect(lead.leadNumber).toBe('L-2026-00001');
      expect(lead.contactId).toBe('contact-1');
      expect(lead.priority).toBe('HIGH');
      expect(lead.expectedValue).toBe(50000);
    });

    it('should default priority to MEDIUM', () => {
      const lead = LeadEntity.create('lead-1', { ...props, priority: undefined as any });
      expect(lead.priority).toBe('MEDIUM');
    });

    it('should emit LeadCreatedEvent', () => {
      const lead = LeadEntity.create('lead-1', props);
      const events = lead.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('LeadCreated');
    });
  });

  describe('allocate()', () => {
    it('should allocate from NEW status', () => {
      const lead = LeadEntity.create('lead-1', props);
      lead.allocate('sales-1');
      expect(lead.allocatedToId).toBe('sales-1');
      expect(lead.status.value).toBe('ALLOCATED');
      expect(lead.allocatedAt).toBeDefined();
    });

    it('should allocate from VERIFIED status', () => {
      const lead = LeadEntity.fromPersistence({ ...props, id: 'lead-1', status: 'VERIFIED', createdAt: new Date(), updatedAt: new Date() });
      lead.allocate('sales-1');
      expect(lead.status.value).toBe('ALLOCATED');
    });

    it('should throw when allocating from IN_PROGRESS', () => {
      const lead = LeadEntity.fromPersistence({ ...props, id: 'lead-1', status: 'IN_PROGRESS', createdAt: new Date(), updatedAt: new Date() });
      expect(() => lead.allocate('sales-1')).toThrow('Cannot allocate lead in status IN_PROGRESS');
    });

    it('should throw when allocating from WON', () => {
      const lead = LeadEntity.fromPersistence({ ...props, id: 'lead-1', status: 'WON', createdAt: new Date(), updatedAt: new Date() });
      expect(() => lead.allocate('sales-1')).toThrow('Cannot allocate');
    });

    it('should throw without userId', () => {
      const lead = LeadEntity.create('lead-1', props);
      expect(() => lead.allocate('')).toThrow('User ID is required');
    });

    it('should emit LeadAllocatedEvent', () => {
      const lead = LeadEntity.create('lead-1', props);
      lead.clearDomainEvents(); // clear creation event
      lead.allocate('sales-1');
      const events = lead.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('LeadAllocated');
    });
  });

  describe('changeStatus()', () => {
    it('should allow NEW -> VERIFIED', () => {
      const lead = LeadEntity.create('lead-1', props);
      lead.changeStatus('VERIFIED');
      expect(lead.status.value).toBe('VERIFIED');
    });

    it('should allow ALLOCATED -> IN_PROGRESS', () => {
      const lead = LeadEntity.fromPersistence({ ...props, id: 'lead-1', status: 'ALLOCATED', createdAt: new Date(), updatedAt: new Date() });
      lead.changeStatus('IN_PROGRESS');
      expect(lead.status.value).toBe('IN_PROGRESS');
    });

    it('should reject NEW -> WON (invalid transition)', () => {
      const lead = LeadEntity.create('lead-1', props);
      expect(() => lead.changeStatus('WON')).toThrow('Invalid transition');
    });

    it('should reject NEW -> ALLOCATED (must use allocate())', () => {
      const lead = LeadEntity.create('lead-1', props);
      expect(() => lead.changeStatus('ALLOCATED')).toThrow('Invalid transition');
    });

    it('should reject transition from WON (terminal)', () => {
      const lead = LeadEntity.fromPersistence({ ...props, id: 'lead-1', status: 'WON', createdAt: new Date(), updatedAt: new Date() });
      expect(() => lead.changeStatus('IN_PROGRESS')).toThrow('Invalid transition');
    });

    it('should reject LOST without reason', () => {
      const lead = LeadEntity.create('lead-1', props);
      expect(() => lead.changeStatus('LOST')).toThrow('Lost reason is required');
    });

    it('should accept LOST with reason', () => {
      const lead = LeadEntity.create('lead-1', props);
      lead.changeStatus('LOST', 'Budget issue');
      expect(lead.status.value).toBe('LOST');
      expect(lead.lostReason).toBe('Budget issue');
    });

    it('should throw on invalid status string', () => {
      const lead = LeadEntity.create('lead-1', props);
      expect(() => lead.changeStatus('INVALID_STATUS')).toThrow('Invalid lead status');
    });

    it('should emit LeadStatusChangedEvent', () => {
      const lead = LeadEntity.create('lead-1', props);
      lead.clearDomainEvents();
      lead.changeStatus('VERIFIED');
      const events = lead.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('LeadStatusChanged');
    });
  });

  describe('updateDetails()', () => {
    it('should update priority', () => {
      const lead = LeadEntity.create('lead-1', props);
      lead.updateDetails({ priority: 'URGENT' });
      expect(lead.priority).toBe('URGENT');
    });

    it('should update expectedValue', () => {
      const lead = LeadEntity.create('lead-1', props);
      lead.updateDetails({ expectedValue: 100000 });
      expect(lead.expectedValue).toBe(100000);
    });

    it('should throw on terminal status', () => {
      const lead = LeadEntity.fromPersistence({ ...props, id: 'lead-1', status: 'WON', createdAt: new Date(), updatedAt: new Date() });
      expect(() => lead.updateDetails({ priority: 'LOW' })).toThrow('Cannot update lead in terminal status');
    });
  });

  describe('fromPersistence()', () => {
    it('should reconstitute without events', () => {
      const now = new Date();
      const lead = LeadEntity.fromPersistence({
        id: 'lead-1', leadNumber: 'L-2026-00001', contactId: 'c-1',
        status: 'ALLOCATED', priority: 'HIGH', allocatedToId: 'user-1',
        allocatedAt: now, createdById: 'user-2',
        organizationId: 'org-1', expectedCloseDate: now,
        lostReason: undefined, notes: 'test note',
        createdAt: now, updatedAt: now,
      });
      expect(lead.getDomainEvents()).toHaveLength(0);
      expect(lead.status.value).toBe('ALLOCATED');
      expect(lead.allocatedToId).toBe('user-1');
      expect(lead.organizationId).toBe('org-1');
      expect(lead.expectedCloseDate).toBe(now);
      expect(lead.allocatedAt).toBe(now);
      expect(lead.lostReason).toBeUndefined();
      expect(lead.notes).toBe('test note');
    });
  });
});

