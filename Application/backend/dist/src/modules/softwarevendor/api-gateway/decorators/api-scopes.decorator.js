"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiScopes = exports.API_SCOPES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.API_SCOPES_KEY = 'api_scopes';
const ApiScopes = (...scopes) => (0, common_1.SetMetadata)(exports.API_SCOPES_KEY, scopes);
exports.ApiScopes = ApiScopes;
//# sourceMappingURL=api-scopes.decorator.js.map