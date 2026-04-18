import { ValueObject } from '../value-object';
import { Result } from '../../result/result';
interface MoneyProps {
    amountInPaisa: number;
    currency: string;
}
export declare class Money extends ValueObject<MoneyProps> {
    private constructor();
    static create(amount: number, currency?: string): Result<Money>;
    static fromPaisa(paisa: number, currency?: string): Result<Money>;
    static zero(currency?: string): Money;
    get amount(): number;
    get amountInPaisa(): number;
    get currency(): string;
    add(other: Money): Money;
    subtract(other: Money): Result<Money>;
    multiply(factor: number): Money;
    applyGST(ratePercent: number): {
        base: Money;
        gst: Money;
        total: Money;
    };
    formatINR(): string;
}
export {};
