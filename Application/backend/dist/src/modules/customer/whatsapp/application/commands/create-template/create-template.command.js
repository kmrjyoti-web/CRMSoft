"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTemplateCommand = void 0;
class CreateTemplateCommand {
    constructor(wabaId, name, language, category, headerType, headerContent, bodyText = '', footerText, buttons, variables, sampleValues) {
        this.wabaId = wabaId;
        this.name = name;
        this.language = language;
        this.category = category;
        this.headerType = headerType;
        this.headerContent = headerContent;
        this.bodyText = bodyText;
        this.footerText = footerText;
        this.buttons = buttons;
        this.variables = variables;
        this.sampleValues = sampleValues;
    }
}
exports.CreateTemplateCommand = CreateTemplateCommand;
//# sourceMappingURL=create-template.command.js.map