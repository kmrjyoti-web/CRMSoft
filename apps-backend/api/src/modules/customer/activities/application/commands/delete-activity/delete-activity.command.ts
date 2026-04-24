export class DeleteActivityCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
