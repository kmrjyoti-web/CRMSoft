export class GetContactsByOrgQuery {
  constructor(
    public readonly organizationId: string,
    public readonly activeOnly?: boolean,
  ) {}
}
