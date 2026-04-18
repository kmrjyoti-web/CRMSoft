"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const error_codes_1 = require("./error-codes");
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
    static from(code, interpolations) {
        const def = error_codes_1.ERROR_CODES[code];
        if (!def) {
            return new AppError(error_codes_1.ERROR_CODES.INTERNAL_ERROR, { originalCode: code });
        }
        return new AppError(def, interpolations);
    }
    withDetails(details) {
        return new AppError({
            code: this.code,
            httpStatus: this.httpStatus,
            message: this.message,
            suggestion: this.suggestion,
        }, this.interpolated, details);
    }
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