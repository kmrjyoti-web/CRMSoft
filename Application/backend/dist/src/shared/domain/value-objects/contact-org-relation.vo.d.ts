export declare class ContactOrgRelation {
    private readonly _value;
    private constructor();
    get value(): string;
    static readonly PRIMARY_CONTACT: ContactOrgRelation;
    static readonly EMPLOYEE: ContactOrgRelation;
    static readonly CONSULTANT: ContactOrgRelation;
    static readonly PARTNER: ContactOrgRelation;
    static readonly VENDOR: ContactOrgRelation;
    static readonly DIRECTOR: ContactOrgRelation;
    static readonly FOUNDER: ContactOrgRelation;
    private static readonly ALL;
    static fromString(s: string): ContactOrgRelation;
    isPrimaryContact(): boolean;
    equals(other: ContactOrgRelation): boolean;
    toString(): string;
}
