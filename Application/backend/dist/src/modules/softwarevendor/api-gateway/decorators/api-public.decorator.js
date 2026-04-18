"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiPublic = exports.API_PUBLIC_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.API_PUBLIC_KEY = 'api_public';
const ApiPublic = () => (0, common_1.SetMetadata)(exports.API_PUBLIC_KEY, true);
exports.ApiPublic = ApiPublic;
//# sourceMappingURL=api-public.decorator.js.map