export class GetOrgsByContactQuery {
  constructor(
    public readonly contactId: string,
    public readonly activeOnly?: boolean,
  ) {}
}
