"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectCloudCommand = void 0;
class ConnectCloudCommand {
    constructor(userId, provider, accessToken, refreshToken, tokenExpiry, accountEmail, accountName) {
        this.userId = userId;
        this.provider = provider;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenExpiry = tokenExpiry;
        this.accountEmail = accountEmail;
        this.accountName = accountName;
    }
}
exports.ConnectCloudCommand = ConnectCloudCommand;
//# sourceMappingURL=connect-cloud.command.js.map