export class VerifyRawContactCommand {
  constructor(
    public readonly rawContactId: string,
    public readonly verifiedById: string,
    public readonly organizationId?: string,
    public readonly contactOrgRelationType?: string,
  ) {}
}
