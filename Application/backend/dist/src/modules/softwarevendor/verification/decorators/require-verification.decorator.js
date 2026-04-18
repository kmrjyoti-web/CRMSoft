"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireVerification = exports.REQUIRE_VERIFICATION_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.REQUIRE_VERIFICATION_KEY = 'requireVerification';
const RequireVerification = (action) => (0, common_1.SetMetadata)(exports.REQUIRE_VERIFICATION_KEY, action);
exports.RequireVerification = RequireVerification;
//# sourceMappingURL=require-verification.decorator.js.map