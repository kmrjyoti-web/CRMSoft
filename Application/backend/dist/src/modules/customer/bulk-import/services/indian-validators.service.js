"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndianValidatorsService = void 0;
const common_1 = require("@nestjs/common");
let IndianValidatorsService = class IndianValidatorsService {
    validate(value, type, params) {
        if (!value || !value.trim()) {
            if (type === 'REQUIRED')
                return { valid: false, error: 'Field is required' };
            return { valid: true, cleanedValue: '' };
        }
        const val = value.trim();
        switch (type) {
            case 'REQUIRED': return { valid: !!val, error: val ? undefined : 'Field is required' };
            case 'EMAIL': return this.validateEmail(val);
            case 'INDIAN_MOBILE': return this.validateIndianMobile(val);
            case 'PHONE': return this.validatePhone(val);
            case 'GST_NUMBER': return this.validateGST(val);
            case 'PAN_NUMBER': return this.validatePAN(val);
            case 'TAN_NUMBER': return this.validateTAN(val);
            case 'AADHAAR': return this.validateAadhaar(val);
            case 'IFSC_CODE': return this.validateIFSC(val);
            case 'PINCODE': return this.validatePincode(val);
            case 'WEBSITE':
            case 'URL': return this.validateURL(val);
            case 'NUMERIC': return this.validateNumeric(val);
            case 'DECIMAL': return this.validateDecimal(val);
            case 'DATE': return this.validateDate(val);
            case 'MIN_LENGTH': return this.validateMinLength(val, params?.min || 1);
            case 'MAX_LENGTH': return this.validateMaxLength(val, params?.max || 255);
            case 'CUSTOM_REGEX': return this.validateCustomRegex(val, params?.pattern);
            default: return { valid: true, cleanedValue: val };
        }
    }
    validateIndianMobile(val) {
        let cleaned = val.replace(/[\s\-\(\)\.]/g, '');
        if (cleaned.startsWith('+91'))
            cleaned = cleaned.slice(3);
        if (cleaned.startsWith('91') && cleaned.length === 12)
            cleaned = cleaned.slice(2);
        if (cleaned.startsWith('0'))
            cleaned = cleaned.slice(1);
        if (!/^[6-9]\d{9}$/.test(cleaned)) {
            return { valid: false, error: 'Invalid Indian mobile (must be 10 digits starting 6-9)' };
        }
        return { valid: true, cleanedValue: cleaned };
    }
    validatePhone(val) {
        const cleaned = val.replace(/[\s\-\(\)\.+]/g, '');
        if (!/^\d{8,15}$/.test(cleaned)) {
            return { valid: false, error: 'Invalid phone number (8-15 digits)' };
        }
        return { valid: true, cleanedValue: cleaned };
    }
    validateGST(val) {
        const cleaned = val.toUpperCase().replace(/\s/g, '');
        if (!/^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(cleaned)) {
            return { valid: false, error: 'Invalid GST format (e.g., 22AAAAA0000A1Z5)' };
        }
        const stateCode = parseInt(cleaned.slice(0, 2));
        if (stateCode < 1 || stateCode > 37) {
            return { valid: false, error: 'Invalid GST state code (01-37)' };
        }
        return { valid: true, cleanedValue: cleaned };
    }
    validatePAN(val) {
        const cleaned = val.toUpperCase().replace(/\s/g, '');
        if (!/^[A-Z]{3}[ABCFGHJTLP][A-Z]\d{4}[A-Z]$/.test(cleaned)) {
            return { valid: false, error: 'Invalid PAN format (e.g., ABCPD1234E)' };
        }
        return { valid: true, cleanedValue: cleaned };
    }
    validateTAN(val) {
        const cleaned = val.toUpperCase().replace(/\s/g, '');
        if (!/^[A-Z]{4}\d{5}[A-Z]$/.test(cleaned)) {
            return { valid: false, error: 'Invalid TAN format (e.g., ABCD01234E)' };
        }
        return { valid: true, cleanedValue: cleaned };
    }
    validateAadhaar(val) {
        const cleaned = val.replace(/[\s\-]/g, '');
        if (!/^[2-9]\d{11}$/.test(cleaned)) {
            return { valid: false, error: 'Invalid Aadhaar (12 digits, cannot start with 0 or 1)' };
        }
        return { valid: true, cleanedValue: cleaned };
    }
    validateIFSC(val) {
        const cleaned = val.toUpperCase().replace(/\s/g, '');
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleaned)) {
            return { valid: false, error: 'Invalid IFSC format (e.g., SBIN0001234)' };
        }
        return { valid: true, cleanedValue: cleaned };
    }
    validatePincode(val) {
        const cleaned = val.replace(/\s/g, '');
        if (!/^[1-9]\d{5}$/.test(cleaned)) {
            return { valid: false, error: 'Invalid pincode (6 digits, starts 1-9)' };
        }
        return { valid: true, cleanedValue: cleaned };
    }
    validateEmail(val) {
        const cleaned = val.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
            return { valid: false, error: 'Invalid email address' };
        }
        return { valid: true, cleanedValue: cleaned };
    }
    validateURL(val) {
        let cleaned = val.trim();
        if (!/^https?:\/\//i.test(cleaned))
            cleaned = 'https://' + cleaned;
        try {
            new URL(cleaned);
            return { valid: true, cleanedValue: cleaned };
        }
        catch {
            return { valid: false, error: 'Invalid URL' };
        }
    }
    validateNumeric(val) {
        if (!/^-?\d+$/.test(val))
            return { valid: false, error: 'Must be a number' };
        return { valid: true, cleanedValue: val };
    }
    validateDecimal(val) {
        if (!/^-?\d+(\.\d+)?$/.test(val))
            return { valid: false, error: 'Must be a decimal number' };
        return { valid: true, cleanedValue: val };
    }
    validateDate(val) {
        const d = new Date(val);
        if (isNaN(d.getTime()))
            return { valid: false, error: 'Invalid date format' };
        return { valid: true, cleanedValue: d.toISOString() };
    }
    validateMinLength(val, min) {
        if (val.length < min)
            return { valid: false, error: `Minimum length is ${min}` };
        return { valid: true, cleanedValue: val };
    }
    validateMaxLength(val, max) {
        if (val.length > max)
            return { valid: false, error: `Maximum length is ${max}` };
        return { valid: true, cleanedValue: val };
    }
    validateCustomRegex(val, pattern) {
        if (!pattern)
            return { valid: true, cleanedValue: val };
        try {
            if (!new RegExp(pattern).test(val)) {
                return { valid: false, error: `Does not match pattern: ${pattern}` };
            }
            return { valid: true, cleanedValue: val };
        }
        catch {
            return { valid: true, cleanedValue: val };
        }
    }
};
exports.IndianValidatorsService = IndianValidatorsService;
exports.IndianValidatorsService = IndianValidatorsService = __decorate([
    (0, common_1.Injectable)()
], IndianValidatorsService);
//# sourceMappingURL=indian-validators.service.js.map