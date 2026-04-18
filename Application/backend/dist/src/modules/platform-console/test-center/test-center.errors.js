"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEST_CENTER_ERRORS = void 0;
exports.TEST_CENTER_ERRORS = {
    PLAN_NOT_FOUND: { code: 'E_TEST_001', message: 'Test plan not found', messageHi: 'टेस्ट प्लान नहीं मिला', statusCode: 404 },
    EXECUTION_NOT_FOUND: { code: 'E_TEST_002', message: 'Test execution not found', messageHi: 'टेस्ट निष्पादन नहीं मिला', statusCode: 404 },
    TEST_ALREADY_RUNNING: { code: 'E_TEST_003', message: 'Test suite already running', messageHi: 'टेस्ट सूट पहले से चल रहा है', statusCode: 409 },
    INVALID_MODULE: { code: 'E_TEST_004', message: 'Module not found in codebase', messageHi: 'मॉड्यूल कोडबेस में नहीं मिला', statusCode: 404 },
    SCHEDULE_NOT_FOUND: { code: 'E_TEST_005', message: 'Test schedule not found', messageHi: 'टेस्ट शेड्यूल नहीं मिला', statusCode: 404 },
    COVERAGE_FAILED: { code: 'E_TEST_006', message: 'Coverage report generation failed', messageHi: 'कवरेज रिपोर्ट विफल', statusCode: 500 },
};
//# sourceMappingURL=test-center.errors.js.map