export declare const MENU_MANAGEMENT_ERRORS: {
    readonly MENU_NOT_FOUND: {
        readonly code: "E_MENU_001";
        readonly message: "Menu item not found";
        readonly messageHi: "मेनू आइटम नहीं मिला";
        readonly statusCode: 404;
    };
    readonly DUPLICATE_KEY: {
        readonly code: "E_MENU_002";
        readonly message: "Menu key already exists";
        readonly messageHi: "मेनू की पहले से मौजूद";
        readonly statusCode: 409;
    };
    readonly PARENT_NOT_FOUND: {
        readonly code: "E_MENU_003";
        readonly message: "Parent menu not found";
        readonly messageHi: "पैरेंट मेनू नहीं मिला";
        readonly statusCode: 404;
    };
    readonly CIRCULAR_PARENT: {
        readonly code: "E_MENU_004";
        readonly message: "Cannot set parent to self or child";
        readonly messageHi: "स्वयं या चाइल्ड को पैरेंट नहीं बना सकते";
        readonly statusCode: 400;
    };
    readonly OVERRIDE_NOT_FOUND: {
        readonly code: "E_MENU_005";
        readonly message: "Brand override not found";
        readonly messageHi: "ब्रांड ओवरराइड नहीं मिला";
        readonly statusCode: 404;
    };
};
