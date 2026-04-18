"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTemplateCommand = void 0;
class CreateTemplateCommand {
    constructor(name, category, subject, bodyHtml, isShared, userId, userName, bodyText, variables, description) {
        this.name = name;
        this.category = category;
        this.subject = subject;
        this.bodyHtml = bodyHtml;
        this.isShared = isShared;
        this.userId = userId;
        this.userName = userName;
        this.bodyText = bodyText;
        this.variables = variables;
        this.description = description;
    }
}
exports.CreateTemplateCommand = CreateTemplateCommand;
//# sourceMappingURL=create-template.command.js.map