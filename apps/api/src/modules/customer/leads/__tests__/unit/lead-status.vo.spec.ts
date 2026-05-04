import { LeadStatus } from '../../domain/value-objects/lead-status.vo';

describe('LeadStatus Value Object', () => {
  describe('fromString()', () => {
    it('should create from valid string', () => {
      expect(LeadStatus.fromString('NEW').value).toBe('NEW');
      expect(LeadStatus.fromString('WON').value).toBe('WON');
    });

    it('should throw on invalid string', () => {
      expect(() => LeadStatus.fromString('INVALID')).toThrow('Invalid lead status');
    });
  });

  describe('canTransitionTo()', () => {
    it('NEW can go to VERIFIED', () => {
      expect(LeadStatus.NEW.canTransitionTo(LeadStatus.VERIFIED)).toBe(true);
    });

    it('NEW can go to LOST', () => {
      expect(LeadStatus.NEW.canTransitionTo(LeadStatus.LOST)).toBe(true);
    });

    it('NEW cannot go to WON', () => {
      expect(LeadStatus.NEW.canTransitionTo(LeadStatus.WON)).toBe(false);
    });

    it('NEW cannot go to ALLOCATED', () => {
      expect(LeadStatus.NEW.canTransitionTo(LeadStatus.ALLOCATED)).toBe(false);
    });

    it('VERIFIED can go to ALLOCATED', () => {
      expect(LeadStatus.VERIFIED.canTransitionTo(LeadStatus.ALLOCATED)).toBe(true);
    });

    it('QUOTATION_SENT can go to WON', () => {
      expect(LeadStatus.QUOTATION_SENT.canTransitionTo(LeadStatus.WON)).toBe(true);
    });

    it('WON cannot go anywhere (terminal)', () => {
      expect(LeadStatus.WON.canTransitionTo(LeadStatus.NEW)).toBe(false);
      expect(LeadStatus.WON.canTransitionTo(LeadStatus.LOST)).toBe(false);
    });

    it('LOST cannot go anywhere (terminal)', () => {
      expect(LeadStatus.LOST.canTransitionTo(LeadStatus.NEW)).toBe(false);
    });

    it('ON_HOLD can go back to IN_PROGRESS', () => {
      expect(LeadStatus.ON_HOLD.canTransitionTo(LeadStatus.IN_PROGRESS)).toBe(true);
    });
  });

  describe('validTransitions()', () => {
    it('should return all valid next statuses', () => {
      const transitions = LeadStatus.NEW.validTransitions();
      expect(transitions).toContain('VERIFIED');
      expect(transitions).toContain('LOST');
      expect(transitions).toHaveLength(2);
    });

    it('WON has no transitions', () => {
      expect(LeadStatus.WON.validTransitions()).toHaveLength(0);
    });
  });

  describe('isTerminal()', () => {
    it('WON is terminal', () => expect(LeadStatus.WON.isTerminal()).toBe(true));
    it('LOST is terminal', () => expect(LeadStatus.LOST.isTerminal()).toBe(true));
    it('NEW is not terminal', () => expect(LeadStatus.NEW.isTerminal()).toBe(false));
    it('ALLOCATED is not terminal', () => expect(LeadStatus.ALLOCATED.isTerminal()).toBe(false));
  });

  describe('isActive()', () => {
    it('NEW is active', () => expect(LeadStatus.NEW.isActive()).toBe(true));
    it('WON is not active', () => expect(LeadStatus.WON.isActive()).toBe(false));
  });

  describe('equals()', () => {
    it('same status equals', () => expect(LeadStatus.NEW.equals(LeadStatus.NEW)).toBe(true));
    it('different status not equals', () => expect(LeadStatus.NEW.equals(LeadStatus.WON)).toBe(false));
  });

  describe('toString()', () => {
    it('should return string value', () => expect(LeadStatus.NEW.toString()).toBe('NEW'));
    it('should return WON string', () => expect(LeadStatus.WON.toString()).toBe('WON'));
  });
});

