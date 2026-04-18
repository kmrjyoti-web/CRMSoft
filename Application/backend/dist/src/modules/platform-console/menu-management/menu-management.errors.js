"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MENU_MANAGEMENT_ERRORS = void 0;
exports.MENU_MANAGEMENT_ERRORS = {
    MENU_NOT_FOUND: { code: 'E_MENU_001', message: 'Menu item not found', messageHi: 'मेनू आइटम नहीं मिला', statusCode: 404 },
    DUPLICATE_KEY: { code: 'E_MENU_002', message: 'Menu key already exists', messageHi: 'मेनू की पहले से मौजूद', statusCode: 409 },
    PARENT_NOT_FOUND: { code: 'E_MENU_003', message: 'Parent menu not found', messageHi: 'पैरेंट मेनू नहीं मिला', statusCode: 404 },
    CIRCULAR_PARENT: { code: 'E_MENU_004', message: 'Cannot set parent to self or child', messageHi: 'स्वयं या चाइल्ड को पैरेंट नहीं बना सकते', statusCode: 400 },
    OVERRIDE_NOT_FOUND: { code: 'E_MENU_005', message: 'Brand override not found', messageHi: 'ब्रांड ओवरराइड नहीं मिला', statusCode: 404 },
};
//# sourceMappingURL=menu-management.errors.js.map