import { ValueObject } from '../value-object';
import { Result } from '../../result/result';
interface EmailProps {
    value: string;
}
export declare class Email extends ValueObject<EmailProps> {
    private static readonly PATTERN;
    private constructor();
    static create(value: string): Result<Email>;
    get value(): string;
    get domain(): string;
}
export {};
