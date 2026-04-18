export declare class UpdateCommentCommand {
    readonly commentId: string;
    readonly userId: string;
    readonly content: string;
    readonly roleLevel: number;
    constructor(commentId: string, userId: string, content: string, roleLevel?: number);
}
