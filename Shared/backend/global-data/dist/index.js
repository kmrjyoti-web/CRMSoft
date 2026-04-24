"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GST_RATES = exports.PAGINATION_DEFAULTS = exports.Status = exports.EntityType = exports.UserRole = exports.INDIAN_STATES = void 0;
exports.formatINR = formatINR;
var indian_states_1 = require("./indian-states");
Object.defineProperty(exports, "INDIAN_STATES", { enumerable: true, get: function () { return indian_states_1.INDIAN_STATES; } });
var enums_1 = require("./enums");
Object.defineProperty(exports, "UserRole", { enumerable: true, get: function () { return enums_1.UserRole; } });
Object.defineProperty(exports, "EntityType", { enumerable: true, get: function () { return enums_1.EntityType; } });
Object.defineProperty(exports, "Status", { enumerable: true, get: function () { return enums_1.Status; } });
/** Standard Indian currency formatter */
function formatINR(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(amount);
}
/** Standard pagination defaults */
exports.PAGINATION_DEFAULTS = {
    page: 1,
    limit: 20,
    maxLimit: 100,
};
/** GST rates */
exports.GST_RATES = {
    NONE: 0,
    REDUCED: 5,
    STANDARD: 12,
    DEFAULT: 18,
    LUXURY: 28,
};
//# sourceMappingURL=index.js.map