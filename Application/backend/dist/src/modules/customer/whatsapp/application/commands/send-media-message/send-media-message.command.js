"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendMediaMessageCommand = void 0;
class SendMediaMessageCommand {
    constructor(wabaId, conversationId, type, mediaUrl, caption, userId) {
        this.wabaId = wabaId;
        this.conversationId = conversationId;
        this.type = type;
        this.mediaUrl = mediaUrl;
        this.caption = caption;
        this.userId = userId;
    }
}
exports.SendMediaMessageCommand = SendMediaMessageCommand;
//# sourceMappingURL=send-media-message.command.js.map