"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendTemplateMessageCommand = void 0;
class SendTemplateMessageCommand {
    constructor(wabaId, conversationId, templateId, variables, userId) {
        this.wabaId = wabaId;
        this.conversationId = conversationId;
        this.templateId = templateId;
        this.variables = variables;
        this.userId = userId;
    }
}
exports.SendTemplateMessageCommand = SendTemplateMessageCommand;
//# sourceMappingURL=send-template-message.command.js.map