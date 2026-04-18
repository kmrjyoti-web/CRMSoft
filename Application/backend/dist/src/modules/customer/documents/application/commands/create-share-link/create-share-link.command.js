"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateShareLinkCommand = void 0;
class CreateShareLinkCommand {
    constructor(documentId, userId, access, password, expiresAt, maxViews) {
        this.documentId = documentId;
        this.userId = userId;
        this.access = access;
        this.password = password;
        this.expiresAt = expiresAt;
        this.maxViews = maxViews;
    }
}
exports.CreateShareLinkCommand = CreateShareLinkCommand;
//# sourceMappingURL=create-share-link.command.js.map