"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireApproval = exports.APPROVAL_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.APPROVAL_KEY = 'approval';
const RequireApproval = (entityType, action) => (0, common_1.SetMetadata)(exports.APPROVAL_KEY, { entityType, action });
exports.RequireApproval = RequireApproval;
//# sourceMappingURL=require-approval.decorator.js.map