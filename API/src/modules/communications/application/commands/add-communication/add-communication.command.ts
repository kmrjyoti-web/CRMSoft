export class AddCommunicationCommand {
  constructor(
    public readonly type: string,
    public readonly value: string,
    public readonly priorityType?: string,
    public readonly isPrimary?: boolean,
    public readonly label?: string,
    public readonly rawContactId?: string,
    public readonly contactId?: string,
    public readonly organizationId?: string,
    public readonly leadId?: string,
  ) {}
}
