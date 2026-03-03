export class SoftDeleteUserCommand {
  constructor(
    public readonly userId: string,
    public readonly deletedById: string,
  ) {}
}
