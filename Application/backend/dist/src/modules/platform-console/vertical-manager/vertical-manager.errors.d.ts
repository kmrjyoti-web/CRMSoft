export declare const VERTICAL_MANAGER_ERRORS: {
    readonly NOT_FOUND: {
        readonly code: "E_VERTICAL_001";
        readonly message: "Vertical not found";
        readonly messageHi: "वर्टिकल नहीं मिला";
        readonly statusCode: 404;
    };
    readonly DUPLICATE_CODE: {
        readonly code: "E_VERTICAL_002";
        readonly message: "Vertical code already registered";
        readonly messageHi: "वर्टिकल कोड पहले से पंजीकृत";
        readonly statusCode: 409;
    };
    readonly AUDIT_FAILED: {
        readonly code: "E_VERTICAL_003";
        readonly message: "Vertical audit failed to complete";
        readonly messageHi: "वर्टिकल ऑडिट पूर्ण नहीं हुआ";
        readonly statusCode: 500;
    };
    readonly FOLDER_NOT_FOUND: {
        readonly code: "E_VERTICAL_004";
        readonly message: "Vertical folder not found in codebase";
        readonly messageHi: "कोडबेस में वर्टिकल फोल्डर नहीं मिला";
        readonly statusCode: 404;
    };
    readonly CANNOT_DEPRECATE: {
        readonly code: "E_VERTICAL_005";
        readonly message: "Cannot deprecate — active tenants using this vertical";
        readonly messageHi: "सक्रिय टेनेंट इस वर्टिकल का उपयोग कर रहे हैं";
        readonly statusCode: 409;
    };
};
