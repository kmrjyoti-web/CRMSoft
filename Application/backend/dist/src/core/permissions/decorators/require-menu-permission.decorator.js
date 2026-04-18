"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullAccess = exports.CanAssign = exports.CanApprove = exports.CanImport = exports.CanExport = exports.CanDelete = exports.CanEdit = exports.CanCreate = exports.CanView = exports.MENU_PERMISSION_KEY = void 0;
exports.RequireMenuPermission = RequireMenuPermission;
const common_1 = require("@nestjs/common");
exports.MENU_PERMISSION_KEY = 'menuPermission';
function RequireMenuPermission(menuCode, action, requireAll = true) {
    const meta = {
        menuCode,
        action: Array.isArray(action) ? action[0] : action,
        actions: Array.isArray(action) ? action : undefined,
        requireAll,
    };
    return (0, common_1.SetMetadata)(exports.MENU_PERMISSION_KEY, meta);
}
const CanView = (menuCode) => RequireMenuPermission(menuCode, 'view');
exports.CanView = CanView;
const CanCreate = (menuCode) => RequireMenuPermission(menuCode, 'create');
exports.CanCreate = CanCreate;
const CanEdit = (menuCode) => RequireMenuPermission(menuCode, 'edit');
exports.CanEdit = CanEdit;
const CanDelete = (menuCode) => RequireMenuPermission(menuCode, 'delete');
exports.CanDelete = CanDelete;
const CanExport = (menuCode) => RequireMenuPermission(menuCode, 'export');
exports.CanExport = CanExport;
const CanImport = (menuCode) => RequireMenuPermission(menuCode, 'import');
exports.CanImport = CanImport;
const CanApprove = (menuCode) => RequireMenuPermission(menuCode, 'approve');
exports.CanApprove = CanApprove;
const CanAssign = (menuCode) => RequireMenuPermission(menuCode, 'assign');
exports.CanAssign = CanAssign;
const FullAccess = (menuCode) => RequireMenuPermission(menuCode, ['view', 'create', 'edit', 'delete']);
exports.FullAccess = FullAccess;
//# sourceMappingURL=require-menu-permission.decorator.js.map