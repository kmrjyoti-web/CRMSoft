"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRateLimit = exports.API_RATE_LIMIT_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.API_RATE_LIMIT_KEY = 'api_rate_limit';
const ApiRateLimit = (limit, window) => (0, common_1.SetMetadata)(exports.API_RATE_LIMIT_KEY, { limit, window });
exports.ApiRateLimit = ApiRateLimit;
//# sourceMappingURL=api-rate-limit.decorator.js.map