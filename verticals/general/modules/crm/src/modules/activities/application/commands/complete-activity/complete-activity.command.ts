export class CompleteActivityCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly outcome?: string,
  ) {}
}
