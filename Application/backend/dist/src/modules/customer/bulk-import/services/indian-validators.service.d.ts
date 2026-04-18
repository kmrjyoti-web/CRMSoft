export interface ValidationResult {
    valid: boolean;
    cleanedValue?: string;
    error?: string;
}
export declare class IndianValidatorsService {
    validate(value: string | null | undefined, type: string, params?: any): ValidationResult;
    validateIndianMobile(val: string): ValidationResult;
    validatePhone(val: string): ValidationResult;
    validateGST(val: string): ValidationResult;
    validatePAN(val: string): ValidationResult;
    validateTAN(val: string): ValidationResult;
    validateAadhaar(val: string): ValidationResult;
    validateIFSC(val: string): ValidationResult;
    validatePincode(val: string): ValidationResult;
    validateEmail(val: string): ValidationResult;
    validateURL(val: string): ValidationResult;
    private validateNumeric;
    private validateDecimal;
    private validateDate;
    private validateMinLength;
    private validateMaxLength;
    private validateCustomRegex;
}
