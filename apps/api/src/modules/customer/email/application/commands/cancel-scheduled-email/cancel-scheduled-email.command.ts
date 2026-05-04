export class CancelScheduledEmailCommand {
  constructor(
    public readonly emailId: string,
    public readonly userId: string,
  ) {}
}
