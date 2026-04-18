"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishVersionCommand = void 0;
class PublishVersionCommand {
    constructor(versionId, publishedBy, gitTag, gitCommitHash) {
        this.versionId = versionId;
        this.publishedBy = publishedBy;
        this.gitTag = gitTag;
        this.gitCommitHash = gitCommitHash;
    }
}
exports.PublishVersionCommand = PublishVersionCommand;
//# sourceMappingURL=publish-version.command.js.map