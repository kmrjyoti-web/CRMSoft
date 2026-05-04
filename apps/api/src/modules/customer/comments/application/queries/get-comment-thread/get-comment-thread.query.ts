export class GetCommentThreadQuery {
  constructor(
    public readonly parentId: string,
    public readonly userId: string,
    public readonly roleLevel: number,
  ) {}
}
