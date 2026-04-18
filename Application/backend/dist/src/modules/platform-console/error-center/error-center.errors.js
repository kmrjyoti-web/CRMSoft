"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CENTER_ERRORS = void 0;
exports.ERROR_CENTER_ERRORS = {
    REPORT_NOT_FOUND: {
        code: 'E_ERRCENTER_001',
        message: 'Error report not found',
        messageHi: 'त्रुटि रिपोर्ट नहीं मिली',
        statusCode: 404,
    },
    ALREADY_RESOLVED: {
        code: 'E_ERRCENTER_002',
        message: 'Error already resolved',
        messageHi: 'त्रुटि पहले से हल',
        statusCode: 409,
    },
    CANNOT_ESCALATE: {
        code: 'E_ERRCENTER_003',
        message: 'Cannot escalate — already at highest level',
        messageHi: 'उच्चतम स्तर पर पहले से है',
        statusCode: 409,
    },
    BRAND_NOT_FOUND: {
        code: 'E_ERRCENTER_004',
        message: 'Brand not found',
        messageHi: 'ब्रांड नहीं मिला',
        statusCode: 404,
    },
    UNAUTHORIZED_BRAND: {
        code: 'E_ERRCENTER_005',
        message: 'Not authorized to view this brand errors',
        messageHi: 'इस ब्रांड की त्रुटियाँ देखने का अधिकार नहीं',
        statusCode: 403,
    },
    ALERT_RULE_EXISTS: {
        code: 'E_ERRCENTER_006',
        message: 'Alert rule with same condition exists',
        messageHi: 'समान शर्त वाला अलर्ट नियम मौजूद है',
        statusCode: 409,
    },
};
//# sourceMappingURL=error-center.errors.js.map