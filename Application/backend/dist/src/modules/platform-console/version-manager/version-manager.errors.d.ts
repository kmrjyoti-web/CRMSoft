export declare const VERSION_MANAGER_ERRORS: {
    readonly RELEASE_NOT_FOUND: {
        readonly code: "E_VERSION_001";
        readonly message: "Release not found";
        readonly messageHi: "रिलीज़ नहीं मिली";
        readonly statusCode: 404;
    };
    readonly INVALID_SEMVER: {
        readonly code: "E_VERSION_002";
        readonly message: "Invalid semantic version format";
        readonly messageHi: "अमान्य संस्करण प्रारूप";
        readonly statusCode: 400;
    };
    readonly DUPLICATE_VERSION: {
        readonly code: "E_VERSION_003";
        readonly message: "Version already exists for this vertical";
        readonly messageHi: "इस वर्टिकल के लिए संस्करण पहले से मौजूद";
        readonly statusCode: 409;
    };
    readonly CANNOT_PUBLISH: {
        readonly code: "E_VERSION_004";
        readonly message: "Only DRAFT or STAGING releases can be published";
        readonly messageHi: "केवल ड्राफ्ट या स्टेजिंग रिलीज़ प्रकाशित हो सकती है";
        readonly statusCode: 409;
    };
    readonly NO_PREVIOUS_VERSION: {
        readonly code: "E_VERSION_005";
        readonly message: "No previous version to rollback to";
        readonly messageHi: "रोलबैक के लिए कोई पिछला संस्करण नहीं";
        readonly statusCode: 404;
    };
    readonly ALREADY_RELEASED: {
        readonly code: "E_VERSION_006";
        readonly message: "Release already published";
        readonly messageHi: "रिलीज़ पहले से प्रकाशित";
        readonly statusCode: 409;
    };
};
