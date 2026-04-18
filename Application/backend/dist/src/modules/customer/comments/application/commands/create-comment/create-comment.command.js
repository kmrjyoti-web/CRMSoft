"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCommentCommand = void 0;
class CreateCommentCommand {
    constructor(entityType, entityId, content, authorId, authorRoleLevel, tenantId, visibility, parentId, taskId, mentionedUserIds, attachments) {
        this.entityType = entityType;
        this.entityId = entityId;
        this.content = content;
        this.authorId = authorId;
        this.authorRoleLevel = authorRoleLevel;
        this.tenantId = tenantId;
        this.visibility = visibility;
        this.parentId = parentId;
        this.taskId = taskId;
        this.mentionedUserIds = mentionedUserIds;
        this.attachments = attachments;
    }
}
exports.CreateCommentCommand = CreateCommentCommand;
//# sourceMappingURL=create-comment.command.js.map