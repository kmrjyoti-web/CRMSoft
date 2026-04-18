"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BRAND_MANAGER_ERRORS = void 0;
exports.BRAND_MANAGER_ERRORS = {
    BRAND_NOT_FOUND: { code: 'E_BRAND_001', message: 'Brand not found', messageHi: 'ब्रांड नहीं मिला', statusCode: 404 },
    MODULE_ALREADY_WHITELISTED: { code: 'E_BRAND_002', message: 'Module already whitelisted for this brand', messageHi: 'मॉड्यूल पहले से व्हाइटलिस्ट', statusCode: 409 },
    INVALID_MODULE_CODE: { code: 'E_BRAND_003', message: 'Module code not found in registry', messageHi: 'मॉड्यूल कोड रजिस्ट्री में नहीं', statusCode: 404 },
    INVALID_FEATURE_CODE: { code: 'E_BRAND_004', message: 'Invalid feature code', messageHi: 'अमान्य फीचर कोड', statusCode: 400 },
    TRIAL_EXPIRED: { code: 'E_BRAND_005', message: 'Module trial has expired', messageHi: 'मॉड्यूल ट्रायल समाप्त', statusCode: 410 },
};
//# sourceMappingURL=brand-manager.errors.js.map