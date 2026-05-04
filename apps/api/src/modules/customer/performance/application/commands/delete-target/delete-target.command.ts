export class DeleteTargetCommand {
  constructor(
    public readonly id: string,
    public readonly deletedById: string,
  ) {}
}
