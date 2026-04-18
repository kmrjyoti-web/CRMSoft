export declare class Email {
    private readonly _value;
    private constructor();
    static create(value: string): Email;
    static createOptional(value?: string): Email | undefined;
    get value(): string;
    equals(other: Email): boolean;
    toString(): string;
}
