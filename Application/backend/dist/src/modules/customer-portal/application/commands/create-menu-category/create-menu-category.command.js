"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMenuCategoryCommand = void 0;
class CreateMenuCategoryCommand {
    constructor(tenantId, adminId, name, enabledRoutes, nameHi, description, icon, color, isDefault, sortOrder) {
        this.tenantId = tenantId;
        this.adminId = adminId;
        this.name = name;
        this.enabledRoutes = enabledRoutes;
        this.nameHi = nameHi;
        this.description = description;
        this.icon = icon;
        this.color = color;
        this.isDefault = isDefault;
        this.sortOrder = sortOrder;
    }
}
exports.CreateMenuCategoryCommand = CreateMenuCategoryCommand;
//# sourceMappingURL=create-menu-category.command.js.map