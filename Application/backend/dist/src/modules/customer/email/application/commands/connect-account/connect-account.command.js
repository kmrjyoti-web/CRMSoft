"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectAccountCommand = void 0;
class ConnectAccountCommand {
    constructor(provider, userId, emailAddress, displayName, label, accessToken, refreshToken, tokenExpiresAt, imapHost, imapPort, imapSecure, smtpHost, smtpPort, smtpSecure, smtpUsername, smtpPassword) {
        this.provider = provider;
        this.userId = userId;
        this.emailAddress = emailAddress;
        this.displayName = displayName;
        this.label = label;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenExpiresAt = tokenExpiresAt;
        this.imapHost = imapHost;
        this.imapPort = imapPort;
        this.imapSecure = imapSecure;
        this.smtpHost = smtpHost;
        this.smtpPort = smtpPort;
        this.smtpSecure = smtpSecure;
        this.smtpUsername = smtpUsername;
        this.smtpPassword = smtpPassword;
    }
}
exports.ConnectAccountCommand = ConnectAccountCommand;
//# sourceMappingURL=connect-account.command.js.map