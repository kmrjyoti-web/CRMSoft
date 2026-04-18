export declare const TEST_CENTER_ERRORS: {
    readonly PLAN_NOT_FOUND: {
        readonly code: "E_TEST_001";
        readonly message: "Test plan not found";
        readonly messageHi: "टेस्ट प्लान नहीं मिला";
        readonly statusCode: 404;
    };
    readonly EXECUTION_NOT_FOUND: {
        readonly code: "E_TEST_002";
        readonly message: "Test execution not found";
        readonly messageHi: "टेस्ट निष्पादन नहीं मिला";
        readonly statusCode: 404;
    };
    readonly TEST_ALREADY_RUNNING: {
        readonly code: "E_TEST_003";
        readonly message: "Test suite already running";
        readonly messageHi: "टेस्ट सूट पहले से चल रहा है";
        readonly statusCode: 409;
    };
    readonly INVALID_MODULE: {
        readonly code: "E_TEST_004";
        readonly message: "Module not found in codebase";
        readonly messageHi: "मॉड्यूल कोडबेस में नहीं मिला";
        readonly statusCode: 404;
    };
    readonly SCHEDULE_NOT_FOUND: {
        readonly code: "E_TEST_005";
        readonly message: "Test schedule not found";
        readonly messageHi: "टेस्ट शेड्यूल नहीं मिला";
        readonly statusCode: 404;
    };
    readonly COVERAGE_FAILED: {
        readonly code: "E_TEST_006";
        readonly message: "Coverage report generation failed";
        readonly messageHi: "कवरेज रिपोर्ट विफल";
        readonly statusCode: 500;
    };
};
