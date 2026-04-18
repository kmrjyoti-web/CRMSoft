export declare class RawContactStatus {
    private readonly _value;
    private constructor();
    get value(): string;
    static readonly RAW: RawContactStatus;
    static readonly VERIFIED: RawContactStatus;
    static readonly REJECTED: RawContactStatus;
    static readonly DUPLICATE: RawContactStatus;
    private static readonly ALL;
    private static readonly VALID_TRANSITIONS;
    static fromString(s: string): RawContactStatus;
    canTransitionTo(target: RawContactStatus): boolean;
    isTerminal(): boolean;
    isRaw(): boolean;
    isVerified(): boolean;
    equals(other: RawContactStatus): boolean;
    toString(): string;
}
