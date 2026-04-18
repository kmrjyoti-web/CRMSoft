"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendQuotationCommand = void 0;
class SendQuotationCommand {
    constructor(id, userId, userName, channel, receiverContactId, receiverEmail, receiverPhone, message) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.channel = channel;
        this.receiverContactId = receiverContactId;
        this.receiverEmail = receiverEmail;
        this.receiverPhone = receiverPhone;
        this.message = message;
    }
}
exports.SendQuotationCommand = SendQuotationCommand;
//# sourceMappingURL=send-quotation.command.js.map