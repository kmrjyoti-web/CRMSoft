"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngagePostCommand = void 0;
class EngagePostCommand {
    constructor(postId, tenantId, userId, action, sharedTo, city, state, deviceType) {
        this.postId = postId;
        this.tenantId = tenantId;
        this.userId = userId;
        this.action = action;
        this.sharedTo = sharedTo;
        this.city = city;
        this.state = state;
        this.deviceType = deviceType;
    }
}
exports.EngagePostCommand = EngagePostCommand;
//# sourceMappingURL=engage-post.command.js.map