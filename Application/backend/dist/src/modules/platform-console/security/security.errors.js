"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECURITY_ERRORS = void 0;
exports.SECURITY_ERRORS = {
    INCIDENT_NOT_FOUND: { code: 'E_SEC_001', message: 'Incident not found', messageHi: 'घटना नहीं मिली', statusCode: 404 },
    DR_PLAN_NOT_FOUND: { code: 'E_SEC_002', message: 'DR plan not found for service', messageHi: 'DR योजना नहीं मिली', statusCode: 404 },
    SNAPSHOT_FAILED: { code: 'E_SEC_003', message: 'Health snapshot capture failed', messageHi: 'स्वास्थ्य स्नैपशॉट विफल', statusCode: 500 },
};
//# sourceMappingURL=security.errors.js.map