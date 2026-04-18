"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUDIT_META_KEY = void 0;
exports.Auditable = Auditable;
const common_1 = require("@nestjs/common");
exports.AUDIT_META_KEY = 'audit:meta';
function Auditable(meta) {
    return (0, common_1.SetMetadata)(exports.AUDIT_META_KEY, meta);
}
//# sourceMappingURL=auditable.decorator.js.map