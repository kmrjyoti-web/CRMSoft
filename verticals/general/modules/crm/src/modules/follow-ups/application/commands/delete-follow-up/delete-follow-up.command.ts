export class DeleteFollowUpCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
