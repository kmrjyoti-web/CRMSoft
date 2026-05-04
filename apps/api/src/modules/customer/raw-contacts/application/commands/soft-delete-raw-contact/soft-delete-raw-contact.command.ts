export class SoftDeleteRawContactCommand {
  constructor(
    public readonly rawContactId: string,
    public readonly deletedById: string,
  ) {}
}
