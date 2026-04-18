"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterPushCommand = void 0;
class RegisterPushCommand {
    constructor(userId, endpoint, p256dh, auth, deviceType) {
        this.userId = userId;
        this.endpoint = endpoint;
        this.p256dh = p256dh;
        this.auth = auth;
        this.deviceType = deviceType;
    }
}
exports.RegisterPushCommand = RegisterPushCommand;
//# sourceMappingURL=register-push.command.js.map