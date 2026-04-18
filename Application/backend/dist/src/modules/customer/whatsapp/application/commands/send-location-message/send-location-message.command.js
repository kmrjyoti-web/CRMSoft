"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendLocationMessageCommand = void 0;
class SendLocationMessageCommand {
    constructor(wabaId, conversationId, lat, lng, name, address, userId) {
        this.wabaId = wabaId;
        this.conversationId = conversationId;
        this.lat = lat;
        this.lng = lng;
        this.name = name;
        this.address = address;
        this.userId = userId;
    }
}
exports.SendLocationMessageCommand = SendLocationMessageCommand;
//# sourceMappingURL=send-location-message.command.js.map