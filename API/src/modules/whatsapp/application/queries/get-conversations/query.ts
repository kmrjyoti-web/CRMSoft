export class GetConversationsQuery {
  constructor(
    public readonly wabaId: string,
    public readonly page: number,
    public readonly limit: number,
    public readonly status?: string,
    public readonly assignedToId?: string,
    public readonly search?: string,
  ) {}
}
