export class OptOutContactCommand {
  constructor(
    public readonly wabaId: string,
    public readonly phoneNumber: string,
    public readonly contactId?: string,
    public readonly reason?: string,
  ) {}
}
