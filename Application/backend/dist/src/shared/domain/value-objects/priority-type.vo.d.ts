export declare class PriorityType {
    private readonly _value;
    private constructor();
    get value(): string;
    static readonly PRIMARY: PriorityType;
    static readonly WORK: PriorityType;
    static readonly HOME: PriorityType;
    static readonly PERSONAL: PriorityType;
    static readonly OTHER: PriorityType;
    private static readonly ALL;
    static fromString(s: string): PriorityType;
    isPrimary(): boolean;
    equals(other: PriorityType): boolean;
    toString(): string;
}
