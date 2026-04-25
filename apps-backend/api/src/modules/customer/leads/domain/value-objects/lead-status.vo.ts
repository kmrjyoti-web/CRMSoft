/**
 * Lead Status Value Object.
 * Encapsulates ALL valid status transitions.
 * This is the SINGLE source of truth for what transitions are allowed.
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  NEW:             ['VERIFIED', 'LOST'],
  VERIFIED:        ['ALLOCATED', 'LOST'],
  ALLOCATED:       ['IN_PROGRESS', 'LOST', 'ON_HOLD'],
  IN_PROGRESS:     ['DEMO_SCHEDULED', 'QUOTATION_SENT', 'LOST', 'ON_HOLD'],
  DEMO_SCHEDULED:  ['IN_PROGRESS', 'QUOTATION_SENT', 'LOST', 'ON_HOLD'],
  QUOTATION_SENT:  ['NEGOTIATION', 'WON', 'LOST', 'ON_HOLD'],
  NEGOTIATION:     ['WON', 'LOST', 'QUOTATION_SENT', 'ON_HOLD'],
  ON_HOLD:         ['IN_PROGRESS', 'ALLOCATED', 'LOST'],
  WON:             [],
  LOST:            [],
};

const ALL_STATUSES = Object.keys(VALID_TRANSITIONS);

export class LeadStatus {
  private constructor(private readonly _value: string) {}

  get value(): string { return this._value; }

  // Static instances
  static readonly NEW = new LeadStatus('NEW');
  static readonly VERIFIED = new LeadStatus('VERIFIED');
  static readonly ALLOCATED = new LeadStatus('ALLOCATED');
  static readonly IN_PROGRESS = new LeadStatus('IN_PROGRESS');
  static readonly DEMO_SCHEDULED = new LeadStatus('DEMO_SCHEDULED');
  static readonly QUOTATION_SENT = new LeadStatus('QUOTATION_SENT');
  static readonly NEGOTIATION = new LeadStatus('NEGOTIATION');
  static readonly WON = new LeadStatus('WON');
  static readonly LOST = new LeadStatus('LOST');
  static readonly ON_HOLD = new LeadStatus('ON_HOLD');

  /**
   * Create from string. Throws if invalid.
   */
  static fromString(s: string): LeadStatus {
    if (!ALL_STATUSES.includes(s)) {
      throw new Error(`Invalid lead status: ${s}. Valid: ${ALL_STATUSES.join(', ')}`);
    }
    return new LeadStatus(s);
  }

  /**
   * Check if transition to target status is allowed.
   */
  canTransitionTo(target: LeadStatus): boolean {
    return VALID_TRANSITIONS[this._value]?.includes(target.value) ?? false;
  }

  /**
   * Get all valid next statuses from current status.
   */
  validTransitions(): string[] {
    return VALID_TRANSITIONS[this._value] || [];
  }

  isTerminal(): boolean { return ['WON', 'LOST'].includes(this._value); }
  isActive(): boolean { return !this.isTerminal(); }
  equals(other: LeadStatus): boolean { return this._value === other._value; }
  toString(): string { return this._value; }
}

