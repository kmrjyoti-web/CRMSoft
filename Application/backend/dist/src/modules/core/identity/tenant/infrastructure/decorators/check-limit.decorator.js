"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckLimit = void 0;
const common_1 = require("@nestjs/common");
const plan_limit_guard_1 = require("../plan-limit.guard");
const CheckLimit = (resource) => (0, common_1.SetMetadata)(plan_limit_guard_1.CHECK_LIMIT_KEY, resource);
exports.CheckLimit = CheckLimit;
//# sourceMappingURL=check-limit.decorator.js.map