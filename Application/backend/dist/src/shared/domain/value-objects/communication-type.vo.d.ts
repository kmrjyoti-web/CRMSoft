export declare class CommunicationType {
    private readonly _value;
    private constructor();
    get value(): string;
    static readonly PHONE: CommunicationType;
    static readonly EMAIL: CommunicationType;
    static readonly MOBILE: CommunicationType;
    static readonly ADDRESS: CommunicationType;
    static readonly WHATSAPP: CommunicationType;
    private static readonly ALL;
    static fromString(s: string): CommunicationType;
    isPhone(): boolean;
    isEmail(): boolean;
    isAddress(): boolean;
    equals(other: CommunicationType): boolean;
    toString(): string;
}
