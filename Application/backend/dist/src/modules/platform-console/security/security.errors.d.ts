export declare const SECURITY_ERRORS: {
    readonly INCIDENT_NOT_FOUND: {
        readonly code: "E_SEC_001";
        readonly message: "Incident not found";
        readonly messageHi: "घटना नहीं मिली";
        readonly statusCode: 404;
    };
    readonly DR_PLAN_NOT_FOUND: {
        readonly code: "E_SEC_002";
        readonly message: "DR plan not found for service";
        readonly messageHi: "DR योजना नहीं मिली";
        readonly statusCode: 404;
    };
    readonly SNAPSHOT_FAILED: {
        readonly code: "E_SEC_003";
        readonly message: "Health snapshot capture failed";
        readonly messageHi: "स्वास्थ्य स्नैपशॉट विफल";
        readonly statusCode: 500;
    };
};
