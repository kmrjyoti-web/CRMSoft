"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = void 0;
const error_codes_1 = require("../errors/error-codes");
const app_error_1 = require("../errors/app-error");
class Result {
    constructor(ok, value, error) {
        this._ok = ok;
        this._value = value;
        this._error = error;
    }
    static ok(value) {
        return new Result(true, value);
    }
    static fail(code, interpolations) {
        const def = error_codes_1.ERROR_CODES[code] || error_codes_1.ERROR_CODES.INTERNAL_ERROR;
        const message = Result.interpolate(def.message, interpolations);
        const suggestion = Result.interpolate(def.suggestion, interpolations);
        return new Result(false, undefined, {
            code: def.code,
            message,
            httpStatus: def.httpStatus,
            suggestion,
            interpolated: interpolations,
        });
    }
    static failWithDetails(code, details, interpolations) {
        const def = error_codes_1.ERROR_CODES[code] || error_codes_1.ERROR_CODES.INTERNAL_ERROR;
        const message = Result.interpolate(def.message, interpolations);
        const suggestion = Result.interpolate(def.suggestion, interpolations);
        return new Result(false, undefined, {
            code: def.code,
            message,
            httpStatus: def.httpStatus,
            suggestion,
            details,
            interpolated: interpolations,
        });
    }
    get isOk() {
        return this._ok;
    }
    get isFail() {
        return !this._ok;
    }
    get value() {
        if (!this._ok) {
            throw new Error('Cannot access value of a failed Result. Use unwrap() at the controller boundary.');
        }
        return this._value;
    }
    get error() {
        if (this._ok) {
            throw new Error('Cannot access error of a successful Result.');
        }
        return this._error;
    }
    unwrap() {
        if (this._ok) {
            return this._value;
        }
        const err = this._error;
        const appError = app_error_1.AppError.from(err.code, err.interpolated);
        if (err.details) {
            throw appError.withDetails(err.details);
        }
        throw appError;
    }
    unwrapOr(defaultValue) {
        return this._ok ? this._value : defaultValue;
    }
    map(fn) {
        if (this._ok) {
            return Result.ok(fn(this._value));
        }
        return new Result(false, undefined, this._error);
    }
    flatMap(fn) {
        if (this._ok) {
            return fn(this._value);
        }
        return new Result(false, undefined, this._error);
    }
    withDetails(details) {
        if (this._ok)
            return this;
        return new Result(false, undefined, {
            ...this._error,
            details,
        });
    }
    toErrorResponse() {
        if (this._ok)
            return null;
        const err = this._error;
        return {
            __isResultError: true,
            code: err.code,
            message: err.message,
            httpStatus: err.httpStatus,
            suggestion: err.suggestion,
            details: err.details,
        };
    }
    onOk(fn) {
        if (this._ok)
            fn(this._value);
        return this;
    }
    onFail(fn) {
        if (!this._ok)
            fn(this._error);
        return this;
    }
    static interpolate(template, values) {
        if (!values)
            return template;
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            return values[key] !== undefined ? String(values[key]) : match;
        });
    }
}
exports.Result = Result;
//# sourceMappingURL=result.js.map