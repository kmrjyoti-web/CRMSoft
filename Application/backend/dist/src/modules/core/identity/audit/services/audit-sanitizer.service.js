"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditSanitizerService = void 0;
const common_1 = require("@nestjs/common");
let AuditSanitizerService = class AuditSanitizerService {
    constructor() {
        this.REDACTED = '[REDACTED]';
        this.SENSITIVE_KEYS = [
            'password', 'passwordhash', 'token', 'refreshtoken', 'apikey',
            'secret', 'accesstoken', 'authorization', 'cookie',
            'aadhaar', 'pan', 'ssn', 'bankaccount', 'creditcard',
        ];
    }
    sanitize(obj) {
        if (obj === null || obj === undefined)
            return obj;
        if (typeof obj !== 'object')
            return obj;
        if (Array.isArray(obj))
            return obj.map(item => this.sanitize(item));
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            if (this.isSensitive(key)) {
                result[key] = this.REDACTED;
            }
            else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
                result[key] = this.sanitize(value);
            }
            else {
                result[key] = value;
            }
        }
        return result;
    }
    sanitizeSnapshot(snapshot, entityType) {
        if (!snapshot)
            return snapshot;
        const sanitized = this.sanitize(snapshot);
        if (entityType === 'USER') {
            delete sanitized.password;
            delete sanitized.refreshToken;
        }
        return sanitized;
    }
    isSensitive(fieldName) {
        return this.SENSITIVE_KEYS.includes(fieldName.toLowerCase());
    }
};
exports.AuditSanitizerService = AuditSanitizerService;
exports.AuditSanitizerService = AuditSanitizerService = __decorate([
    (0, common_1.Injectable)()
], AuditSanitizerService);
//# sourceMappingURL=audit-sanitizer.service.js.map