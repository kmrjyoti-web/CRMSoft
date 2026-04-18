"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminRoute = exports.IS_SUPER_ADMIN_ROUTE = void 0;
const common_1 = require("@nestjs/common");
exports.IS_SUPER_ADMIN_ROUTE = 'isSuperAdminRoute';
const SuperAdminRoute = () => (0, common_1.SetMetadata)(exports.IS_SUPER_ADMIN_ROUTE, true);
exports.SuperAdminRoute = SuperAdminRoute;
//# sourceMappingURL=super-admin-route.decorator.js.map