import { ValueObject } from '../value-object';
import { Result } from '../../result/result';
interface GSTINProps {
    value: string;
}
export declare class GSTIN extends ValueObject<GSTINProps> {
    private static readonly PATTERN;
    private constructor();
    static create(value: string): Result<GSTIN>;
    get value(): string;
    get stateCode(): string;
    get stateName(): string;
    get pan(): string;
    get entityNumber(): string;
}
export {};
