"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCommentCommand = void 0;
class UpdateCommentCommand {
    constructor(commentId, userId, content, roleLevel = 5) {
        this.commentId = commentId;
        this.userId = userId;
        this.content = content;
        this.roleLevel = roleLevel;
    }
}
exports.UpdateCommentCommand = UpdateCommentCommand;
//# sourceMappingURL=update-comment.command.js.map