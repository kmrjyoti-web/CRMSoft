export class AllocateLeadCommand {
  constructor(
    public readonly leadId: string,
    public readonly allocatedToId: string,
  ) {}
}
