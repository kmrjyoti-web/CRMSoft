"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTemplateCommand = void 0;
class UpdateTemplateCommand {
    constructor(id, name, category, subject, bodyHtml, bodyText, variables, description, isShared) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.subject = subject;
        this.bodyHtml = bodyHtml;
        this.bodyText = bodyText;
        this.variables = variables;
        this.description = description;
        this.isShared = isShared;
    }
}
exports.UpdateTemplateCommand = UpdateTemplateCommand;
//# sourceMappingURL=update-template.command.js.map