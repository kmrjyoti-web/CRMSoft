export declare class Money {
    private readonly _amount;
    private readonly _currency;
    private constructor();
    static create(amount: number, currency?: string): Money;
    static zero(currency?: string): Money;
    get amount(): number;
    get currency(): string;
    add(other: Money): Money;
    subtract(other: Money): Money;
    multiply(factor: number): Money;
    equals(other: Money): boolean;
    isZero(): boolean;
    isGreaterThan(other: Money): boolean;
}
