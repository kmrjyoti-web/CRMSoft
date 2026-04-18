import { ValueObject } from '../value-object';
import { Result } from '../../result/result';
interface PhoneProps {
    value: string;
}
export declare class IndianPhone extends ValueObject<PhoneProps> {
    private static readonly PATTERN;
    private constructor();
    static create(value: string): Result<IndianPhone>;
    get value(): string;
    get formatted(): string;
    get withCountryCode(): string;
}
export {};
