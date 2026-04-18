export declare const ERROR_CENTER_ERRORS: {
    readonly REPORT_NOT_FOUND: {
        readonly code: "E_ERRCENTER_001";
        readonly message: "Error report not found";
        readonly messageHi: "त्रुटि रिपोर्ट नहीं मिली";
        readonly statusCode: 404;
    };
    readonly ALREADY_RESOLVED: {
        readonly code: "E_ERRCENTER_002";
        readonly message: "Error already resolved";
        readonly messageHi: "त्रुटि पहले से हल";
        readonly statusCode: 409;
    };
    readonly CANNOT_ESCALATE: {
        readonly code: "E_ERRCENTER_003";
        readonly message: "Cannot escalate — already at highest level";
        readonly messageHi: "उच्चतम स्तर पर पहले से है";
        readonly statusCode: 409;
    };
    readonly BRAND_NOT_FOUND: {
        readonly code: "E_ERRCENTER_004";
        readonly message: "Brand not found";
        readonly messageHi: "ब्रांड नहीं मिला";
        readonly statusCode: 404;
    };
    readonly UNAUTHORIZED_BRAND: {
        readonly code: "E_ERRCENTER_005";
        readonly message: "Not authorized to view this brand errors";
        readonly messageHi: "इस ब्रांड की त्रुटियाँ देखने का अधिकार नहीं";
        readonly statusCode: 403;
    };
    readonly ALERT_RULE_EXISTS: {
        readonly code: "E_ERRCENTER_006";
        readonly message: "Alert rule with same condition exists";
        readonly messageHi: "समान शर्त वाला अलर्ट नियम मौजूद है";
        readonly statusCode: 409;
    };
};
