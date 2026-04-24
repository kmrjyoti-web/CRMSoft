export class SoftDeleteContactCommand {
  constructor(
    public readonly contactId: string,
    public readonly deletedById: string,
  ) {}
}
