"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditSkip = exports.AUDIT_SKIP_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.AUDIT_SKIP_KEY = 'audit:skip';
const AuditSkip = () => (0, common_1.SetMetadata)(exports.AUDIT_SKIP_KEY, true);
exports.AuditSkip = AuditSkip;
//# sourceMappingURL=audit-skip.decorator.js.map