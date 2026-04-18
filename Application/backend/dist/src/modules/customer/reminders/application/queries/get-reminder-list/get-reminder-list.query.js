"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReminderListQuery = void 0;
class GetReminderListQuery {
    constructor(page = 1, limit = 20, recipientId, channel, isSent) {
        this.page = page;
        this.limit = limit;
        this.recipientId = recipientId;
        this.channel = channel;
        this.isSent = isSent;
    }
}
exports.GetReminderListQuery = GetReminderListQuery;
//# sourceMappingURL=get-reminder-list.query.js.map