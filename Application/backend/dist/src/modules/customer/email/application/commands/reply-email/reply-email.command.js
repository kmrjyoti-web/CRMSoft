"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyEmailCommand = void 0;
class ReplyEmailCommand {
    constructor(originalEmailId, userId, replyType, bodyHtml, to, bodyText) {
        this.originalEmailId = originalEmailId;
        this.userId = userId;
        this.replyType = replyType;
        this.bodyHtml = bodyHtml;
        this.to = to;
        this.bodyText = bodyText;
    }
}
exports.ReplyEmailCommand = ReplyEmailCommand;
//# sourceMappingURL=reply-email.command.js.map