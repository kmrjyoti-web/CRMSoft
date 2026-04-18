export declare class LeadStatus {
    private readonly _value;
    private constructor();
    get value(): string;
    static readonly NEW: LeadStatus;
    static readonly VERIFIED: LeadStatus;
    static readonly ALLOCATED: LeadStatus;
    static readonly IN_PROGRESS: LeadStatus;
    static readonly DEMO_SCHEDULED: LeadStatus;
    static readonly QUOTATION_SENT: LeadStatus;
    static readonly NEGOTIATION: LeadStatus;
    static readonly WON: LeadStatus;
    static readonly LOST: LeadStatus;
    static readonly ON_HOLD: LeadStatus;
    static fromString(s: string): LeadStatus;
    canTransitionTo(target: LeadStatus): boolean;
    validTransitions(): string[];
    isTerminal(): boolean;
    isActive(): boolean;
    equals(other: LeadStatus): boolean;
    toString(): string;
}
