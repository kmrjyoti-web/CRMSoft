import { Injectable } from '@nestjs/common';

@Injectable()
export class AuditSanitizerService {
  private readonly REDACTED = '[REDACTED]';

  private readonly SENSITIVE_KEYS = [
    'password', 'passwordhash', 'token', 'refreshtoken', 'apikey',
    'secret', 'accesstoken', 'authorization', 'cookie',
    'aadhaar', 'pan', 'ssn', 'bankaccount', 'creditcard',
  ];

  sanitize(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.sanitize(item));

    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (this.isSensitive(key)) {
        result[key] = this.REDACTED;
      } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
        result[key] = this.sanitize(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  sanitizeSnapshot(snapshot: any, entityType: string): Record<string, unknown> {
    if (!snapshot) return snapshot;
    const sanitized = this.sanitize(snapshot);
    if (entityType === 'USER') {
      delete sanitized.password;
      delete sanitized.refreshToken;
    }
    return sanitized;
  }

  isSensitive(fieldName: string): boolean {
    return this.SENSITIVE_KEYS.includes(fieldName.toLowerCase());
  }
}
