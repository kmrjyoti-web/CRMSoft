export class GetQuickRepliesQuery {
  constructor(
    public readonly wabaId: string,
    public readonly category?: string,
  ) {}
}
