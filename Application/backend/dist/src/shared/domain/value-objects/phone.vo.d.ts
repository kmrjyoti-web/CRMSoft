export declare class Phone {
    private readonly _value;
    private constructor();
    static create(value: string): Phone;
    static createOptional(value?: string): Phone | undefined;
    get value(): string;
    equals(other: Phone): boolean;
}
