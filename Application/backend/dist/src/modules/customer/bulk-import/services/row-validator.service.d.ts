import { IndianValidatorsService } from './indian-validators.service';
export interface RowValidationResult {
    valid: boolean;
    errors: {
        field: string;
        message: string;
        value?: string;
    }[];
    warnings: {
        field: string;
        message: string;
        value?: string;
    }[];
    cleanedData: Record<string, any>;
}
export declare class RowValidatorService {
    private readonly validators;
    constructor(validators: IndianValidatorsService);
    validateRow(mappedData: Record<string, any>, validationRules: any[]): RowValidationResult;
    validateAllRows(rows: {
        rowNumber: number;
        mappedData: Record<string, any>;
    }[], validationRules: any[]): Map<number, RowValidationResult>;
    private getNestedValue;
    private setNestedValue;
}
