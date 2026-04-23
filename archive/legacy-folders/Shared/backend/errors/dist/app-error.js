"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const error_codes_1 = require("./error-codes");
/**
 * Custom application error.
 * Every module throws this instead of raw HttpException.
 *
 * Usage:
 *   throw AppError.from('LEAD_NOT_FOUND');
 *   throw AppError.from('PLAN_LIMIT_REACHED', { current: 500, limit: 500 });
 *   throw AppError.from('VALIDATION_ERROR').withDetails(fieldErrors);
 */
class AppError extends Error {
    constructor(definition, interpolations, details) {
        const message = AppError.interpolate(definition.message, interpolations);
        const suggestion = AppError.interpolate(definition.suggestion, interpolations);
        super(message);
        this.code = definition.code;
        this.httpStatus = definition.httpStatus;
        this.suggestion = suggestion;
        this.details = details ?? null;
        this.interpolated = interpolations || {};
    }
    /** Create error from code. */
    static from(code, interpolations) {
        const def = error_codes_1.ERROR_CODES[code];
        if (!def) {
            return new AppError(error_codes_1.ERROR_CODES.INTERNAL_ERROR, { originalCode: code });
        }
        return new AppError(def, interpolations);
    }
    /** Add details (field errors, extra context). */
    withDetails(details) {
        return new AppError({
            code: this.code,
            httpStatus: this.httpStatus,
            message: this.message,
            suggestion: this.suggestion,
        }, this.interpolated, details);
    }
    /** Replace {placeholders} in template string. */
    static interpolate(template, values) {
        if (!values)
            return template;
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            return values[key] !== undefined ? String(values[key]) : match;
        });
    }
}
exports.AppError = AppError;
//# sourceMappingURL=app-error.js.map