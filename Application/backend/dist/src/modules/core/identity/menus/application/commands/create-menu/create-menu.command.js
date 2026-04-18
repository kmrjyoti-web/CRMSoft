"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMenuCommand = void 0;
class CreateMenuCommand {
    constructor(name, code, icon, route, parentId, sortOrder, menuType, permissionModule, permissionAction, badgeColor, badgeText, openInNewTab) {
        this.name = name;
        this.code = code;
        this.icon = icon;
        this.route = route;
        this.parentId = parentId;
        this.sortOrder = sortOrder;
        this.menuType = menuType;
        this.permissionModule = permissionModule;
        this.permissionAction = permissionAction;
        this.badgeColor = badgeColor;
        this.badgeText = badgeText;
        this.openInNewTab = openInNewTab;
    }
}
exports.CreateMenuCommand = CreateMenuCommand;
//# sourceMappingURL=create-menu.command.js.map