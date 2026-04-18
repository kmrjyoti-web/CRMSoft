"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireModule = void 0;
const common_1 = require("@nestjs/common");
const module_access_guard_1 = require("../module-access.guard");
const RequireModule = (moduleCode) => (0, common_1.SetMetadata)(module_access_guard_1.REQUIRE_MODULE_KEY, moduleCode);
exports.RequireModule = RequireModule;
//# sourceMappingURL=require-module.decorator.js.map