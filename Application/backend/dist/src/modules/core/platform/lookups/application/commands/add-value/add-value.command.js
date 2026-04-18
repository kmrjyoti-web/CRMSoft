"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddValueCommand = void 0;
class AddValueCommand {
    constructor(lookupId, value, label, icon, color, isDefault, parentId, configJson) {
        this.lookupId = lookupId;
        this.value = value;
        this.label = label;
        this.icon = icon;
        this.color = color;
        this.isDefault = isDefault;
        this.parentId = parentId;
        this.configJson = configJson;
    }
}
exports.AddValueCommand = AddValueCommand;
//# sourceMappingURL=add-value.command.js.map