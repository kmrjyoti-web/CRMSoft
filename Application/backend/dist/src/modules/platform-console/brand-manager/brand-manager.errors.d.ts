export declare const BRAND_MANAGER_ERRORS: {
    readonly BRAND_NOT_FOUND: {
        readonly code: "E_BRAND_001";
        readonly message: "Brand not found";
        readonly messageHi: "ब्रांड नहीं मिला";
        readonly statusCode: 404;
    };
    readonly MODULE_ALREADY_WHITELISTED: {
        readonly code: "E_BRAND_002";
        readonly message: "Module already whitelisted for this brand";
        readonly messageHi: "मॉड्यूल पहले से व्हाइटलिस्ट";
        readonly statusCode: 409;
    };
    readonly INVALID_MODULE_CODE: {
        readonly code: "E_BRAND_003";
        readonly message: "Module code not found in registry";
        readonly messageHi: "मॉड्यूल कोड रजिस्ट्री में नहीं";
        readonly statusCode: 404;
    };
    readonly INVALID_FEATURE_CODE: {
        readonly code: "E_BRAND_004";
        readonly message: "Invalid feature code";
        readonly messageHi: "अमान्य फीचर कोड";
        readonly statusCode: 400;
    };
    readonly TRIAL_EXPIRED: {
        readonly code: "E_BRAND_005";
        readonly message: "Module trial has expired";
        readonly messageHi: "मॉड्यूल ट्रायल समाप्त";
        readonly statusCode: 410;
    };
};
