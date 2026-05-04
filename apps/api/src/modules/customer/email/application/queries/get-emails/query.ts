export class GetEmailsQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly accountId?: string,
    public readonly direction?: string,
    public readonly status?: string,
    public readonly isStarred?: boolean,
    public readonly isRead?: boolean,
  ) {}
}
