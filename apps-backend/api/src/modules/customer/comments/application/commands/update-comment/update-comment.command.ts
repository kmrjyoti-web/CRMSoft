export class UpdateCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
    public readonly content: string,
    public readonly roleLevel: number = 5,
  ) {}
}
