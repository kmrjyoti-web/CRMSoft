"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTypes = void 0;
const common_1 = require("@nestjs/common");
const user_type_guard_1 = require("../guards/user-type.guard");
const UserTypes = (...types) => (0, common_1.SetMetadata)(user_type_guard_1.USER_TYPES_KEY, types);
exports.UserTypes = UserTypes;
//# sourceMappingURL=user-type.decorator.js.map